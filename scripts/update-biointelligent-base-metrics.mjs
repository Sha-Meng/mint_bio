import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_PATH = path.join(__dirname, ".env.migration");
const APPLY = process.argv.includes("--apply");

const baseMetricEntries = [
  {
    key_path: "bioIntelligent.bases.muyuan.areaMetric",
    group: "bioIntelligent",
    label: "牧元安粮工厂-占地数值",
    value_zh: "126",
    value_en: "126",
  },
  {
    key_path: "bioIntelligent.bases.muyuan.capacity1Metric",
    group: "bioIntelligent",
    label: "牧元安粮工厂-一期年产能数值",
    value_zh: "30,000",
    value_en: "30,000",
  },
  {
    key_path: "bioIntelligent.bases.muyuan.capacity2Metric",
    group: "bioIntelligent",
    label: "牧元安粮工厂-二期年产能数值",
    value_zh: "40,000",
    value_en: "40,000",
  },
  {
    key_path: "bioIntelligent.bases.hq.patentsMetric",
    group: "bioIntelligent",
    label: "元素总部-研发专利数值",
    value_zh: "60+",
    value_en: "60+",
  },
  {
    key_path: "bioIntelligent.bases.hq.teamMetric",
    group: "bioIntelligent",
    label: "元素总部-研发团队数值",
    value_zh: "30+",
    value_en: "30+",
  },
  {
    key_path: "bioIntelligent.bases.hq.rdCenterMetric",
    group: "bioIntelligent",
    label: "元素总部-研发中心面积数值",
    value_zh: "3,000m²+",
    value_en: "3,000m²+",
  },
  {
    key_path: "bioIntelligent.bases.jiande.area1Metric",
    group: "bioIntelligent",
    label: "元素智造工厂-一期占地数值",
    value_zh: "50",
    value_en: "50",
  },
  {
    key_path: "bioIntelligent.bases.jiande.capacity1Metric",
    group: "bioIntelligent",
    label: "元素智造工厂-一期年产能数值",
    value_zh: "30,000",
    value_en: "30,000",
  },
  {
    key_path: "bioIntelligent.bases.jiande.area2Metric",
    group: "bioIntelligent",
    label: "元素智造工厂-二期占地数值",
    value_zh: "70",
    value_en: "70",
  },
  {
    key_path: "bioIntelligent.bases.jiande.capacity2Metric",
    group: "bioIntelligent",
    label: "元素智造工厂-二期年产能数值",
    value_zh: "120,000",
    value_en: "120,000",
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
    fields: "id,key_path,group,label,value_zh,value_en,enabled",
    limit: "-1",
    sort: "key_path",
  });
  qs.set("filter[key_path][_in]", baseMetricEntries.map((entry) => entry.key_path).join(","));
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

  baseMetricEntries.forEach((entry) => {
    const existingEntry = existingByKey.get(entry.key_path);
    if (!existingEntry) {
      creates.push({ ...entry, enabled: true });
      return;
    }

    if (
      existingEntry.group !== entry.group ||
      existingEntry.label !== entry.label ||
      existingEntry.value_zh !== entry.value_zh ||
      existingEntry.value_en !== entry.value_en ||
      existingEntry.enabled !== true
    ) {
      updates.push({
        id: existingEntry.id,
        ...entry,
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
    desired_entries: baseMetricEntries.length,
    creates: plan.creates.length,
    updates: plan.updates.length,
    create_keys: plan.creates.map((entry) => entry.key_path),
    update_keys: plan.updates.map((entry) => entry.key_path),
  }, null, 2));

  if (APPLY) {
    const changed = await applyPlan(env, plan, settings);
    if (changed) console.log("Applied BioIntelligent base metric update.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
