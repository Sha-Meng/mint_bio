import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_PATH = path.join(__dirname, ".env.migration");
const APPLY = process.argv.includes("--apply");

const titles = {
  faq: "常见",
  faq2: "问",
  faq3: "题",
};

const faqs = [
  {
    question: "元素驱动氨基酸产品的核心优势是什么？",
    answer: "基于生物制造路线与自主发酵工艺，元素驱动持续优化发酵效率、产品纯度及规模化生产能力，在成本控制与稳定供应方面形成综合优势。",
  },
  {
    question: "氨基酸产品可以应用于哪些领域？",
    answer: "目前产品可覆盖食品、医药、化妆品、饲料添加剂及化学制剂等多个方向，并可根据不同应用需求提供对应规格产品。",
  },
  {
    question: "生物制造氨基酸与传统化学合成路线有什么区别？",
    answer: "生物制造路线以微生物发酵为核心，可直接获得目标L构型氨基酸，减少传统化学路线中构型拆分和后处理环节，在产品纯度、工艺效率和可持续性方面具备优势，更适配食品、医药、化妆品、动物营养等多元应用场景。",
  },
  {
    question: "元素驱动氨基酸产品是否支持规模化稳定供应？",
    answer: "公司持续推进工程化与产业化能力建设，形成从研发到规模化生产的能力体系，可满足不同场景下的产品供应需求。",
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
  const entries = [
    entry("aminoAcid.faq", titles.faq),
    entry("aminoAcid.faq2", titles.faq2),
    entry("aminoAcid.faq3", titles.faq3),
  ];
  faqs.forEach((faq, index) => {
    entries.push(entry(`aminoAcid.faqList.${index}.question`, faq.question));
    entries.push(entry(`aminoAcid.faqList.${index}.answer`, faq.answer));
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
  qs.set("filter[_or][0][key_path][_eq]", "aminoAcid.faq");
  qs.set("filter[_or][1][key_path][_eq]", "aminoAcid.faq2");
  qs.set("filter[_or][2][key_path][_eq]", "aminoAcid.faq3");
  qs.set("filter[_or][3][key_path][_starts_with]", "aminoAcid.faqList.");
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
      current.enabled !== item.enabled
    ) {
      updates.push({ id: current.id, ...item });
    }
  });

  existing.forEach((item) => {
    if (!item.enabled) return;
    if (!item.key_path.startsWith("aminoAcid.faqList.")) return;
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
    if (changed) console.log("Applied amino acid FAQ update.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
