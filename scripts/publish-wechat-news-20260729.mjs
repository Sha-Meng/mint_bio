#!/usr/bin/env node

import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "node-html-parser";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..");
const ENV_PATH = path.join(SCRIPT_DIR, ".env.migration");
const PUBLIC_DIRECTUS_URL = "https://www.mint-bio.cn/directus-api";
const DIRECTUS_FOLDER_NAME = "news-20260729-wechat";

const EXHIBITION_DIR = "D:/UGit/纺丝展会推文图片";
const CAT_DIR = "D:/UGit/喵的水产品推文图片";
const CAT_REPLACEMENT = "D:/UGit/20260729-184334.png";

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const publicCheck = args.has("--public-check");

const articles = [
  {
    key: "exhibition",
    slug: "yuanshengsi-biobased-textile-materials-summit-2026",
    sourceUrl: "https://mp.weixin.qq.com/s/DU3z7rhd7_6A8e4Zjw-0rw",
    title: "备受关注！元素驱动元笙丝®亮相生物基纺织新材料应用峰会",
    fallbackSummary: "元素驱动携元笙丝®亮相生物基纺织新材料应用峰会，展示生物基纺织新材料的创新应用。",
    categorySlug: "mint-runtime",
    publishAt: "2026-07-24T17:30:00+08:00",
    cover: {
      source: path.join(EXHIBITION_DIR, "封面.JPG"),
      title: "news-20260729-yuanshengsi-cover",
    },
  },
  {
    key: "cat",
    slug: "mint-products-cat-hydration-solution-2026",
    sourceUrl: "https://mp.weixin.qq.com/s/MsBh3WyVAsN_LMxxnukuxw",
    title: "MiNT 产品力｜行业首款！元素驱动为助力猫咪饮水提供新解法",
    fallbackSummary: "元素驱动推出猫咪饮水营养产品“喵的水”，以氨基酸营养方案助力猫咪主动饮水与泌尿健康。",
    categorySlug: "mint-products",
    publishAt: "2026-07-22T09:00:00+08:00",
    cover: {
      source: path.join(CAT_DIR, "封面900X383.jpg"),
      title: "news-20260729-cat-hydration-cover",
    },
  },
];

function log(tag, message) {
  console.log(`[${tag}] ${message}`);
}

function fail(message) {
  throw new Error(message);
}

async function loadEnv() {
  const env = {};
  const raw = await readFile(ENV_PATH, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
  if (!env.DIRECTUS_URL || !env.DIRECTUS_TOKEN) {
    fail("Missing DIRECTUS_URL or DIRECTUS_TOKEN in scripts/.env.migration.");
  }
  return { url: env.DIRECTUS_URL.replace(/\/$/, ""), token: env.DIRECTUS_TOKEN };
}

async function directusFetch(env, endpoint, options = {}) {
  const response = await fetch(`${env.url}${endpoint}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${env.token}`,
      ...(options.multipart ? {} : { "Content-Type": "application/json" }),
    },
    body: options.body === undefined
      ? undefined
      : options.multipart
        ? options.body
        : JSON.stringify(options.body),
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok) {
    fail(`Directus ${options.method || "GET"} ${endpoint} failed ${response.status}: ${body?.errors?.[0]?.message || text}`);
  }
  return body;
}

async function publicFetch(endpoint, options = {}) {
  const response = await fetch(`${PUBLIC_DIRECTUS_URL}${endpoint}`, { method: options.method || "GET" });
  if (options.method === "HEAD") {
    if (!response.ok) fail(`Public asset check failed ${response.status}: ${endpoint}`);
    return response;
  }
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) fail(`Public Directus ${endpoint} failed ${response.status}`);
  return body;
}

function mimeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

function downloadName(title, source) {
  return `${title}${path.extname(source).toLowerCase().replace(".jpeg", ".jpg") || ".jpg"}`;
}

async function findFile(env, title) {
  const qs = new URLSearchParams({ fields: "id,title,type,width,height,filesize", limit: "1" });
  qs.set("filter[title][_eq]", title);
  const body = await directusFetch(env, `/files?${qs}`);
  return body?.data?.[0] || null;
}

