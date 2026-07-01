#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "node-html-parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const ENV_PATH = path.join(__dirname, ".env.migration");

const HTML_SOURCE_PATH = "C:/Users/shame/.codex/attachments/e9f7d918-c175-4cfe-a2d4-b07d7f4c396f/pasted-text.txt";
const COVER_SOURCE_PATH = path.join(REPO_ROOT, ".codebuddy/plans/join-us-2026-recruitment-cover-800x500.jpg");
const PUBLIC_DIRECTUS_URL = "https://www.mint-bio.cn/directus-api";

const ARTICLE_SLUG = "join-us-2026-recruitment";
const CATEGORY_SLUG = "mint-runtime";
const PUBLISH_AT = "2026-06-29T08:00:00+08:00";
const COVER_TITLE = "join-us-2026-recruitment-cover-800x500";
const FALLBACK_TITLE = "\u52a0\u5165\u5143\u7d20\u9a71\u52a8\uff5c\u4e00\u8d77\u63a2\u7d22 AI+\u8de8\u5c3a\u5ea6\u751f\u7269\u5236\u9020\u7684\u65e0\u9650\u53ef\u80fd";
const FALLBACK_SUMMARY = "AI for Science\u3001\u751f\u7269\u5236\u9020\u4e0e\u672a\u6765\u6750\u6599\u6b63\u5728\u52a0\u901f\u878d\u5408\u3002\u5143\u7d20\u9a71\u52a8\u671f\u5f85\u66f4\u591a\u540c\u884c\u8005\u52a0\u5165\uff0c\u4e00\u8d77\u53c2\u4e0e AI+\u8de8\u5c3a\u5ea6\u751f\u7269\u5236\u9020\u65b0\u8303\u5f0f\u7684\u957f\u671f\u5efa\u8bbe\u3002";
const SOURCE_URL = "https://mp.weixin.qq.com/s/OpZijLhQSTQk8g4MgqY8iQ";

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const publicCheck = args.has("--public-check");

function log(tag, message, extra = undefined) {
  if (extra === undefined) {
    console.log(`[${tag}] ${message}`);
    return;
  }
  console.log(`[${tag}] ${message}`, extra);
}

function fail(message) {
  throw new Error(message);
}

async function loadEnv() {
  if (process.env.DIRECTUS_URL && process.env.DIRECTUS_TOKEN) {
    return {
      url: process.env.DIRECTUS_URL.replace(/\/$/, ""),
      token: process.env.DIRECTUS_TOKEN,
    };
  }

  if (!existsSync(ENV_PATH)) {
    fail("Missing scripts/.env.migration or DIRECTUS_URL/DIRECTUS_TOKEN environment variables.");
  }

  const env = {};
  const raw = await readFile(ENV_PATH, "utf-8");
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }

  if (!env.DIRECTUS_URL || !env.DIRECTUS_TOKEN) {
    fail("Missing DIRECTUS_URL or DIRECTUS_TOKEN in scripts/.env.migration.");
  }

  return {
    url: env.DIRECTUS_URL.replace(/\/$/, ""),
    token: env.DIRECTUS_TOKEN,
  };
}

async function directusFetch(env, endpoint, options = {}) {
  const response = await fetch(`${env.url}${endpoint}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${env.token}`,
      ...(options.isMultipart ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
    body: options.body === undefined
      ? undefined
      : options.isMultipart
        ? options.body
        : JSON.stringify(options.body),
  });

  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok) {
    const detail = body?.errors?.[0]?.message || text || response.statusText;
    fail(`Directus ${options.method || "GET"} ${endpoint} failed ${response.status}: ${detail}`);
  }

  return body;
}

async function publicDirectusFetch(endpoint, options = {}) {
  const response = await fetch(`${PUBLIC_DIRECTUS_URL}${endpoint}`, {
    method: options.method || "GET",
  });

  if (options.method === "HEAD") {
    if (!response.ok) {
      fail(`Public Directus HEAD ${endpoint} failed ${response.status}: ${response.statusText}`);
    }
    return response;
  }

  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok) {
    const detail = body?.errors?.[0]?.message || text || response.statusText;
    fail(`Public Directus ${options.method || "GET"} ${endpoint} failed ${response.status}: ${detail}`);
  }

  return body;
}

function getMeta(root, selector, fallback = "") {
  return root.querySelector(selector)?.getAttribute("content")?.trim() || fallback;
}

function normalizeWeChatContent(html) {
  return html
    .replace(/\sdata-src=/gi, " src=")
    .replace(/\sdata-original=/gi, " src=")
    .replace(/\sdata-ratio="[^"]*"/gi, "")
    .replace(/\sdata-w="[^"]*"/gi, "")
    .replace(/\sdata-type="[^"]*"/gi, "")
    .replace(/\sclass="rich_pages wxw-img[^"]*"/gi, "")
    .replace(/\scontenteditable="[^"]*"/gi, "")
    .replace(/\sstyle=""/gi, "");
}

