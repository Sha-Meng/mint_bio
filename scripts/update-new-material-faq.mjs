import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_PATH = path.join(__dirname, ".env.migration");
const APPLY = process.argv.includes("--apply");

const faqs = [
  {
    question: "PiX 材料的原料来源是什么？",
    answer: "PiX是元素驱动自主研发的全生命周期低碳未来材料，基于自研生物基核心单体，可结合非粮生物质等开发生物基、可降解及可回收等不同方向材料。<br>材料生物基含量可根据不同应用方向进行调控，最高可达100%。",
  },
  {
    question: "PiX 新材料的生产过程绿色、无毒、环保吗？",
    answer: "是的。PiX材料源自生物发酵，从源头节碳减排。在生产过程中，利用了独创的合成工艺，亦无有毒有害气体、副产排出。",
  },
  {
    question: "PiX 材料如何实现降解？",
    answer: "PiX材料主要采用堆肥降解路线。<br>在微生物、高温高湿及自然老化等条件下，材料可逐步实现降解，并可根据不同应用需求对降解周期进行调控。",
  },
  {
    question: "PiX 材料的成本优势体现在哪些方面？",
    answer: "PiX材料采用自主合成工艺，通过降低原料消耗、优化能耗结构及减少副产生成，实现更高的生产效率与成本控制能力。<br>同时，材料体系兼容性强，可结合竹粉、木浆等不同环保材料进行复配开发，满足不同场景下的性能与成本需求。",
  },
  {
    question: "PiX 材料与传统石油基材料有哪些区别？",
    answer: "PiX材料的核心单体基于生物制造路线开发，在原料来源、生产方式及材料生命周期等方面，与传统石油基材料存在差异。<br>材料可根据应用需求实现生物基、可降解及性能调控等不同方向组合，兼顾功能表现与可持续需求。",
  },
  {
    question: "PiX 材料可以应用在哪些领域？",
    answer: "PiX材料可面向农业、纺织、包装、消费品、工业制造等多个领域进行应用开发。<br>未来，随着技术进一步迭代，可进一步拓展至未来制造相关场景。",
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
  faqs.forEach((faq, index) => {
    entries.push(entry(`newMaterial.faqList.${index}.question`, faq.question));
    entries.push(entry(`newMaterial.faqList.${index}.answer`, faq.answer));
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
  qs.set("filter[key_path][_starts_with]", "newMaterial.faqList.");
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
    if (changed) console.log("Applied new material FAQ update.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
