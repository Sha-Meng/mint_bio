import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const ENV_PATH = path.join(__dirname, ".env.migration");
const APPLY = process.argv.includes("--apply");
const SYNC_LOCAL = process.argv.includes("--sync-local");

const productList = [
  {
    fullName: "无豆粕日粮解决方案",
    prefix: "无豆粕日粮",
    name: "解决方案",
    fields: ["养殖业"],
    advantages: ["豆粕减量替代", "精准营养供给", "显著降本增效", "降氮减排环保"],
    imageUrl: "https://cms.mint-bio.cn/assets/7ee7c999-1276-4af2-88b5-eecb90965300?key=system-large-contain&v=2026-05-05T14%3A17%3A10.000Z",
  },
  {
    fullName: "生物合成组氨酸",
    prefix: "生物合成",
    name: "组氨酸",
    fields: ["食品", "医药", "化妆品", "饲料"],
    advantages: ["自研高效菌株", "绿色生物发酵", "产品纯度高", "工艺路线先进"],
    imageUrl: "assets/images/product-histidine.png",
  },
  {
    fullName: "生物合成异亮氨酸",
    prefix: "生物合成",
    name: "异亮氨酸",
    fields: ["饲料添加剂", "食品添加剂"],
    advantages: ["发酵效率高", "规模化成本优势", "产品品质稳定", "稳定供应能力"],
    imageUrl: "assets/images/product-isoleucine.png",
  },
];

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

function entry(keyPath, value) {
  return {
    key_path: keyPath,
    group: "aminoAcid",
    label: value,
    value_zh: value,
    value_en: "",
    enabled: true,
  };
}

function desiredEntries() {
  const entries = [];
  productList.forEach((product, index) => {
    ["fullName", "prefix", "name", "imageUrl"].forEach((field) => {
      entries.push(entry(`aminoAcid.productList.${index}.${field}`, product[field]));
    });
    ["fields", "advantages"].forEach((field) => {
      product[field].forEach((value, valueIndex) => {
        entries.push(entry(`aminoAcid.productList.${index}.${field}.${valueIndex}`, value));
      });
    });
  });
  return entries;
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
  qs.set("filter[key_path][_starts_with]", "aminoAcid.productList.");
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
  const desired = desiredEntries();
  const desiredByKey = new Map(desired.map((item) => [item.key_path, item]));
  const existingByKey = new Map(existing.map((item) => [item.key_path, item]));
  const creates = [];
  const updates = [];
  const disables = [];

  desired.forEach((item) => {
    const current = existingByKey.get(item.key_path);
    if (!current) {
      creates.push(item);
      return;
    }
    if (
      current.value_zh !== item.value_zh ||
      current.value_en !== item.value_en ||
      current.label !== item.label ||
      current.enabled !== item.enabled
    ) {
      updates.push({ id: current.id, ...item });
    }
  });

  existing.forEach((item) => {
    if (!item.enabled) return;
    if (!desiredByKey.has(item.key_path)) {
      disables.push({ id: item.id, key_path: item.key_path, enabled: false });
    }
  });

  return { desired, creates, updates, disables };
}

async function applyPlan(env, plan, settings) {
  const hasChanges = plan.creates.length || plan.updates.length || plan.disables.length;
  if (!hasChanges) {
    console.log("No Directus changes to apply; content_version was not changed.");
    return false;
  }

  for (const item of plan.creates) {
    await directusFetch(env, "/items/site_i18n_entries", {
      method: "POST",
      body: JSON.stringify(item),
    });
  }
  for (const item of plan.updates) {
    const { id, ...payload } = item;
    await directusFetch(env, `/items/site_i18n_entries/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }
  for (const item of plan.disables) {
    await directusFetch(env, `/items/site_i18n_entries/${item.id}`, {
      method: "PATCH",
      body: JSON.stringify({ enabled: false }),
    });
  }
  await directusFetch(env, `/items/site_i18n_settings/${settings.id}`, {
    method: "PATCH",
    body: JSON.stringify({ content_version: Number(settings.content_version || 0) + 1 }),
  });
  return true;
}

function syncLocalFallback() {
  ["zh-CN.json", "en-US.json"].forEach((fileName) => {
    const filePath = path.join(ROOT_DIR, "src", "i18n", fileName);
    const resource = JSON.parse(fs.readFileSync(filePath, "utf8"));
    resource.aminoAcid.productList = productList;
    fs.writeFileSync(filePath, `${JSON.stringify(resource, null, 2)}\n`, "utf8");
  });
}

async function main() {
  if (SYNC_LOCAL) {
    syncLocalFallback();
    console.log("Synced local aminoAcid.productList fallback.");
    return;
  }

  const env = loadEnv();
  const [existing, settings] = await Promise.all([fetchExistingEntries(env), fetchSettings(env)]);
  const plan = buildPlan(existing);
  console.log(JSON.stringify({
    mode: APPLY ? "apply" : "dry-run",
    current_content_version: settings.content_version,
    next_content_version: Number(settings.content_version || 0) + 1,
    desired_entries: plan.desired.length,
    creates: plan.creates.length,
    updates: plan.updates.length,
    disables: plan.disables.length,
    create_keys: plan.creates.map((item) => item.key_path),
    update_keys: plan.updates.map((item) => item.key_path),
    disable_keys: plan.disables.map((item) => item.key_path),
  }, null, 2));

  if (APPLY) {
    const changed = await applyPlan(env, plan, settings);
    if (changed) console.log("Applied amino acid product cards update.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