function stripUnsafeNodes(root) {
  for (const selector of ["script", "style", "iframe", "svg"]) {
    root.querySelectorAll(selector).forEach((node) => node.remove());
  }
}

async function extractArticleFromHtml() {
  const html = await readFile(HTML_SOURCE_PATH, "utf-8");
  const root = parse(html, {
    lowerCaseTagName: false,
    comment: false,
    blockTextElements: {
      script: false,
      noscript: false,
      style: false,
      pre: true,
    },
  });

  const title = getMeta(root, 'meta[property="og:title"]', FALLBACK_TITLE);
  const summary = getMeta(root, 'meta[name="description"]', FALLBACK_SUMMARY)
    .replace(/>\s*<meta name=$/, "")
    .trim() || FALLBACK_SUMMARY;
  const sourceUrl = getMeta(root, 'meta[property="og:url"]', SOURCE_URL);
  const content = root.querySelector("#js_content") || root.querySelector(".rich_media_content");
  if (!content) fail("Cannot find WeChat article content container (#js_content or .rich_media_content).");

  stripUnsafeNodes(content);
  const normalizedHtml = normalizeWeChatContent(content.innerHTML.trim());
  if (!normalizedHtml) fail("Extracted WeChat article body is empty.");

  const imageCount = (normalizedHtml.match(/<img\b/gi) || []).length;
  const textLength = content.text.replace(/\s+/g, "").length;

  return {
    title,
    summary,
    sourceUrl,
    bodyHtml: normalizedHtml,
    imageCount,
    textLength,
  };
}

function editorBlockId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function buildContentBlocks(article) {
  const sourceLink = `<p style="margin-top: 32px;"><a href="${article.sourceUrl}" target="_blank" rel="noopener noreferrer">\u9605\u8bfb\u516c\u4f17\u53f7\u539f\u6587</a></p>`;
  return {
    time: Date.now(),
    blocks: [
      {
        id: editorBlockId("raw"),
        type: "raw",
        data: {
          html: `<div class="wechat-recruitment-article">${article.bodyHtml}</div>`,
        },
      },
      {
        id: editorBlockId("source"),
        type: "raw",
        data: {
          html: sourceLink,
        },
      },
    ],
    version: "2.28.2",
  };
}

async function getCategoryId(env) {
  const qs = new URLSearchParams({
    fields: "id,slug,name_zh,status",
    limit: "1",
  });
  qs.set("filter[slug][_eq]", CATEGORY_SLUG);
  const body = await directusFetch(env, `/items/news_categories?${qs}`);
  const item = Array.isArray(body?.data) ? body.data[0] : null;
  if (!item?.id) fail(`Category not found: ${CATEGORY_SLUG}`);
  log("category", `${item.slug} ${item.name_zh || ""} id=${item.id}`);
  return item.id;
}

async function findExistingArticle(env) {
  const qs = new URLSearchParams({
    fields: "id,slug,title_zh,status,cover.id,featured,publish_at",
    limit: "1",
  });
  qs.set("filter[slug][_eq]", ARTICLE_SLUG);
  const body = await directusFetch(env, `/items/news_articles?${qs}`);
  return Array.isArray(body?.data) ? body.data[0] : null;
}

async function findExistingCover(env) {
  const qs = new URLSearchParams({
    fields: "id,title,filename_download,filename_disk,type,width,height,filesize",
    limit: "1",
  });
  qs.set("filter[title][_eq]", COVER_TITLE);
  const body = await directusFetch(env, `/files?${qs}`);
  return Array.isArray(body?.data) ? body.data[0] : null;
}

async function uploadCover(env) {
  const existing = await findExistingCover(env);
  if (existing?.id) {
    log("cover", `reuse existing file ${existing.id}`);
    return existing;
  }

  if (!existsSync(COVER_SOURCE_PATH)) {
    fail(`Cover source file not found: ${COVER_SOURCE_PATH}`);
  }

  if (!apply) {
    log("dry-run", `would upload cover from ${COVER_SOURCE_PATH}`);
    return {
      id: "__dry_run_cover__",
      title: COVER_TITLE,
      type: "image/jpeg",
      width: null,
      height: null,
      filesize: null,
    };
  }

  const bytes = await readFile(COVER_SOURCE_PATH);
  const form = new FormData();
  form.append("title", COVER_TITLE);
  form.append("file", new Blob([bytes], { type: "image/jpeg" }), `${COVER_TITLE}.jpg`);

  const body = await directusFetch(env, "/files", {
    method: "POST",
    body: form,
    isMultipart: true,
  });
  const file = body?.data;
  if (!file?.id) fail("Cover upload response did not include a file id.");
  log("cover", `uploaded ${file.id}`);
  return file;
}