async function ensureFolder(env) {
  const qs = new URLSearchParams({ fields: "id,name", limit: "1" });
  qs.set("filter[name][_eq]", DIRECTUS_FOLDER_NAME);
  const existing = (await directusFetch(env, `/folders?${qs}`))?.data?.[0];
  if (existing?.id) return existing.id;
  if (!apply) {
    log("dry-run", `would create folder ${DIRECTUS_FOLDER_NAME}`);
    return "__dry_run_folder__";
  }
  const created = await directusFetch(env, "/folders", {
    method: "POST",
    body: { name: DIRECTUS_FOLDER_NAME },
  });
  if (!created?.data?.id) fail("Folder create response has no id.");
  log("folder", `created ${created.data.id}`);
  return created.data.id;
}

async function ensureFile(env, folderId, media) {
  const existing = await findFile(env, media.title);
  if (existing?.id) {
    log("media", `reuse ${media.title} ${existing.id}`);
    return existing;
  }
  if (!existsSync(media.source)) fail(`Media source not found: ${media.source}`);
  if (!apply) {
    log("dry-run", `would upload ${media.title} from ${media.source}`);
    return { id: `__dry_run_${media.title}__`, title: media.title, type: mimeFor(media.source) };
  }
  const bytes = await readFile(media.source);
  const form = new FormData();
  form.append("title", media.title);
  form.append("folder", folderId);
  form.append("file", new Blob([bytes], { type: mimeFor(media.source) }), downloadName(media.title, media.source));
  const uploaded = await directusFetch(env, "/files", {
    method: "POST",
    body: form,
    multipart: true,
  });
  if (!uploaded?.data?.id) fail(`Upload response has no id for ${media.title}.`);
  log("media", `uploaded ${media.title} ${uploaded.data.id}`);
  return uploaded.data;
}

async function fetchWeChatSource(article) {
  const response = await fetch(article.sourceUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!response.ok) fail(`WeChat fetch failed ${response.status}: ${article.sourceUrl}`);
  const html = await response.text();
  const root = parse(html);
  const body = root.querySelector("#js_content") || root.querySelector(".rich_media_content");
  const summary = root.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() || article.fallbackSummary;
  if (!body) {
    log("source", `${article.key} body unavailable; using fallback summary only`);
    return { summary, bodyHtml: "" };
  }

  for (const selector of ["script", "style", "iframe", "svg", "img"]) {
    body.querySelectorAll(selector).forEach((node) => node.remove());
  }
  body.querySelectorAll("a").forEach((node) => {
    const text = node.text.replace(/\s+/g, "").trim();
    if (!text || text.includes("了解更多")) {
      node.remove();
      return;
    }
    node.replaceWith(node.innerHTML);
  });
  const bodyHtml = body.innerHTML
    .replace(/\s(?:data-[\w-]+|contenteditable|href|target|rel)="[^"]*"/gi, "")
    .replace(/\sstyle=""/gi, "")
    .trim();
  return { summary, bodyHtml };
}

async function getExhibitionMedia() {
  const names = (await readdir(EXHIBITION_DIR))
    .filter((name) => /^IMG_.*\.(?:jpe?g|png)$/i.test(name))
    .sort((a, b) => a.localeCompare(b, "en"));
  if (names.length !== 5) fail(`Expected 5 exhibition body images, found ${names.length}.`);
  return names.map((name, index) => ({
    source: path.join(EXHIBITION_DIR, name),
    title: `news-20260729-yuanshengsi-body-${String(index + 1).padStart(2, "0")}`,
  }));
}

async function getCatMedia() {
  const slices = Array.from({ length: 11 }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return {
      source: path.join(CAT_DIR, `喵的水公众号-${number}.jpg`),
      title: `news-20260729-cat-hydration-body-${number}`,
    };
  });
  return [
    ...slices,
    { source: CAT_REPLACEMENT, title: "news-20260729-cat-hydration-follow-replacement" },
  ];
}

function blockId(prefix, index) {
  return `${prefix}_${String(index).padStart(2, "0")}`;
}

function imageBlock(file, index) {
  return {
    id: blockId("image", index),
    type: "image",
    data: {
      file: { id: file.id, type: file.type || "image/jpeg" },
      caption: "",
      withBorder: false,
      stretched: false,
      withBackground: false,
    },
  };
}

function contentBlocks(article, source, bodyFiles) {
  const blocks = [];
  if (article.key === "exhibition" && source.bodyHtml) {
    blocks.push({
      id: "exhibition_text",
      type: "raw",
      data: { html: `<div class="wechat-exhibition-article">${source.bodyHtml}</div>` },
    });
  }
  bodyFiles.forEach((file, index) => blocks.push(imageBlock(file, index + 1)));
  return { time: Date.now(), blocks, version: "2.28.2" };
}

