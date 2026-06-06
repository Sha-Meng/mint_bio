import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_PATH = path.join(__dirname, ".env.migration");
const APPLY = process.argv.includes("--apply");

const products = [
  {
    name: "无豆粕日粮解决方案",
    advantages: ["豆粕减量替代", "精准营养供给", "显著降本增效", "降氮减排环保"],
    applications: "养殖业",
  },
  {
    name: "生物合成组氨酸",
    advantages: ["自研高效菌株", "绿色生物发酵", "产品纯度高", "工艺路线先进"],
    applications: "食品｜医药｜化妆品｜饲料",
  },
  {
    name: "生物合成异亮氨酸",
    advantages: ["发酵效率高", "规模化成本优势", "产品品质稳定", "稳定供应能力"],
    applications: "饲料添加剂｜食品添加剂",
  },
  {
    name: "PiX生物可降解地膜",
    advantages: ["综合性能优异", "降解周期可控", "适配机械化作业", "适配复杂气候环境", "节水保墒性强"],
    applications: "经济作物｜设施农业｜规模化种植｜绿色农业",
  },
  {
    name: "PiX生物可降解纤维",
    advantages: ["生物基含量可调", "本征抗菌", "亲肤柔软", "染色性能优", "兼容常规纺织工艺", "OEKO-TEX® STANDARD 100认证"],
    applications: "服装面料｜母婴纺织｜家纺｜一次性卫生用品",
  },
  {
    name: "PiX生物可降解包装",
    advantages: ["耐拉扯", "耐穿刺", "不易渗漏", "综合性能稳定"],
    applications: "快递包装｜购物袋｜环保包装｜礼品包装",
  },
  {
    name: "PiX生物可降解注塑材料",
    advantages: ["适用性广", "强度高"],
    applications: "日化用品｜文具玩具｜一次性餐具",
  },
  {
    name: "PiX生物可降解3D打印材料",
    advantages: ["韧性表现优", "耐高温性能提升", "打印效率高", "加工适配性强", "规模化成本优势"],
    applications: "文创教育｜工业设计｜汽车制造｜机器人研发｜定制化打印",
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

function productEntries() {
  const entries = [];
  products.forEach((product, productIndex) => {
    entries.push({
      key_path: `products.list.${productIndex}.name`,
      group: "products",
      label: `首页产品矩阵-${productIndex + 1}-名称`,
      value_zh: product.name,
      value_en: "",
      enabled: true,
    });
    product.advantages.forEach((advantage, advantageIndex) => {
      entries.push({
        key_path: `products.list.${productIndex}.advantages.${advantageIndex}`,
        group: "products",
        label: `首页产品矩阵-${productIndex + 1}-优势${advantageIndex + 1}`,
        value_zh: advantage,
        value_en: "",
        enabled: true,
      });
    });
    entries.push({
      key_path: `products.list.${productIndex}.applications`,
      group: "products",
      label: `首页产品矩阵-${productIndex + 1}-应用领域`,
      value_zh: product.applications,
      value_en: "",
      enabled: true,
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
    fields: "id,key_path,value_zh,value_en,enabled",
    limit: "-1",
    sort: "key_path",
  });
  qs.set("filter[key_path][_starts_with]", "products.list");
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
  const desired = productEntries();
  const desiredByKey = new Map(desired.map((entry) => [entry.key_path, entry]));
  const existingByKey = new Map(existing.map((entry) => [entry.key_path, entry]));
  const creates = [];
  const updates = [];
  const disables = [];

  desired.forEach((entry) => {
    const existingEntry = existingByKey.get(entry.key_path);
    if (!existingEntry) {
      creates.push(entry);
      return;
    }
    if (
      existingEntry.value_zh !== entry.value_zh ||
      existingEntry.value_en !== entry.value_en ||
      existingEntry.enabled !== entry.enabled
    ) {
      updates.push({ id: existingEntry.id, ...entry });
    }
  });

  existing.forEach((entry) => {
    if (!entry.enabled) return;
    if (!entry.key_path.match(/^products\.list\.\d+\.advantages\.\d+$/)) return;
    if (!desiredByKey.has(entry.key_path)) {
      disables.push({ id: entry.id, key_path: entry.key_path, enabled: false });
    }
  });

  return { desired, creates, updates, disables };
}

async function applyPlan(env, plan, settings) {
  const hasChanges = plan.creates.length || plan.updates.length || plan.disables.length;
  if (!hasChanges) {
    console.log("No Directus changes to apply; content_version was not changed.");
    return;
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
  for (const entry of plan.disables) {
    await directusFetch(env, `/items/site_i18n_entries/${entry.id}`, {
      method: "PATCH",
      body: JSON.stringify({ enabled: false }),
    });
  }
  await directusFetch(env, `/items/site_i18n_settings/${settings.id}`, {
    method: "PATCH",
    body: JSON.stringify({ content_version: Number(settings.content_version || 0) + 1 }),
  });
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
    create_keys: plan.creates.map((entry) => entry.key_path),
    update_keys: plan.updates.map((entry) => entry.key_path),
    disable_keys: plan.disables.map((entry) => entry.key_path),
  }, null, 2));

  if (APPLY) {
    await applyPlan(env, plan, settings);
    console.log("Applied homepage product matrix update.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
