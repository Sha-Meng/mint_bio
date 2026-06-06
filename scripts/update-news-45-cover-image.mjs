#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.join(__dirname, ".env.migration");

const TARGET_SLUG = "news-45";
const TARGET_ASSET_PREFIX = "064330";
const TARGET_ASSET_SUFFIX = "d8-c452ae394122";
const RESTORE_FIRST_BODY_IMAGE_ID = "9709174c-9f8e-4f62-a5b0-3f10480ada38";
const TARGET_BLOCK_INDEX = 0;
const PUBLIC_DIRECTUS_URL = "https://www.mint-bio.cn/directus-api";

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const publicCheck = args.has("--public");

function log(tag, message, extra = undefined) {
  if (extra === undefined) {
    console.log(`[${tag}] ${message}`);
    return;
  }
  console.log(`[${tag}] ${message}`, extra);
}

async function loadEnv() {
  if (process.env.DIRECTUS_URL && process.env.DIRECTUS_TOKEN) {
    return {
      url: process.env.DIRECTUS_URL.replace(/\/$/, ""),
      token: process.env.DIRECTUS_TOKEN,
    };
  }

  if (!existsSync(ENV_PATH)) {
    throw new Error("Missing scripts/.env.migration or DIRECTUS_URL/DIRECTUS_TOKEN environment variables.");
  }

  const env = {};
  const raw = await readFile(ENV_PATH, "utf-8");
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }

  if (!env.DIRECTUS_URL || !env.DIRECTUS_TOKEN) {
    throw new Error("Missing DIRECTUS_URL or DIRECTUS_TOKEN in scripts/.env.migration.");
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
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
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
    throw new Error(`Directus ${options.method || "GET"} ${endpoint} failed ${response.status}: ${detail}`);
  }

  return body;
}

async function publicDirectusFetch(endpoint, options = {}) {
  const response = await fetch(`${PUBLIC_DIRECTUS_URL}${endpoint}`, {
    method: options.method || "GET",
  });

  if (options.method === "HEAD") {
    if (!response.ok) {
      throw new Error(`Public Directus HEAD ${endpoint} failed ${response.status}: ${response.statusText}`);
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
    throw new Error(`Public Directus ${options.method || "GET"} ${endpoint} failed ${response.status}: ${detail}`);
  }

  return body;
}

function imageBlocks(article) {
  const blocks = article?.content_blocks_zh?.blocks || [];
  return blocks
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => block?.type === "image");
}