function buildPayload(article, categoryId, coverFile) {
  return {
    slug: ARTICLE_SLUG,
    legacy_id: null,
    title_zh: article.title,
    title_en: null,
    summary_zh: article.summary,
    summary_en: null,
    cover: coverFile.id,
    category: categoryId,
    publish_at: PUBLISH_AT,
    featured: true,
    status: "published",
    content_blocks_zh: buildContentBlocks(article),
    content_blocks_en: null,
  };
}

async function writeArticle(env, existing, payload) {
  if (!apply) {
    log("dry-run", existing ? `would patch existing article ${existing.id}` : "would create new article");
    return existing || { id: "__dry_run_article__", slug: ARTICLE_SLUG };
  }

  if (existing?.id) {
    const body = await directusFetch(env, `/items/news_articles/${existing.id}`, {
      method: "PATCH",
      body: payload,
    });
    log("article", `patched existing ${existing.id}`);
    return body?.data;
  }

  const body = await directusFetch(env, "/items/news_articles", {
    method: "POST",
    body: payload,
  });
  const created = body?.data;
  if (!created?.id) fail("Article create response did not include an id.");
  log("article", `created ${created.id}`);
  return created;
}

async function verifyArticle(env, expectedCoverId) {
  const qs = new URLSearchParams({
    fields: [
      "id",
      "slug",
      "title_zh",
      "summary_zh",
      "status",
      "featured",
      "publish_at",
      "cover.id",
      "category.slug",
      "content_blocks_zh",
    ].join(","),
    limit: "1",
  });
  qs.set("filter[slug][_eq]", ARTICLE_SLUG);
  const body = await directusFetch(env, `/items/news_articles?${qs}`);
  const article = Array.isArray(body?.data) ? body.data[0] : null;
  if (!article) fail(`Article verification failed: ${ARTICLE_SLUG} not found.`);
  if (article.cover?.id !== expectedCoverId) fail(`Cover mismatch: expected ${expectedCoverId}, got ${article.cover?.id || "(empty)"}`);
  if (!article.featured) fail("Article is not featured.");
  if (article.status !== "published") fail(`Article status is ${article.status}, expected published.`);
  if (!article.content_blocks_zh?.blocks?.length) fail("Article has no Chinese content blocks.");
  log("verified", `${article.slug} cover=${article.cover.id} blocks=${article.content_blocks_zh.blocks.length}`);
  return article;
}

async function verifyPublic(expectedCoverId) {
  const qs = new URLSearchParams({
    fields: "slug,title_zh,status,featured,publish_at,cover.id,content_blocks_zh",
    limit: "1",
  });
  qs.set("filter[slug][_eq]", ARTICLE_SLUG);
  qs.set("filter[status][_eq]", "published");
  const body = await publicDirectusFetch(`/items/news_articles?${qs}`);
  const article = Array.isArray(body?.data) ? body.data[0] : null;
  if (!article) fail(`Public verification failed: ${ARTICLE_SLUG} not found.`);
  if (article.cover?.id !== expectedCoverId) fail(`Public cover mismatch: expected ${expectedCoverId}, got ${article.cover?.id || "(empty)"}`);

  const head = await publicDirectusFetch(`/assets/${expectedCoverId}?width=800&height=500&fit=cover&format=webp&quality=80`, {
    method: "HEAD",
  });
  log("public", `article visible, cover transform status=${head.status} content-type=${head.headers.get("content-type") || ""}`);
}

async function main() {
  const env = await loadEnv();
  const article = await extractArticleFromHtml();
  log("mode", apply ? "apply" : "dry-run");
  log("source", path.relative(REPO_ROOT, HTML_SOURCE_PATH) || HTML_SOURCE_PATH);
  log("title", article.title);
  log("summary", article.summary);
  log("body", `textLength=${article.textLength} imageCount=${article.imageCount}`);

  const categoryId = await getCategoryId(env);
  const existing = await findExistingArticle(env);
  log("existing", existing ? `${existing.id} ${existing.title_zh}` : "none");

  const cover = await uploadCover(env);
  const payload = buildPayload(article, categoryId, cover);
  log("payload", `slug=${payload.slug} featured=${payload.featured} publish_at=${payload.publish_at} blocks=${payload.content_blocks_zh.blocks.length}`);

  const written = await writeArticle(env, existing, payload);
  if (apply) {
    await verifyArticle(env, cover.id);
    if (publicCheck) await verifyPublic(cover.id);
  }

  log("done", written?.id || "(dry-run)");
}

main().catch((error) => {
  console.error(`[error] ${error.message}`);
  process.exitCode = 1;
});

