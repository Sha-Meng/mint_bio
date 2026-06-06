import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_PATH = path.join(__dirname, ".env.migration");
const APPLY = process.argv.includes("--apply");

const honors = [
  { line1: "", line2: "国家高新技术企业" },
  { line1: "浙江省", line2: "“科技新小龙”" },
  { line1: "浙江省", line2: "企业研究院" },
  { line1: "浙江省", line2: "专精特新中小企业" },
  { line1: "浙江省", line2: "未来独角兽企业" },
  { line1: "杭州市", line2: "准独角兽榜单企业（2023–2026）" },
  { line1: "浙江省", line2: "创新型中小企业" },
  { line1: "浙江省", line2: "科技型中小企业" },
  { line1: "杭州市高新技术", line2: "企业研发中心" },
  { line1: "杭州市", line2: "新雏鹰企业" },
  { line1: "杭州市西湖区", line2: "高校经济新锐企业" },
  { line1: "西湖区", line2: "高校经济标杆项目" },
];

const honorEntries = honors.flatMap((item, index) => [
  {
    key_path: `corporate.honors.${index}.line1`,
    group: "corporate",
    label: `荣誉墙 ${index + 1} 第一行`,
    value_zh: item.line1,
    value_en: "",
  },
  {
    key_path: `corporate.honors.${index}.line2`,
    group: "corporate",
    label: `荣誉墙 ${index + 1} 第二行`,
    value_zh: item.line2,
    value_en: "",
  },
]);

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
  const response = await fetch(`${env.url}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${env.token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Directus request failed ${response.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

async function fetchExistingEntries(env) {
  const qs = new URLSearchParams({
    fields: "id,key_path,value_zh,value_en,label,enabled",
    limit: "-1",
    sort: "key_path",
  });
  qs.set("filter[key_path][_in]", honorEntries.map((entry) => entry.key_path).join(","));
  const body = await directusFetch(env, `/items/site_i18n_entries?${qs}`);
  return body.data || [];
}

async function fetchSettings(env) {
  const body = await directusFetch(env, "/items/site_i18n_settings?fields=id,content_version&limit=1");
  const item = body.data?.[0];
  if (!item?.id) throw new Error("No site_i18n_settings row found.");
  return item;
}

function buildPlan(existing) {
  const existingByKey = new Map(existing.map((entry) => [entry.key_path, entry]));
  const creates = [];
  const updates = [];

  honorEntries.forEach((entry) => {
    const existingEntry = existingByKey.get(entry.key_path);
    if (!existingEntry) {
      creates.push({ ...entry, enabled: true });
      return;
    }
    if (
      existingEntry.value_zh !== entry.value_zh ||
      existingEntry.value_en !== entry.value_en ||
      existingEntry.label !== entry.label ||
      existingEntry.enabled !== true
    ) {
      updates.push({
        id: existingEntry.id,
        key_path: entry.key_path,
        group: entry.group,
        label: entry.label,
        value_zh: entry.value_zh,
        value_en: entry.value_en,
        enabled: true,
      });
    }
  });

  return { creates, updates };
}

async function applyPlan(env, plan, settings) {
  const hasChanges = plan.creates.length || plan.updates.length;
  if (!hasChanges) {
    console.log("No Directus changes to apply; content_version was not changed.");
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
  const [existing, settings] = await Promise.all([fetchExistingEntries(env), fetchSettings(env)]);
  const plan = buildPlan(existing);
  console.log(JSON.stringify({
    mode: APPLY ? "apply" : "dry-run",
    current_content_version: settings.content_version,
    next_content_version: Number(settings.content_version || 0) + 1,
    desired_entries: honorEntries.length,
    creates: plan.creates.length,
    updates: plan.updates.length,
    create_keys: plan.creates.map((entry) => entry.key_path),
    update_keys: plan.updates.map((entry) => entry.key_path),
  }, null, 2));

  if (APPLY) {
    const changed = await applyPlan(env, plan, settings);
    if (changed) console.log("Applied corporate honors update.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
