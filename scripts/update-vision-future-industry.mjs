import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_PATH = path.join(__dirname, ".env.migration");
const APPLY = process.argv.includes("--apply");
const SYNC_LOCAL = process.argv.includes("--sync-local");
const LOCAL_I18N_PATHS = [
  path.join(__dirname, "..", "src", "i18n", "zh-CN.json"),
  path.join(__dirname, "..", "src", "i18n", "en-US.json"),
];

const visionEntries = [
  {
    key_path: "vision.respond",
    group: "vision",
    label: "企业愿景政策模块标题前半",
    value_zh: "面向",
  },
  {
    key_path: "vision.call",
    group: "vision",
    label: "企业愿景政策模块标题后半",
    value_zh: "未来产业",
  },
  {
    key_path: "vision.nationalPolicy",
    group: "vision",
    label: "企业愿景政策模块说明",
    value_zh: "生物制造已被纳入国家”十五五“未来产业重点方向，正成为绿色制造与未来产业发展的重要基础能力。",
  },
  {
    key_path: "vision.policies.0.title",
    group: "vision",
    label: "企业愿景政策卡片1标题",
    value_zh: "《中华人民共和国国民经济和社会发展第十五个五年规划纲要》",
  },
  {
    key_path: "vision.policies.0.tags",
    group: "vision",
    label: "企业愿景政策卡片1关键词",
    value_zh: "生物制造｜未来产业｜核心技术攻关｜新质生产力",
  },
  {
    key_path: "vision.policies.0.content",
    group: "vision",
    label: "企业愿景政策卡片1描述",
    value_zh: "聚焦“生物智造”，快速推动技术产业化落地。",
  },
  {
    key_path: "vision.policies.1.title",
    group: "vision",
    label: "企业愿景政策卡片2标题",
    value_zh: "《浙江省国民经济和社会发展第十五个五年规划纲要》",
  },
  {
    key_path: "vision.policies.1.tags",
    group: "vision",
    label: "企业愿景政策卡片2关键词",
    value_zh: "生物制造｜未来产业先导区｜科技金融服务｜现代化产业体系",
  },
  {
    key_path: "vision.policies.1.content",
    group: "vision",
    label: "企业愿景政策卡片2描述",
    value_zh: "依托浙江未来产业生态，推进生物制造工程化与规模化发展。",
  },
  {
    key_path: "vision.policies.2.title",
    group: "vision",
    label: "企业愿景政策卡片3标题",
    value_zh: "《加快非粮生物基材料创新发展三年行动方案》",
  },
  {
    key_path: "vision.policies.2.tags",
    group: "vision",
    label: "企业愿景政策卡片3关键词",
    value_zh: "非粮生物质｜生物基材料｜绿色低碳｜材料替代",
  },
  {
    key_path: "vision.policies.2.content",
    group: "vision",
    label: "企业愿景政策卡片3描述",
    value_zh: "推进“全生命周期低碳未来材料PiX”在农业、包装、纺织及未来制造等方向应用落地。",
  },
  {
    key_path: "vision.policies.3.title",
    group: "vision",
    label: "企业愿景政策卡片4标题",
    value_zh: "《工业和信息化部等七部门关于推动未来产业创新发展的实施意见》",
  },
  {
    key_path: "vision.policies.3.tags",
    group: "vision",
    label: "企业愿景政策卡片4关键词",
    value_zh: "AI融合｜未来制造｜生物制造｜场景创新",
  },
  {
    key_path: "vision.policies.3.content",
    group: "vision",
    label: "企业愿景政策卡片4描述",
    value_zh: "探索AI与合成生物技术融合，拓展未来制造相关场景应用。",
  },
];

function setNestedValue(target, keyPath, value) {
  const segments = keyPath.split(".");
  let current = target;
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const key = /^\d+$/.test(segment) ? Number(segment) : segment;
    const isLast = index === segments.length - 1;
    if (isLast) {
      current[key] = value;
      return;
    }
    const nextSegment = segments[index + 1];
    if (current[key] === undefined || current[key] === null) {
      current[key] = /^\d+$/.test(nextSegment) ? [] : {};
    }
    current = current[key];
  }
}

function syncLocalFallback() {
  LOCAL_I18N_PATHS.forEach((filePath) => {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    visionEntries.forEach((entry) => {
      setNestedValue(data, entry.key_path, entry.value_zh);
    });
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  });
  console.log(`Synced local i18n fallback files: ${LOCAL_I18N_PATHS.length}`);
}

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
  qs.set("filter[key_path][_in]", visionEntries.map((entry) => entry.key_path).join(","));
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

  visionEntries.forEach((entry) => {
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
  if (SYNC_LOCAL) {
    syncLocalFallback();
    return;
  }

  const env = loadEnv();
  const [existing, settings] = await Promise.all([fetchExistingEntries(env), fetchSettings(env)]);
  const plan = buildPlan(existing);
  console.log(JSON.stringify({
    mode: APPLY ? "apply" : "dry-run",
    current_content_version: settings.content_version,
    next_content_version: Number(settings.content_version || 0) + 1,
    desired_entries: visionEntries.length,
    creates: plan.creates.length,
    updates: plan.updates.length,
    create_keys: plan.creates.map((entry) => entry.key_path),
    update_keys: plan.updates.map((entry) => entry.key_path),
  }, null, 2));

  if (APPLY) {
    const changed = await applyPlan(env, plan, settings);
    if (changed) console.log("Applied vision future industry update.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
