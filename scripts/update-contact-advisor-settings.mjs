import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const ENV_PATH = path.join(__dirname, ".env.migration");
const APPLY = process.argv.includes("--apply");

const qrFiles = {
  aminoAcid: {
    path: path.join(REPO_ROOT, "src/assets/images/advisor-amino-qr.png"),
    filename: "advisor-amino-qr.png",
    title: "Contact Advisor QR - Amino Acid",
  },
  materials: {
    path: path.join(REPO_ROOT, "src/assets/images/advisor-material-qr.png"),
    filename: "advisor-material-qr.png",
    title: "Contact Advisor QR - New Materials",
  },
};

function loadEnv() {
  const env = {};
  if (fs.existsSync(ENV_PATH)) {
    fs.readFileSync(ENV_PATH, "utf8").split(/\r?\n/).forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) env[match[1]] = match[2];
    });
  }

  const url = process.env.DIRECTUS_URL || env.DIRECTUS_URL;
  const token = process.env.DIRECTUS_TOKEN || env.DIRECTUS_TOKEN;
  if (!url || !token) {
    throw new Error("Missing DIRECTUS_URL / DIRECTUS_TOKEN. Configure scripts/.env.migration or environment variables.");
  }
  return { url: url.replace(/\/$/, ""), token };
}

async function directusFetch(env, endpoint, options = {}) {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${env.url}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${env.token}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Directus request failed ${response.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

async function uploadQrFile(env, fileConfig) {
  const buffer = fs.readFileSync(fileConfig.path);
  const form = new FormData();
  form.append("file", new Blob([buffer], { type: "image/png" }), fileConfig.filename);
  form.append("title", fileConfig.title);

  const body = await directusFetch(env, "/files", {
    method: "POST",
    body: form,
  });
  const id = body.data?.id;
  if (!id) throw new Error(`Directus file upload returned no id for ${fileConfig.filename}`);
  return id;
}

async function fetchEntries(env, keyPaths) {
  const qs = new URLSearchParams({
    fields: "id,key_path,value_zh,value_en,label,enabled",
    limit: "-1",
    sort: "key_path",
  });
  qs.set("filter[key_path][_in]", keyPaths.join(","));
  const body = await directusFetch(env, `/items/site_i18n_entries?${qs}`);
  return body.data || [];
}

async function fetchSettings(env) {
  const body = await directusFetch(env, "/items/site_i18n_settings?fields=id,content_version&limit=1");
  const item = body.data?.[0];
  if (!item?.id) throw new Error("No site_i18n_settings row found.");
  return item;
}

function desiredEntries(qrFileIds) {
  return [
    {
      key_path: "contact.advisorConfig.aminoAcid.phone",
      group: "contact",
      label: "Amino acid product advisor phone",
      value_zh: "15268103254",
      value_en: "15268103254",
      enabled: true,
    },
    {
      key_path: "contact.advisorConfig.aminoAcid.qrFileId",
      group: "contact",
      label: "Amino acid product advisor QR Directus file ID",
      value_zh: qrFileIds.aminoAcid,
      value_en: qrFileIds.aminoAcid,
      enabled: true,
    },
    {
      key_path: "contact.advisorConfig.materials.phone",
      group: "contact",
      label: "New materials product advisor phone",
      value_zh: "15296523218",
      value_en: "15296523218",
      enabled: true,
    },
    {
      key_path: "contact.advisorConfig.materials.qrFileId",
      group: "contact",
      label: "New materials product advisor QR Directus file ID",
      value_zh: qrFileIds.materials,
      value_en: qrFileIds.materials,
      enabled: true,
    },
    {
      key_path: "contact.advisorConfig.footerAdvisor",
      group: "contact",
      label: "Footer advisor key",
      value_zh: "aminoAcid",
      value_en: "aminoAcid",
      enabled: true,
    },
  ];
}

function buildPlan(existing, desired) {
  const existingByKey = new Map(existing.map((entry) => [entry.key_path, entry]));
  const creates = [];
  const updates = [];

  desired.forEach((entry) => {
    const current = existingByKey.get(entry.key_path);
    if (!current) {
      creates.push(entry);
      return;
    }
    if (
      current.value_zh !== entry.value_zh ||
      current.value_en !== entry.value_en ||
      current.label !== entry.label ||
      current.enabled !== entry.enabled
    ) {
      updates.push({ id: current.id, ...entry });
    }
  });

  const emailEntry = existingByKey.get("contact.email");
  if (
    emailEntry &&
    (
      emailEntry.value_zh ||
      emailEntry.value_en ||
      emailEntry.enabled !== false
    )
  ) {
    updates.push({
      id: emailEntry.id,
      key_path: "contact.email",
      group: "contact",
      label: emailEntry.label || "Contact email",
      value_zh: "",
      value_en: "",
      enabled: false,
    });
  }

  return { creates, updates };
}

async function applyPlan(env, plan, settings) {
  const hasChanges = plan.creates.length || plan.updates.length;
  if (!hasChanges) {
    console.log("No Directus entry changes to apply; content_version was not changed.");
    return false;
  }

  for (const entry of plan.creates) {
    await directusFetch(env, "/items/site_i18n_entries", {
      method: "POST",
      body: JSON.stringify(entry),
    });
  }

  for (const entry of plan.updates) {
    const { id, ...payload } = entry;
    await directusFetch(env, `/items/site_i18n_entries/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  await directusFetch(env, `/items/site_i18n_settings/${settings.id}`, {
    method: "PATCH",
    body: JSON.stringify({ content_version: Number(settings.content_version || 0) + 1 }),
  });
  return true;
}

async function main() {
  const env = loadEnv();
  Object.values(qrFiles).forEach((fileConfig) => {
    if (!fs.existsSync(fileConfig.path)) {
      throw new Error(`Missing QR fallback image: ${fileConfig.path}`);
    }
  });

  const qrFileIds = APPLY
    ? {
        aminoAcid: await uploadQrFile(env, qrFiles.aminoAcid),
        materials: await uploadQrFile(env, qrFiles.materials),
      }
    : {
        aminoAcid: "<uploaded-on-apply:advisor-amino-qr.png>",
        materials: "<uploaded-on-apply:advisor-material-qr.png>",
      };

  const desired = desiredEntries(qrFileIds);
  const keyPaths = [...desired.map((entry) => entry.key_path), "contact.email"];
  const [existing, settings] = await Promise.all([
    fetchEntries(env, keyPaths),
    fetchSettings(env),
  ]);
  const plan = buildPlan(existing, desired);

  console.log(JSON.stringify({
    mode: APPLY ? "apply" : "dry-run",
    current_content_version: settings.content_version,
    next_content_version: Number(settings.content_version || 0) + 1,
    uploaded_file_ids: APPLY ? qrFileIds : undefined,
    planned_uploads: APPLY ? undefined : Object.values(qrFiles).map((file) => file.filename),
    creates: plan.creates.length,
    updates: plan.updates.length,
    create_keys: plan.creates.map((entry) => entry.key_path),
    update_keys: plan.updates.map((entry) => entry.key_path),
  }, null, 2));

  if (APPLY) {
    const changed = await applyPlan(env, plan, settings);
    if (changed) console.log("Applied contact advisor Directus settings.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
