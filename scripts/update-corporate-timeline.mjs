import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_PATH = path.join(__dirname, ".env.migration");
const APPLY = process.argv.includes("--apply");

const timeline = [
  { year: "2021", desc: "元素驱动成立于杭州" },
  { year: "2023.05", desc: "与牧原集团达成战略合作，推动生物制造氨基酸产业化应用" },
  { year: "2023.08", desc: "与商汤科技达成战略合作，推进AI+合成生物融合创新" },
  { year: "2024.01", desc: "与牧原集团合资成立牧元安粮" },
  { year: "2024.04", desc: "首次获评杭州市准独角兽企业" },
  { year: "2024.06", desc: "与建德市签约年产15万吨元素新材料项目，打造生物降解材料全产业链标杆。" },
  { year: "2024.12", desc: "完成A轮融资" },
  { year: "2025.02", desc: "获评浙江省专精特新中小企业" },
  { year: "2025.06", desc: "牧元安粮工厂正式试产、元素智造工厂结顶" },
  { year: "2025.09", desc: "元素智造项目入选浙江省“415X”强链补链项目" },
  { year: "2025.12", desc: "获评浙江省企业研究院、国家高新技术企业、浙江省科技新小龙企业" },
  { year: "2026.04", desc: "入选浙江省未来独角兽企业" },
];

const timelineEntries = timeline.flatMap((item, index) => [
  {
    key_path: `corporate.timeline.${index}.year`,
    group: "corporate",
    label: item.year,
    value_zh: item.year,
  },
  {
    key_path: `corporate.timeline.${index}.desc`,
    group: "corporate",
    label: item.desc,
    value_zh: item.desc,
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
  qs.set("filter[key_path][_in]", timelineEntries.map((entry) => entry.key_path).join(","));
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

  timelineEntries.forEach((entry) => {
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
    desired_entries: timelineEntries.length,
    creates: plan.creates.length,
    updates: plan.updates.length,
    create_keys: plan.creates.map((entry) => entry.key_path),
    update_keys: plan.updates.map((entry) => entry.key_path),
  }, null, 2));

  if (APPLY) {
    const changed = await applyPlan(env, plan, settings);
    if (changed) console.log("Applied corporate timeline update.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
