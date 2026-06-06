import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_PATH = path.join(__dirname, ".env.migration");
const APPLY = process.argv.includes("--apply");

const founderEntries = [
  {
    key_path: "corporate.founders.zhang.bio",
    group: "corporate",
    label: "张科春创始人介绍",
    value_zh: "博士毕业于加州理工学院，师从合成生物学领域科学家 David A. Tirrell、Frances H. Arnold（2018年诺贝尔化学奖得主）及 James Liao等；\n从事合成生物相关研究20余年，在AI蛋白设计、酶工程及生物材料等方向具有深厚积累；\n回国前任明尼苏达大学终身教授；2019年加入西湖大学，创建生物制造与新材料实验室，任工学院教授。",
  },
  {
    key_path: "corporate.founders.zhang.achievements.0",
    group: "corporate",
    label: "张科春右侧列表1",
    value_zh: "开发全球首个实现规模化生产的生物降解弹性高分子材料；",
  },
  {
    key_path: "corporate.founders.zhang.achievements.1",
    group: "corporate",
    label: "张科春右侧列表2",
    value_zh: "参与创建全球首个可持续高分子研究中心；",
  },
  {
    key_path: "corporate.founders.zhang.achievements.2",
    group: "corporate",
    label: "张科春右侧列表3",
    value_zh: "在合成生物学、生物材料及酶工程领域持续推动交叉创新与产业转化。",
  },
  {
    key_path: "corporate.founders.liu.bio1",
    group: "corporate",
    label: "刘旻昊创始人介绍上",
    value_zh: "2011年获帝国理工学院生物物理博士学位；\n2012年于清华大学从事博士后研究，2016年起任清华助理研究员；",
  },
  {
    key_path: "corporate.founders.liu.bio2",
    group: "corporate",
    label: "刘旻昊创始人介绍下",
    value_zh: "曾任北京市结构生物学高精尖中心副主任、行政办公室主任；\n2014年起深度参与西湖大学筹建，历任筹委会办公室主任、校董会秘书、校长助理、西湖教育基金会创始秘书长等职务。",
  },
  {
    key_path: "corporate.achievements.0",
    group: "corporate",
    label: "刘旻昊右侧列表1",
    value_zh: "深度参与西湖大学从0到1建设，推动科研、教育与产业资源协同；",
  },
  {
    key_path: "corporate.achievements.1",
    group: "corporate",
    label: "刘旻昊右侧列表2",
    value_zh: "发起新质生产力平台与未来产业孵化体系，推动科技成果产业化落地；",
  },
  {
    key_path: "corporate.achievements.2",
    group: "corporate",
    label: "刘旻昊右侧列表3",
    value_zh: "长期推动产学研合作与创新生态建设，促进科技创新与产业发展融合；",
  },
  {
    key_path: "corporate.achievements.3",
    group: "corporate",
    label: "刘旻昊右侧列表4",
    value_zh: "持续推动公益与科研支持项目建设，为青年科学家与创新团队提供发展平台。",
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
  qs.set("filter[key_path][_in]", founderEntries.map((entry) => entry.key_path).join(","));
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

  founderEntries.forEach((entry) => {
    const existingEntry = existingByKey.get(entry.key_path);
    const desiredEnabled = entry.enabled !== false;
    if (!existingEntry) {
      creates.push({ ...entry, value_en: "", enabled: desiredEnabled });
      return;
    }
    if (
      existingEntry.value_zh !== entry.value_zh ||
      existingEntry.label !== entry.label ||
      existingEntry.enabled !== desiredEnabled
    ) {
      updates.push({
        id: existingEntry.id,
        key_path: entry.key_path,
        group: entry.group,
        label: entry.label,
        value_zh: entry.value_zh,
        enabled: desiredEnabled,
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
    desired_entries: founderEntries.length,
    creates: plan.creates.length,
    updates: plan.updates.length,
    create_keys: plan.creates.map((entry) => entry.key_path),
    update_keys: plan.updates.map((entry) => entry.key_path),
  }, null, 2));

  if (APPLY) {
    const changed = await applyPlan(env, plan, settings);
    if (changed) console.log("Applied corporate founders update.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