function fileIdFromImageBlock(block) {
  const file = block?.data?.file || {};
  return file.fileId || file.id || String(file.url || "").replace(/^\/assets\//, "") || "";
}

function buildFileData(file) {
  return {
    id: file.id,
    fileId: file.id,
    url: `/assets/${file.id}`,
    width: file.width || null,
    height: file.height || null,
    extension: file.filename_disk ? path.extname(file.filename_disk).replace(".", "") : "",
    size: file.filesize || null,
    type: file.type || "",
  };
}

async function getArticle(env) {
  const qs = new URLSearchParams({
    fields: [
      "id",
      "legacy_id",
      "slug",
      "title_zh",
      "status",
      "cover.id",
      "cover.width",
      "cover.height",
      "content_blocks_zh",
    ].join(","),
    limit: "1",
  });
  qs.set("filter[slug][_eq]", TARGET_SLUG);

  const body = await directusFetch(env, `/items/news_articles?${qs}`);
  const article = Array.isArray(body?.data) ? body.data[0] : null;
  if (!article) throw new Error(`Article not found: ${TARGET_SLUG}`);
  return article;
}

async function getPublicArticle() {
  const qs = new URLSearchParams({
    fields: "slug,cover.id,content_blocks_zh",
    limit: "1",
  });
  qs.set("filter[slug][_eq]", TARGET_SLUG);

  const body = await publicDirectusFetch(`/items/news_articles?${qs}`);
  const article = Array.isArray(body?.data) ? body.data[0] : null;
  if (!article) throw new Error(`Public article not found: ${TARGET_SLUG}`);
  return article;
}

async function getFileById(env, fileId) {
  const qs = new URLSearchParams({
    fields: "id,filename_disk,filename_download,title,type,width,height,filesize",
  });
  const body = await directusFetch(env, `/files/${fileId}?${qs}`);
  if (!body?.data?.id) throw new Error(`File not found: ${fileId}`);
  return body.data;
}

async function resolveReplacementFile(env) {
  const qs = new URLSearchParams({
    fields: "id,filename_disk,filename_download,title,type,width,height,filesize",
    limit: "-1",
  });

  const body = await directusFetch(env, `/files?${qs}`);
  const matches = (body?.data || []).filter((file) => {
    const id = String(file.id || "");
    return id.startsWith(TARGET_ASSET_PREFIX) && id.endsWith(TARGET_ASSET_SUFFIX);
  });

  if (matches.length !== 1) {
    const ids = matches.map((file) => file.id).join(", ") || "(none)";
    throw new Error(`Expected exactly one replacement file match, found ${matches.length}: ${ids}`);
  }

  return matches[0];
}

function describeArticle(article) {
  const imgs = imageBlocks(article);
  log("article", `${article.slug} legacy_id=${article.legacy_id} status=${article.status}`);
  log("title", article.title_zh || "");
  log("cover", article.cover?.id || "(empty)");
  imgs.forEach(({ block, index }, order) => {
    log("image", `order=${order} blockIndex=${index} file=${fileIdFromImageBlock(block)} stretched=${Boolean(block?.data?.stretched)}`);
  });
}

function patchCoverAndRestoreFirstImageBlock(article, coverFile, firstBodyImageFile) {
  const blocks = article.content_blocks_zh?.blocks || [];
  const imgs = imageBlocks(article);
  const target = imgs[TARGET_BLOCK_INDEX];
  if (!target) throw new Error(`No image block found at image order ${TARGET_BLOCK_INDEX}.`);

  const nextBlocks = structuredClone(blocks);
  const nextBlock = nextBlocks[target.index];
  nextBlock.data = {
    ...(nextBlock.data || {}),
    file: buildFileData(firstBodyImageFile),
  };

  return {
    cover: coverFile.id,
    content_blocks_zh: {
      ...(article.content_blocks_zh || {}),
      blocks: nextBlocks,
    },
  };
}

async function runPublicCheck(expectedCoverId, expectedFirstBodyImageId) {
  const publicArticle = await getPublicArticle();
  log("public", `cover is ${publicArticle.cover?.id || "(empty)"}`);
  const firstImage = imageBlocks(publicArticle)[TARGET_BLOCK_INDEX];
  const firstFileId = fileIdFromImageBlock(firstImage?.block);
  log("public", `first image block is ${firstFileId}`);

  const head = await publicDirectusFetch(`/assets/${expectedCoverId}?width=800&height=500&fit=cover&format=webp&quality=80`, {
    method: "HEAD",
  });
  log("public", `cover transform status=${head.status} content-type=${head.headers.get("content-type") || ""}`);

  if (publicArticle.cover?.id !== expectedCoverId) {
    throw new Error(`Public cover mismatch: expected ${expectedCoverId}, got ${publicArticle.cover?.id || "(empty)"}`);
  }
  if (firstFileId !== expectedFirstBodyImageId) {
    throw new Error(`Public first body image mismatch: expected ${expectedFirstBodyImageId}, got ${firstFileId || "(empty)"}`);
  }
}

async function main() {
  const env = await loadEnv();
  log("mode", apply ? "apply" : "dry-run");

  const article = await getArticle(env);
  const replacement = await resolveReplacementFile(env);
  const firstBodyImage = await getFileById(env, RESTORE_FIRST_BODY_IMAGE_ID);

  describeArticle(article);
  log("cover-target", `${replacement.id} ${replacement.width || "?"}x${replacement.height || "?"} ${replacement.type || ""}`);
  log("body-restore", `${firstBodyImage.id} ${firstBodyImage.width || "?"}x${firstBodyImage.height || "?"} ${firstBodyImage.type || ""}`);

  const update = patchCoverAndRestoreFirstImageBlock(article, replacement, firstBodyImage);

  if (!apply) {
    log("dry-run", `would update cover to ${replacement.id}`);
    log("dry-run", `would restore first body image block to ${firstBodyImage.id}`);
    if (publicCheck) await runPublicCheck(replacement.id, firstBodyImage.id);
    return;
  }

  await directusFetch(env, `/items/news_articles/${article.id}`, {
    method: "PATCH",
    body: update,
  });

  const verified = await getArticle(env);
  const firstImage = imageBlocks(verified)[TARGET_BLOCK_INDEX];
  log("verified", `cover is now ${verified.cover?.id || "(empty)"}`);
  log("verified", `first image block is now ${fileIdFromImageBlock(firstImage?.block)}`);
  if (publicCheck) await runPublicCheck(replacement.id, firstBodyImage.id);
}

main().catch((error) => {
  console.error(`[error] ${error.message}`);
  process.exitCode = 1;
});
