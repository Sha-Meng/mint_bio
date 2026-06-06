import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_PATH = path.join(__dirname, ".env.migration");
const APPLY = process.argv.includes("--apply");

const moduleCards = [
  { title: "PiX生物可降解地膜", shortName: "生物可降解地膜" },
  { title: "PiX生物可降解纤维", shortName: "生物可降解纤维" },
  { title: "PiX生物可降解包装", shortName: "生物可降解包装" },
  { title: "PiX生物可降解注塑材料", shortName: "生物可降解注塑材料" },
  { title: "PiX生物可降解3D打印材料", shortName: "生物可降解3D打印材料" },
];

const categories = [
  {
    title: ["经济作物", "设施农业", "规模化种植", "绿色农业"],
    advantages: ["综合性能优异", "降解周期可控", "适配机械化作业", "适配复杂气候环境", "节水保墒性强"],
    items: ["PiX生物可降解地膜"],
  },
  {
    title: ["服装面料", "母婴纺织", "家纺", "一次性卫生用品"],
    advantages: ["生物基含量可调", "本征抗菌", "亲肤柔软", "染色性能优", "兼容常规纺织工艺", "OEKO-TEX® STANDARD 100认证"],
    items: ["PiX生物可降解纤维"],
  },
  {
    title: ["快递包装", "购物袋", "环保包装", "礼品包装"],
    advantages: ["耐拉扯", "耐穿刺", "不易渗漏", "综合性能稳定"],
    items: ["PiX生物可降解包装"],
  },
  {
    title: ["日化用品", "文具玩具", "一次性餐具"],
    advantages: ["适用性广", "强度高"],
    items: ["PiX生物可降解注塑材料"],
  },
  {
    title: ["文创教育", "工业设计", "汽车制造", "机器人研发", "定制化打印"],
    advantages: ["韧性表现优", "耐高温性能提升", "打印效率高", "加工适配性强", "规模化成本优势"],
    items: ["PiX生物可降解3D打印材料"],
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
    group: "newMaterial",
    label: value,
    value_zh: value,
    value_en: "",
    enabled: true,
  };
}

function desiredEntries() {
  const entries = [];
  moduleCards.forEach((card, index) => {
    entries.push(entry(`newMaterial.moduleCards.${index}.title`, card.title));
    entries.push(entry(`newMaterial.moduleCards.${index}.shortName`, card.shortName));
  });
  categories.forEach((category, categoryIndex) => {
    ["title", "advantages", "items"].forEach((field) => {
      category[field].forEach((value, valueIndex) => {
        entries.push(entry(`newMaterial.categories.${categoryIndex}.${field}.${valueIndex}`, value));
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
  qs.set("filter[_or][0][key_path][_starts_with]", "newMaterial.moduleCards.");
  qs.set("filter[_or][1][key_path][_starts_with]", "newMaterial.categories.");
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

async function main() {
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
    if (changed) console.log("Applied new material product cards update.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
