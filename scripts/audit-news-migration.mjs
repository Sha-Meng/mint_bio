#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CACHE_DIR = path.join(__dirname, '.migration-cache');

const CATEGORY_ALIAS = {
  'mint进行时': 'mint-runtime',
  'mint产品力': 'mint-products',
  'mint智造力': 'mint-biomanufacturing',
  'mint制造力': 'mint-biomanufacturing',
  'mintvision': 'mint-vision',
};

function normalizeCategoryLabel(label) {
  const key = String(label || '').replace(/^#/, '').replace(/\s+/g, '').toLowerCase();
  return CATEGORY_ALIAS[key] || null;
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function tryReadJson(filePath) {
  try {
    return await readJson(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function loadEnv() {
  const env = {
    DIRECTUS_URL: process.env.DIRECTUS_URL,
    DIRECTUS_TOKEN: process.env.DIRECTUS_TOKEN,
  };
  const envPath = path.join(__dirname, '.env.migration');
  try {
    const content = await fs.readFile(envPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx);
      const value = trimmed.slice(idx + 1);
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

function normalizeDateFromSource(value) {
  const m = String(value || '').trim().match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!m) return null;
  return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
}

function normalizeDateFromDirectus(value) {
  if (!value) return null;
  const s = String(value);
  const direct = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (direct) return direct[1];
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const byType = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function extractClassesFromHtml(value) {
  const classes = new Set();
  const re = /class=['"]([^'"]+)/g;
  let m;
  while ((m = re.exec(String(value || '')))) {
    for (const c of m[1].split(/\s+/).filter(Boolean)) classes.add(c);
  }
  return classes;
}

function mergeSets(target, source) {
  for (const item of source) target.add(item);
}

function addImage(expected, srcPath, stretched) {
  expected.blockTypes.push('image');
  expected.imagePaths.push(srcPath);
  expected.stretchedFlags.push(Boolean(stretched));
}

function addParagraph(expected, html) {
  expected.blockTypes.push('paragraph');
  mergeSets(expected.classes, extractClassesFromHtml(html));
}

function addQuote(expected, html) {
  expected.blockTypes.push('quote');
  mergeSets(expected.classes, extractClassesFromHtml(html));
}

function addRaw(expected, html, kind) {
  expected.blockTypes.push('raw');
  expected.rawKinds.push(kind);
  if (String(html || '').includes('style=')) expected.rawWithStyle += 1;
  mergeSets(expected.classes, extractClassesFromHtml(html));
}

function buildExpectedBlocks(detail, listItem) {
  const expected = {
    blockTypes: [],
    imagePaths: [],
    stretchedFlags: [],
    rawKinds: [],
    rawWithStyle: 0,
    classes: new Set(),
    pendingVideos: [],
  };
  const coverPriorityPath = listItem.pic || null;

  if (!detail || !Array.isArray(detail.sections) || detail.sections.length === 0) {
    if (coverPriorityPath) addImage(expected, coverPriorityPath, false);
    if (expected.blockTypes.length === 0) addParagraph(expected, ' ');
    return expected;
  }

  const headPicAll = [];
  const footerPicAll = [];
  const contentItems = [];
  for (const section of detail.sections) {
    if (Array.isArray(section.headPic)) headPicAll.push(...section.headPic);
    if (Array.isArray(section.contents)) contentItems.push(...section.contents);
    if (Array.isArray(section.footerPic)) footerPicAll.push(...section.footerPic);
  }

  for (const hp of headPicAll) addImage(expected, hp, false);

  for (const item of contentItems) {
    if (item.pic) {
      addImage(expected, item.pic, false);
      continue;
    }
    if (item.nopaddingpic) {
      addImage(expected, item.nopaddingpic, true);
      continue;
    }
    if (item.video && String(item.video).trim()) {
      addRaw(expected, `<video>${item.video}</video>`, 'video');
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(item, 'video') && item.video === '' && item._note) {
      expected.pendingVideos.push(item._note);
      continue;
    }
    if (Array.isArray(item.quote) && item.quote.length) {
      expected.blockTypes.push('delimiter');
      for (let i = 0; i < item.quote.length; i += 1) {
        const q = item.quote[i];
        if (q.pic) {
          addImage(expected, q.pic, false);
        } else if (q.strongText) {
          if (i === 0) addQuote(expected, q.strongText);
          else addParagraph(expected, q.strongText);
        } else if (q.desc) {
          if (i === 0) addQuote(expected, q.desc);
          else addParagraph(expected, q.desc);
        }
      }
      expected.blockTypes.push('delimiter');
      continue;
    }
    if (item.richHtml) {
      addRaw(expected, item.richHtml, 'richHtml');
      continue;
    }
    if (item.strongText) {
      addParagraph(expected, item.strongText);
      continue;
    }
    if (item.desc) {
      addParagraph(expected, item.desc);
      continue;
    }
  }

  for (const fp of footerPicAll) addImage(expected, fp, false);
  if (expected.blockTypes.length === 0) addParagraph(expected, ' ');
  return expected;
}

function getDirectusBlocks(article) {
  const data = article.content_blocks_zh || {};
  return Array.isArray(data.blocks) ? data.blocks : [];
}

function getImageFileId(block) {
  return block?.data?.file?.fileId || null;
}

function getArticleClasses(blocks) {
  const classes = new Set();
  for (const block of blocks) {
    mergeSets(classes, extractClassesFromHtml(JSON.stringify(block.data || {})));
  }
  return classes;
}

function pushIssue(issues, legacyId, field, expected, actual, level = 'error') {
  issues.push({ legacy_id: legacyId, field, expected, actual, level });
}

async function fetchAllArticles(env) {
  const qs = new URLSearchParams();
  qs.set('fields', 'id,legacy_id,slug,title_zh,summary_zh,status,publish_at,category.slug,cover,content_blocks_zh');
  qs.set('limit', '-1');
  const resp = await fetch(`${env.DIRECTUS_URL}/items/news_articles?${qs}`, {
    headers: { Authorization: `Bearer ${env.DIRECTUS_TOKEN}` },
  });
  if (!resp.ok) throw new Error(`Directus 拉取失败：HTTP ${resp.status}`);
  const json = await resp.json();
  return Array.isArray(json.data) ? json.data : [];
}

async function main() {
  const env = await loadEnv();
  const list = await readJson(path.join(ROOT, 'public/data/news_list.json'));
  const fileIndex = await tryReadJson(path.join(CACHE_DIR, 'file-index.json')) || {};
  const articles = await fetchAllArticles(env);
  const byLegacyId = new Map();
  const issues = [];

  for (const article of articles) {
    if (article.legacy_id != null) byLegacyId.set(Number(article.legacy_id), article);
  }

  if (byLegacyId.size !== list.length) {
    pushIssue(issues, 'ALL', 'article_count', list.length, byLegacyId.size);
  }

  const expectedSummaries = {};

  for (const listItem of list) {
    const legacyId = Number(listItem.id);
    const detail = await tryReadJson(path.join(ROOT, `public/data/news_${legacyId}.json`));
    const merged = detail || listItem;
    const article = byLegacyId.get(legacyId);
    if (!article) {
      pushIssue(issues, legacyId, 'article_missing', 'present', 'missing');
      continue;
    }

    const expectedCategory = normalizeCategoryLabel(listItem.categorylabel || merged.categorylabel);
    const expectedSummary = (detail && detail.overviewcontent)
      || listItem.overviewcontent
      || merged.overviewtitle
      || listItem.overviewtitle
      || merged.title
      || listItem.title;
    expectedSummaries[legacyId] = expectedSummary;

    if (article.slug !== `news-${legacyId}`) pushIssue(issues, legacyId, 'slug', `news-${legacyId}`, article.slug);
    if (article.title_zh !== (merged.title || listItem.title)) pushIssue(issues, legacyId, 'title_zh', merged.title || listItem.title, article.title_zh);
    if (article.summary_zh !== expectedSummary) pushIssue(issues, legacyId, 'summary_zh', expectedSummary, article.summary_zh);
    if (article.status !== 'published') pushIssue(issues, legacyId, 'status', 'published', article.status);
    if ((article.category && article.category.slug) !== expectedCategory) pushIssue(issues, legacyId, 'category.slug', expectedCategory, article.category && article.category.slug);

    const expectedDate = normalizeDateFromSource(merged.time || listItem.time);
    const actualDate = normalizeDateFromDirectus(article.publish_at);
    if (expectedDate && actualDate && expectedDate !== actualDate) pushIssue(issues, legacyId, 'publish_at_date', expectedDate, actualDate, 'warning');

    const expectedCoverPath = listItem.pic || null;
    const expectedCoverId = expectedCoverPath ? fileIndex[expectedCoverPath] : null;
    if (expectedCoverId && article.cover !== expectedCoverId) pushIssue(issues, legacyId, 'cover', expectedCoverId, article.cover);

    const expected = buildExpectedBlocks(detail, listItem);
    const blocks = getDirectusBlocks(article);
    const actualTypes = blocks.map((b) => b.type);
    if (JSON.stringify(actualTypes) !== JSON.stringify(expected.blockTypes)) {
      pushIssue(issues, legacyId, 'block_types', expected.blockTypes, actualTypes);
    }

    const imageBlocks = blocks.filter((b) => b.type === 'image');
    if (imageBlocks.length !== expected.imagePaths.length) {
      pushIssue(issues, legacyId, 'image_count', expected.imagePaths.length, imageBlocks.length);
    }

    const actualStretched = imageBlocks.map((b) => Boolean(b.data && b.data.stretched));
    if (JSON.stringify(actualStretched) !== JSON.stringify(expected.stretchedFlags)) {
      pushIssue(issues, legacyId, 'image_stretched_flags', expected.stretchedFlags, actualStretched);
    }

    const expectedImageIds = expected.imagePaths.map((p) => fileIndex[p] || null);
    const actualImageIds = imageBlocks.map(getImageFileId);
    if (JSON.stringify(actualImageIds) !== JSON.stringify(expectedImageIds)) {
      pushIssue(issues, legacyId, 'image_file_sequence', expectedImageIds, actualImageIds);
    }

    const rawBlocks = blocks.filter((b) => b.type === 'raw');
    if (rawBlocks.length !== expected.rawKinds.length) {
      pushIssue(issues, legacyId, 'raw_count', expected.rawKinds.length, rawBlocks.length);
    }
    const actualRawWithStyle = rawBlocks.filter((b) => String((b.data && b.data.html) || '').includes('style=')).length;
    if (actualRawWithStyle !== expected.rawWithStyle) {
      pushIssue(issues, legacyId, 'raw_with_style_count', expected.rawWithStyle, actualRawWithStyle);
    }

    const actualClasses = getArticleClasses(blocks);
    for (const cls of expected.classes) {
      if (!actualClasses.has(cls)) pushIssue(issues, legacyId, `html_class:${cls}`, 'present', 'missing');
    }
  }

  const errors = issues.filter((i) => i.level === 'error');
  const warnings = issues.filter((i) => i.level === 'warning');
  const report = {
    audited_at: new Date().toISOString(),
    source_articles: list.length,
    directus_articles_with_legacy_id: byLegacyId.size,
    errors: errors.length,
    warnings: warnings.length,
    issues,
    expected_summaries: expectedSummaries,
  };

  await fs.mkdir(CACHE_DIR, { recursive: true });
  const reportPath = path.join(CACHE_DIR, `audit-report-${Date.now()}.json`);
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`[audit] source=${list.length} directus=${byLegacyId.size} errors=${errors.length} warnings=${warnings.length}`);
  console.log(`[audit] report=${path.relative(ROOT, reportPath)}`);
  if (issues.length) {
    for (const issue of issues.slice(0, 30)) {
      console.log(`[${issue.level}] legacy_id=${issue.legacy_id} field=${issue.field}`);
      console.log(`  expected=${JSON.stringify(issue.expected)}`);
      console.log(`  actual=${JSON.stringify(issue.actual)}`);
    }
    if (issues.length > 30) console.log(`[audit] 仅显示前 30 条，完整见报告`);
  }
  if (errors.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`[audit] failed: ${error.message}`);
  process.exit(1);
});