async function categoryId(env, slug) {
  const qs = new URLSearchParams({ fields: "id,slug,name_zh", limit: "1" });
  qs.set("filter[slug][_eq]", slug);
  const item = (await directusFetch(env, `/items/news_categories?${qs}`))?.data?.[0];
  if (!item?.id) fail(`Category not found: ${slug}`);
  return item.id;
}

async function existingArticle(env, slug) {
  const qs = new URLSearchParams({ fields: "id,slug,title_zh,status", limit: "1" });
  qs.set("filter[slug][_eq]", slug);
  return (await directusFetch(env, `/items/news_articles?${qs}`))?.data?.[0] || null;
}

async function writeArticle(env, existing, payload) {
  if (!apply) {
    log("dry-run", existing ? `would patch article ${existing.id}` : `would create article ${payload.slug}`);
    return;
  }
  const endpoint = existing ? `/items/news_articles/${existing.id}` : "/items/news_articles";
  const result = await directusFetch(env, endpoint, {
    method: existing ? "PATCH" : "POST",
    body: payload,
  });
  log("article", `${existing ? "patched" : "created"} ${result?.data?.id}`);
}

async function verifyArticle(env, expected) {
  const qs = new URLSearchParams({
    fields: "id,slug,title_zh,status,featured,publish_at,category.slug,cover.id,content_blocks_zh",
    limit: "1",
  });
  qs.set("filter[slug][_eq]", expected.slug);
  const item = (await directusFetch(env, `/items/news_articles?${qs}`))?.data?.[0];
  if (!item) fail(`Authenticated verification missing ${expected.slug}.`);
  if (item.status !== "published" || item.featured !== false) fail(`Invalid status/featured for ${expected.slug}.`);
  if (item.category?.slug !== expected.categorySlug) fail(`Category mismatch for ${expected.slug}.`);
  if (item.content_blocks_zh?.blocks?.length !== expected.blockCount) {
    fail(`Block count mismatch for ${expected.slug}: ${item.content_blocks_zh?.blocks?.length}`);
  }
  log("verified", `${item.slug} blocks=${item.content_blocks_zh.blocks.length} cover=${item.cover?.id}`);
  return item;
}

async function verifyPublic(article, cover, files) {
  const qs = new URLSearchParams({ fields: "slug,status,featured,cover.id,content_blocks_zh", limit: "1" });
  qs.set("filter[slug][_eq]", article.slug);
  qs.set("filter[status][_eq]", "published");
  const item = (await publicFetch(`/items/news_articles?${qs}`))?.data?.[0];
  if (!item) fail(`Public verification missing ${article.slug}.`);
  for (const file of [cover, ...files]) {
    const response = await publicFetch(`/assets/${file.id}?width=1200&format=webp&quality=82`, { method: "HEAD" });
    if (!(response.headers.get("content-type") || "").startsWith("image/")) {
      fail(`Asset is not an image: ${file.id}`);
    }
  }
  log("public", `${article.slug} visible; ${files.length + 1} assets checked`);
}

async function main() {
  const env = await loadEnv();
  log("mode", apply ? "apply" : "dry-run");
  const folderId = await ensureFolder(env);

  for (const article of articles) {
    const source = await fetchWeChatSource(article);
    const media = article.key === "exhibition" ? await getExhibitionMedia() : await getCatMedia();
    const category = await categoryId(env, article.categorySlug);
    const existing = await existingArticle(env, article.slug);
    const cover = await ensureFile(env, folderId, article.cover);
    const files = [];
    for (const item of media) files.push(await ensureFile(env, folderId, item));
    const blocks = contentBlocks(article, source, files);
    const payload = {
      slug: article.slug,
      legacy_id: null,
      title_zh: article.title,
      title_en: null,
      summary_zh: source.summary || article.fallbackSummary,
      summary_en: null,
      cover: cover.id,
      category,
      publish_at: article.publishAt,
      featured: false,
      status: "published",
      content_blocks_zh: blocks,
      content_blocks_en: null,
    };
    log("payload", `${article.slug} category=${article.categorySlug} publish_at=${article.publishAt} featured=false blocks=${blocks.blocks.length} existing=${existing?.id || "none"}`);
    await writeArticle(env, existing, payload);
    if (apply) {
      const verified = await verifyArticle(env, { ...article, blockCount: blocks.blocks.length });
      if (verified.cover?.id !== cover.id) fail(`Cover mismatch for ${article.slug}.`);
      if (publicCheck) await verifyPublic(article, cover, files);
    }
  }
}

main().catch((error) => {
  console.error(`[error] ${error.message}`);
  process.exitCode = 1;
});
