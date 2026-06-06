import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_PATH = path.join(__dirname, ".env.migration");
const APPLY = process.argv.includes("--apply");

const introEntries = [
  {
    key_path: "corporate.intro1",
    group: "corporate",
    label: "元素驱动（杭州）生物科技有限公司（以下简称“元素驱动”）是西湖大学重点孵化的一家合成生物领域平台型科技企业…",
    value_zh: "元素驱动（杭州）生物科技有限公司（以下简称“元素驱动”）是西湖大学重点孵化的一家合成生物领域平台型科技企业，成立于2021年，总部位于浙江杭州。",
  },
  {
    key_path: "corporate.intro2",
    group: "corporate",
    label: "公司依托创始人、科学顾问委员会主席张科春教授团队在合成生物、酶工程、生物材料等领域的长期科研积累…",
    value_zh: "公司依托创始人、科学顾问委员会主席张科春教授团队在合成生物、酶工程、生物材料等领域的长期科研积累，自主研发多学科深度融合的“AI+生物制造”平台——MiNT X Platform，构建起覆盖技术研发、工程放大、生产制造与产业应用的全链条生物智造体系。",
  },
  {
    key_path: "corporate.intro3",
    group: "corporate",
    label: "元素驱动重点布局绿色生物合成氨基酸与全生命周期低碳未来材料两大业务方向，面向动物营养、食品健康…",
    value_zh: "元素驱动重点布局绿色生物合成氨基酸与全生命周期低碳未来材料两大业务方向，面向动物营养、食品健康、医药美妆、农业种植、纺织纤维、包装材料、化工材料、汽车部件及未来制造等领域，提供绿色生物制造产品与解决方案。公司已在河南、浙江布局两大生物智造基地，持续推动科研成果向产业化应用转化。",
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
  qs.set("filter[key_path][_in]", introEntries.map((entry) => entry.key_path).join(","));
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

  introEntries.forEach((entry) => {
    const existingEntry = existingByKey.get(entry.key_path);
    if (!existingEntry) {
      creates.push({ ...entry, value_en: "", enabled: true });
      return;
    }
    if (
      existingEntry.value_zh !== entry.value_zh ||
      existingEntry.label !== entry.label ||
      existingEntry.enabled !== true
    ) {
      updates.push({
        id: existingEntry.id,
        key_path: entry.key_path,
        group: entry.group,
        label: entry.label,
        value_zh: entry.value_zh,
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
    desired_entries: introEntries.length,
    creates: plan.creates.length,
    updates: plan.updates.length,
    create_keys: plan.creates.map((entry) => entry.key_path),
    update_keys: plan.updates.map((entry) => entry.key_path),
  }, null, 2));

  if (APPLY) {
    const changed = await applyPlan(env, plan, settings);
    if (changed) console.log("Applied corporate intro update.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
