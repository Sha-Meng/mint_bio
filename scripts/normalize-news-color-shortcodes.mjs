#!/usr/bin/env node
/**
 * Directus 新闻正文颜色写法规范化脚本。
 *
 * 默认 dry-run；只有显式传入 --apply 才会写回 Directus。
 *
 * 用法：
 *   node scripts/normalize-news-color-shortcodes.mjs
 *   node scripts/normalize-news-color-shortcodes.mjs --ids=1,19
 *   node scripts/normalize-news-color-shortcodes.mjs --apply
 *   node scripts/normalize-news-color-shortcodes.mjs --audit-only
 *   node scripts/normalize-news-color-shortcodes.mjs --restore=scripts/.migration-cache/color-shortcode-backup-xxxx.json
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CACHE_DIR = path.join(__dirname, '.migration-cache');
const ENV_PATH = path.join(__dirname, '.env.migration');

const COLOR_CLASS_MAP = Object.freeze({
  'orange-text': '#e75a29',
  'blue-text': '#2d5bf6',
  'green-text': '#74d887',
  'blue-green-text': '#6bbea9',
});

const BRAND_COLOR_ALIASES = Object.freeze({
  orange: '#e75a29',
  blue: '#2d5bf6',
  green: '#74d887',
  'blue-green': '#6bbea9',
  bluegreen: '#6bbea9',
});

const LEGACY_COLOR_ALIASES = Object.freeze({
  '#ff7200': '#e75a29',
  '#144be1': '#2d5bf6',
  '#007d30': '#74d887',
});

const RAW_COLOR_EXCLUSION_KEYS = Object.freeze(new Set([
  '48:content_blocks_zh:blocks[18].data.html',
  '48:content_blocks_zh:blocks[21].data.html',
  '48:content_blocks_zh:blocks[24].data.html',
]));

const args = process.argv.slice(2);
const isApply = args.includes('--apply');
const auditOnly = args.includes('--audit-only');
const forceWithManualReview = args.includes('--force-with-manual-review');
const restorePath = args.find((arg) => arg.startsWith('--restore='))?.replace('--restore=', '');
const flagIds = args.find((arg) => arg.startsWith('--ids='))?.replace('--ids=', '');
const onlyIds = flagIds ? new Set(flagIds.split(',').map((id) => Number(id.trim())).filter(Boolean)) : null;

function log(tag, ...msg) {
  console.log(`[${tag}]`, ...msg);
}

async function loadEnv() {
  const env = {
    DIRECTUS_URL: process.env.DIRECTUS_URL,
    DIRECTUS_TOKEN: process.env.DIRECTUS_TOKEN,
  };

  try {
    const content = await fs.readFile(ENV_PATH, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index === -1) continue;
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!env[key]) env[key] = value;
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  if (!env.DIRECTUS_URL || !env.DIRECTUS_TOKEN) {
    throw new Error('缺少 DIRECTUS_URL / DIRECTUS_TOKEN，请配置 scripts/.env.migration 或环境变量');
  }

  env.DIRECTUS_URL = env.DIRECTUS_URL.replace(/\/$/, '');
  return env;
}

async function directusFetch(env, method, endpoint, body) {
  const response = await fetch(`${env.DIRECTUS_URL}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.DIRECTUS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = json?.errors?.[0]?.message || text || response.statusText;
    throw new Error(`${method} ${endpoint} → HTTP ${response.status} ${message}`);
  }
  return json;
}

function hasUnsafeCssToken(value) {
  return /[;{}<>"'\\]/.test(value) || /\b(?:url|var|expression)\s*\(/i.test(value);
}

function normalizeHex(value) {
  const match = String(value || '').trim().match(/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (!match) return null;
  const hex = match[1].toLowerCase();
  const normalized = hex.length === 3 || hex.length === 4
    ? hex.split('').map((char) => `${char}${char}`).join('')
    : hex;
  const color = `#${normalized}`;
  return LEGACY_COLOR_ALIASES[color] || color;
}

function normalizeNumber(value, min, max, { allowPercent = false, allowDecimal = false } = {}) {
  const text = String(value || '').trim();
  const isPercent = text.endsWith('%');
  if (isPercent && !allowPercent) return null;
  const numberText = isPercent ? text.slice(0, -1) : text;
  if (!/^-?\d+(?:\.\d+)?$/.test(numberText)) return null;
  if (!allowDecimal && numberText.includes('.')) return null;
  const number = Number(numberText);
  if (!Number.isFinite(number) || number < min || number > max) return null;
  return `${numberText}${isPercent ? '%' : ''}`;
}

function normalizeAlpha(value) {
  const text = String(value || '').trim();
  if (text.endsWith('%')) return normalizeNumber(text, 0, 100, { allowPercent: true, allowDecimal: true });
  return normalizeNumber(text, 0, 1, { allowDecimal: true });
}

function splitFunctionArgs(value) {
  return String(value || '').split(',').map((part) => part.trim()).filter(Boolean);
}

function normalizeRgb(value) {
  const match = String(value || '').trim().match(/^rgba?\((.*)\)$/i);
  if (!match) return null;
  const args = splitFunctionArgs(match[1]);
  if (args.length !== 3 && args.length !== 4) return null;
  const channels = args.slice(0, 3).map((part) => normalizeNumber(part, 0, part.endsWith('%') ? 100 : 255, {
    allowPercent: true,
    allowDecimal: part.endsWith('%'),
  }));
  if (channels.some((part) => part === null)) return null;
  if (args.length === 4) {
    const alpha = normalizeAlpha(args[3]);
    if (alpha === null) return null;
    return `rgba(${channels.join(', ')}, ${alpha})`;
  }
  return `rgb(${channels.join(', ')})`;
}

function normalizeHsl(value) {
  const match = String(value || '').trim().match(/^hsla?\((.*)\)$/i);
  if (!match) return null;
  const args = splitFunctionArgs(match[1]);
  if (args.length !== 3 && args.length !== 4) return null;
  const hue = normalizeNumber(args[0], 0, 360, { allowDecimal: true });
  const saturation = args[1].trim().endsWith('%')
    ? normalizeNumber(args[1], 0, 100, { allowPercent: true, allowDecimal: true })
    : null;
  const lightness = args[2].trim().endsWith('%')
    ? normalizeNumber(args[2], 0, 100, { allowPercent: true, allowDecimal: true })
    : null;
  if (hue === null || saturation === null || lightness === null) return null;
  if (args.length === 4) {
    const alpha = normalizeAlpha(args[3]);
    if (alpha === null) return null;
    return `hsla(${hue}, ${saturation}, ${lightness}, ${alpha})`;
  }
  return `hsl(${hue}, ${saturation}, ${lightness})`;
}

function normalizeColorValue(value) {
  const raw = String(value || '').trim();
  if (!raw || hasUnsafeCssToken(raw)) return null;
  const alias = BRAND_COLOR_ALIASES[raw.toLowerCase()];
  if (alias) return alias;
  return normalizeHex(raw) || normalizeRgb(raw) || normalizeHsl(raw);
}

function hasLegacyColorPattern(value) {
  const text = String(value || '');
  return /\b(?:orange-text|blue-text|green-text|blue-green-text)\b/i.test(text)
    || /<font\b[^>]*\bcolor\s*=/i.test(text)
    || /<span\b[^>]*\bstyle\s*=\s*(['"])[^'"]*\bcolor\s*:/i.test(text);
}

function removeAttr(attrs, attrName) {
  return attrs.replace(new RegExp(`\\s*${attrName}\\s*=\\s*(['"])[\\s\\S]*?\\1`, 'i'), '').trim();
}

function parseClasses(attrs) {
  const match = attrs.match(/\bclass\s*=\s*(['"])([\s\S]*?)\1/i);
  if (!match) return { classes: [], attr: null };
  return { classes: match[2].split(/\s+/).filter(Boolean), attr: match[0] };
}

function parseStyle(attrs) {
  const match = attrs.match(/\bstyle\s*=\s*(['"])([\s\S]*?)\1/i);
  if (!match) return { declarations: [], attr: null };
  const declarations = match[2].split(';').map((part) => part.trim()).filter(Boolean);
  return { declarations, attr: match[0] };
}

function parseColorAttr(attrs) {
  const match = attrs.match(/\bcolor\s*=\s*(['"])([\s\S]*?)\1/i);
  return match ? { value: match[2], attr: match[0] } : { value: null, attr: null };
}

function getRawColorExclusionKey(context) {
  const fieldPrefix = `${context.field}.`;
  const pathKey = String(context.path || '').startsWith(fieldPrefix)
    ? String(context.path).slice(fieldPrefix.length)
    : context.path;
  return `${context.legacy_id}:${context.field}:${pathKey}`;
}

function isAllowedRawColorExclusion(context) {
  return RAW_COLOR_EXCLUSION_KEYS.has(getRawColorExclusionKey(context));
}

function pushManual(manualReview, context, reason, html) {
  manualReview.push({ ...context, reason, sample: String(html || '').slice(0, 300) });
}

function convertLegacyString(input, context, manualReview) {
  let changed = false;
  let output = String(input || '');

  output = output.replace(/<span\b([^>]*)>([\s\S]*?)<\/span>/gi, (full, attrs, inner) => {
    const { classes, attr } = parseClasses(attrs);
    const colorClass = classes.find((className) => COLOR_CLASS_MAP[className]);
    if (!colorClass) return full;

    const remainingClasses = classes.filter((className) => className !== colorClass);
    const remainingAttrs = attr ? removeAttr(attrs, 'class') : attrs.trim();
    if (remainingClasses.length || remainingAttrs || /<span\b/i.test(inner)) {
      pushManual(manualReview, context, 'color_class_span_has_extra_attrs_or_nested_span', full);
      return full;
    }

    changed = true;
    return `[color=${COLOR_CLASS_MAP[colorClass]}]${inner}[/color]`;
  });

  output = output.replace(/<font\b([^>]*)>([\s\S]*?)<\/font>/gi, (full, attrs, inner) => {
    const colorAttr = parseColorAttr(attrs);
    if (!colorAttr.value) return full;

    const color = normalizeColorValue(colorAttr.value);
    const remainingAttrs = colorAttr.attr ? removeAttr(attrs, 'color') : attrs.trim();
    if (!color || remainingAttrs || /<font\b/i.test(inner)) {
      pushManual(manualReview, context, 'font_color_invalid_or_has_extra_attrs', full);
      return full;
    }

    changed = true;
    return `[color=${color}]${inner}[/color]`;
  });

  output = output.replace(/<span\b([^>]*)>([\s\S]*?)<\/span>/gi, (full, attrs, inner) => {
    const { declarations, attr } = parseStyle(attrs);
    if (!attr || !declarations.some((declaration) => /^color\s*:/i.test(declaration))) return full;

    const colorDeclarations = declarations.filter((declaration) => /^color\s*:/i.test(declaration));
    const otherDeclarations = declarations.filter((declaration) => !/^color\s*:/i.test(declaration));
    const rawColor = colorDeclarations[0]?.replace(/^color\s*:/i, '').trim();
    const color = normalizeColorValue(rawColor);
    const remainingAttrs = removeAttr(attrs, 'style');

    if (colorDeclarations.length !== 1 || otherDeclarations.length || !color || remainingAttrs || /<span\b/i.test(inner)) {
      pushManual(manualReview, context, 'style_color_span_complex_or_invalid', full);
      return full;
    }

    changed = true;
    return `[color=${color}]${inner}[/color]`;
  });

  return { value: output, changed };
}

function normalizeValue(value, context, manualReview) {
  if (typeof value === 'string') {
    return convertLegacyString(value, context, manualReview);
  }

  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((item, index) => {
      const result = normalizeValue(item, { ...context, path: `${context.path}[${index}]` }, manualReview);
      if (result.changed) changed = true;
      return result.value;
    });
    return { value: changed ? next : value, changed };
  }

  if (value && typeof value === 'object') {
    let changed = false;
    const next = { ...value };
    for (const [key, child] of Object.entries(value)) {
      const result = normalizeValue(child, { ...context, path: `${context.path}.${key}` }, manualReview);
      if (result.changed) {
        next[key] = result.value;
        changed = true;
      }
    }
    return { value: changed ? next : value, changed };
  }

  return { value, changed: false };
}

function normalizeContentBlocks(blocksValue, field, article, manualReview) {
  if (!blocksValue || typeof blocksValue !== 'object' || !Array.isArray(blocksValue.blocks)) {
    return { value: blocksValue, changed: false };
  }

  let changed = false;
  const nextBlocks = blocksValue.blocks.map((block, index) => {
    if (block?.type === 'raw') {
      const html = block?.data?.html || '';
      const context = {
        legacy_id: article.legacy_id,
        slug: article.slug,
        field,
        path: `blocks[${index}].data.html`,
      };
      if (hasLegacyColorPattern(html) && !isAllowedRawColorExclusion(context)) {
        pushManual(manualReview, context, 'raw_html_contains_legacy_color_pattern', html);
      }
      return block;
    }

    const result = normalizeValue(block, {
      legacy_id: article.legacy_id,
      slug: article.slug,
      field,
      path: `blocks[${index}]`,
    }, manualReview);
    if (result.changed) changed = true;
    return result.value;
  });

  return { value: changed ? { ...blocksValue, blocks: nextBlocks } : blocksValue, changed };
}

function collectLegacyResidues(value, context, residues) {
  if (typeof value === 'string') {
    if (hasLegacyColorPattern(value) && !isAllowedRawColorExclusion(context)) {
      residues.push({ ...context, sample: value.slice(0, 300) });
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectLegacyResidues(item, { ...context, path: `${context.path}[${index}]` }, residues));
    return;
  }

  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      collectLegacyResidues(child, { ...context, path: `${context.path}.${key}` }, residues);
    }
  }
}

function collectResidues(article, normalizedFields) {
  const residues = [];
  for (const field of ['content_blocks_zh', 'content_blocks_en']) {
    collectLegacyResidues(normalizedFields[field] ?? article[field], {
      legacy_id: article.legacy_id,
      slug: article.slug,
      field,
      path: field,
    }, residues);
  }
  return residues;
}

async function fetchArticles(env) {
  const qs = new URLSearchParams();
  qs.set('fields', 'id,legacy_id,slug,title_zh,content_blocks_zh,content_blocks_en');
  qs.set('limit', '-1');
  const json = await directusFetch(env, 'GET', `/items/news_articles?${qs}`);
  return Array.isArray(json.data) ? json.data : [];
}

async function restoreFromBackup(env, backupFile) {
  const absolutePath = path.isAbsolute(backupFile) ? backupFile : path.resolve(ROOT, backupFile);
  const records = JSON.parse(await fs.readFile(absolutePath, 'utf8'));
  if (!Array.isArray(records)) throw new Error(`备份文件格式错误：${backupFile}`);

  for (const record of records) {
    if (!record.id) throw new Error(`备份记录缺少 id：${JSON.stringify(record).slice(0, 200)}`);
    await directusFetch(env, 'PATCH', `/items/news_articles/${record.id}`, {
      content_blocks_zh: record.content_blocks_zh,
      content_blocks_en: record.content_blocks_en,
    });
  }

  log('restore', `restored=${records.length} backup=${path.relative(ROOT, absolutePath)}`);
}

async function main() {
  const env = await loadEnv();
  if (restorePath) {
    await restoreFromBackup(env, restorePath);
    return;
  }

  const articles = (await fetchArticles(env)).filter((article) => !onlyIds || onlyIds.has(Number(article.legacy_id)));
  const changedArticles = [];
  const manualReview = [];
  const residues = [];
  const backup = [];
  const pendingUpdates = [];

  for (const article of articles) {
    if (auditOnly) {
      residues.push(...collectResidues(article, {}));
      continue;
    }

    const updates = {};
    for (const field of ['content_blocks_zh', 'content_blocks_en']) {
      const result = normalizeContentBlocks(article[field], field, article, manualReview);
      if (result.changed) updates[field] = result.value;
    }

    residues.push(...collectResidues(article, updates));

    if (Object.keys(updates).length) {
      changedArticles.push({
        id: article.id,
        legacy_id: article.legacy_id,
        slug: article.slug,
        fields: Object.keys(updates),
      });
      backup.push({
        id: article.id,
        legacy_id: article.legacy_id,
        slug: article.slug,
        title_zh: article.title_zh,
        content_blocks_zh: article.content_blocks_zh,
        content_blocks_en: article.content_blocks_en,
      });
      pendingUpdates.push({ id: article.id, updates });
    }
  }

  const backupPath = backup.length ? path.join(CACHE_DIR, `color-shortcode-backup-${Date.now()}.json`) : null;
  const report = {
    generated_at: new Date().toISOString(),
    mode: auditOnly ? 'audit-only' : (isApply ? 'apply' : 'dry-run'),
    total_articles: articles.length,
    changed_articles: changedArticles.length,
    manual_review_count: manualReview.length,
    residue_count: residues.length,
    changedArticles,
    manualReview,
    residues,
    backup: backupPath ? path.relative(ROOT, backupPath) : null,
  };

  await fs.mkdir(CACHE_DIR, { recursive: true });
  if (backupPath) await fs.writeFile(backupPath, `${JSON.stringify(backup, null, 2)}\n`, 'utf8');

  if (isApply && !forceWithManualReview && (manualReview.length || residues.length)) {
    log('guard', '检测到人工复核项或残留旧写法，已阻止 apply；如需先应用安全转换，请显式加 --force-with-manual-review。');
    process.exitCode = 1;
  } else if (isApply && !auditOnly) {
    for (const item of pendingUpdates) {
      await directusFetch(env, 'PATCH', `/items/news_articles/${item.id}`, item.updates);
    }
  }

  const stamp = Date.now();
  const reportPath = path.join(CACHE_DIR, `color-shortcode-report-${stamp}.json`);
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  log('color-shortcode', `mode=${report.mode} articles=${articles.length} changed=${changedArticles.length} manual=${manualReview.length} residues=${residues.length}`);
  log('color-shortcode', `report=${path.relative(ROOT, reportPath)}`);
  if (manualReview.length) log('manual-review', '存在需人工复核的复杂颜色 HTML，详见 report。');
  if (residues.length) log('residue', '仍存在旧颜色作者写法，详见 report。');
}

main().catch((error) => {
  console.error(`[color-shortcode] failed: ${error.message}`);
  process.exit(1);
});
