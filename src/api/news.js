import axios from "axios";
import { currentLanguage } from "@/utils/language";

const DEFAULT_DIRECTUS_URL = process.env.NODE_ENV === "development" ? "/directus-api" : "https://cms.mint-bio.cn";
const DIRECTUS_URL = (process.env.VUE_APP_DIRECTUS_URL || DEFAULT_DIRECTUS_URL).replace(/\/$/, "");
const DIRECTUS_ASSET_URL = (process.env.VUE_APP_DIRECTUS_ASSET_URL || DIRECTUS_URL).replace(/\/$/, "");
const USE_DIRECTUS = process.env.VUE_APP_USE_DIRECTUS === "true";

const THUMB_TRANSFORM = { width: 800, height: 500, fit: "cover", format: "webp", quality: 80 };
const DETAIL_TRANSFORM = { width: 1200, format: "webp", quality: 85 };
const POSTER_TRANSFORM = { width: 960, format: "webp", quality: 80 };
const MAX_TRANSFORM_PIXELS = 24000000;

const COVER_FIELDS = ["cover.id", "cover.width", "cover.height", "cover.filesize", "cover.type"].join(",");

const ARTICLE_FIELDS = [
  "legacy_id",
  "slug",
  "title_zh",
  "title_en",
  "summary_zh",
  "summary_en",
  COVER_FIELDS,
  "category.slug",
  "category.name_zh",
  "category.name_en",
  "publish_at",
  "featured",
  "content_blocks_zh",
  "content_blocks_en",
].join(",");

const LIST_FIELDS = [
  "legacy_id",
  "slug",
  "title_zh",
  "title_en",
  "summary_zh",
  "summary_en",
  COVER_FIELDS,
  "category.slug",
  "category.name_zh",
  "category.name_en",
  "publish_at",
  "featured",
].join(",");


const CATEGORY_MAP = {
  "mint-runtime": {
    value: "runtime",
    labelZh: "#MiNT进行时",
    labelEn: "#MiNT Runtime",
    color: "#FF7200",
  },
  "mint-products": {
    value: "production",
    labelZh: "#MiNT产品力",
    labelEn: "#MiNT Products",
    color: "#144BE1",
  },
  "mint-biomanufacturing": {
    value: "manufacture",
    labelZh: "#MiNT智造力",
    labelEn: "#MiNT Biomanufacturing",
    color: "#7455F6",
  },
  "mint-vision": {
    value: "vision",
    labelZh: "#MiNT Vision",
    labelEn: "#MiNT Vision",
    color: "#007D30",
  },
};

function shouldUseDirectus(source = "auto") {
  if (source === "directus") return true;
  if (source === "static") return false;
  return USE_DIRECTUS;
}

function getLang() {
  return currentLanguage.value === "en" ? "en" : "zh";
}

function pickText(item, field) {
  const lang = getLang();
  if (lang === "en") return item[`${field}_en`] || item[`${field}_zh`] || "";
  return item[`${field}_zh`] || item[`${field}_en`] || "";
}

function pickBlocks(item) {
  const lang = getLang();
  if (lang === "en" && item.content_blocks_en?.blocks?.length) {
    return item.content_blocks_en;
  }
  return item.content_blocks_zh || { blocks: [] };
}

function normalizeSummary(summary, title) {
  const normalizedSummary = String(summary || "").trim();
  const normalizedTitle = String(title || "").trim();
  if (!normalizedSummary || normalizedSummary === normalizedTitle) return "";
  return summary;
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

function getCategoryMeta(category) {
  const slug = typeof category === "string" ? category : category?.slug;
  return CATEGORY_MAP[slug] || {
    value: slug || "runtime",
    labelZh: category?.name_zh ? `#${category.name_zh}` : "#MiNT进行时",
    labelEn: category?.name_en ? `#${category.name_en}` : "#MiNT Runtime",
    color: "#FF7200",
  };
}

function appendTransform(url, transform) {
  if (!transform) return url;
  const params = new URLSearchParams(transform);
  return `${url}${url.includes("?") ? "&" : "?"}${params.toString()}`;
}

function canTransformAsset(asset) {
  if (!asset || typeof asset === "string") return true;
  const width = Number(asset.width || 0);
  const height = Number(asset.height || 0);
  if (!width || !height) return true;
  return width * height <= MAX_TRANSFORM_PIXELS;
}

function getAssetUrl(fileIdOrUrl, transform = null) {
  if (!fileIdOrUrl) return "";
  const value = typeof fileIdOrUrl === "string"
    ? fileIdOrUrl
    : (fileIdOrUrl.id || fileIdOrUrl.fileId || fileIdOrUrl.url);
  if (!value) return "";
  const safeTransform = canTransformAsset(fileIdOrUrl) ? transform : null;
  if (/^https?:\/\//.test(value)) return appendTransform(value, safeTransform);
  if (value.startsWith("/assets/")) return appendTransform(`${DIRECTUS_ASSET_URL}${value}`, safeTransform);
  return appendTransform(`${DIRECTUS_ASSET_URL}/assets/${value}`, safeTransform);
}

function getBlockImageUrl(block) {
  const file = block?.data?.file || {};
  return getAssetUrl(file, DETAIL_TRANSFORM);
}

function hasHtml(value) {
  return /<[^>]+>/.test(String(value || ""));
}

function normalizeRichHtml(html) {
  return String(html || "")
    .replace(/https?:\/\/www\.mint-bio\.cn\/video\//g, "/video/")
    .replace(
      /(["'])\/assets\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(\?[^"']*)?/gi,
      (_, quote, fileId) => `${quote}${getAssetUrl(fileId, POSTER_TRANSFORM)}`
    );
}

function blockToContent(block) {
  const data = block?.data || {};

  switch (block?.type) {
    case "image": {
      const src = getBlockImageUrl(block);
      if (!src) return null;
      return data.stretched ? { nopaddingpic: src } : { pic: src };
    }
    case "paragraph": {
      const text = data.text || "";
      if (!text.trim()) return null;
      return hasHtml(text) ? { strongText: text } : { desc: text };
    }
    case "quote": {
      const text = data.text || "";
      if (!text.trim()) return null;
      return {
        quote: [hasHtml(text) ? { strongText: text } : { desc: text }],
      };
    }
    case "raw": {
      const html = normalizeRichHtml(data.html);
      return html.trim() ? { richHtml: html } : null;
    }

    default:
      return null;
  }
}

function mapArticleToListItem(item) {
  const category = getCategoryMeta(item.category);
  const title = pickText(item, "title");
  const summary = normalizeSummary(pickText(item, "summary"), title);
  const lang = getLang();

  return {
    id: item.legacy_id,
    slug: item.slug,
    title,
    category: category.value,
    categorylabel: lang === "en" ? category.labelEn : category.labelZh,
    categorycolor: category.color,
    time: formatDate(item.publish_at),
    pic: getAssetUrl(item.cover, THUMB_TRANSFORM),

    overviewtitle: summary || title,
    overviewcontent: summary,
    transform: "scale(1)",
  };
}

function mapArticleToDetail(item) {
  const listItem = mapArticleToListItem(item);
  const blocks = pickBlocks(item).blocks || [];
  const contents = blocks.map(blockToContent).filter(Boolean);
  return {
    ...listItem,
    pic: "",
    sections: [
      {
        id: 1,
        headPic: [],
        contents,
        footerPic: [],
      },
    ],
  };
}

function staticDetailKey(key) {
  const normalized = String(key || "");
  const match = normalized.match(/^news-(\d+)$/);
  return match ? match[1] : normalized;
}

async function fetchStaticNewsList({ limit, category } = {}) {
  const response = await axios.get("/data/news_list.json");
  let list = response.data || [];
  if (category && category !== "all") {
    list = list.filter((item) => item.category === category);
  }
  if (limit) list = list.slice(0, limit);
  return list.map((item) => ({ ...item, transform: item.transform || "scale(1)" }));
}

async function fetchStaticNewsDetail(key) {
  const response = await axios.get(`/data/news_${staticDetailKey(key)}.json`);
  return response.data;
}

async function directusGet(path, params = {}) {
  const response = await axios.get(`${DIRECTUS_URL}${path}`, { params });
  return response.data?.data;
}

async function fetchDirectusNewsList({ limit, category } = {}) {
  const params = {
    fields: LIST_FIELDS,
    sort: "-featured,-publish_at",
    limit: limit || -1,
    "filter[status][_eq]": "published",
  };

  if (category && category !== "all") {
    const slug = Object.entries(CATEGORY_MAP).find(([, meta]) => meta.value === category)?.[0];
    if (slug) params["filter[category][slug][_eq]"] = slug;
  }

  const data = await directusGet("/items/news_articles", params);
  return (data || []).map(mapArticleToListItem);
}

async function fetchDirectusNewsDetail(key) {
  const normalizedKey = String(key || "");
  const params = {
    fields: ARTICLE_FIELDS,
    limit: 1,
    "filter[status][_eq]": "published",
  };

  if (/^\d+$/.test(normalizedKey)) {
    params["filter[legacy_id][_eq]"] = normalizedKey;
  } else {
    params["filter[slug][_eq]"] = normalizedKey;
  }

  const data = await directusGet("/items/news_articles", params);
  const item = Array.isArray(data) ? data[0] : null;
  if (!item) throw new Error(`News article not found: ${key}`);
  return mapArticleToDetail(item);
}

async function fetchDirectusCategories() {
  const data = await directusGet("/items/news_categories", {
    fields: "slug,name_zh,name_en,sort,status",
    sort: "sort",
    "filter[status][_eq]": "published",
  });
  return (data || []).map((item) => {
    const meta = getCategoryMeta(item);
    return {
      slug: item.slug,
      value: meta.value,
      label: getLang() === "en" ? meta.labelEn : meta.labelZh,
      color: meta.color,
      sort: item.sort,
    };
  });
}

export async function fetchNewsList(options = {}) {
  if (!shouldUseDirectus(options.source)) return fetchStaticNewsList(options);
  try {
    return await fetchDirectusNewsList(options);
  } catch (error) {
    console.warn("Directus news list unavailable, fallback to static JSON:", error);
    return fetchStaticNewsList(options);
  }
}

export async function fetchLatestNews(limit = 6, options = {}) {
  return fetchNewsList({ ...options, limit });
}

export async function fetchNewsDetail(key, options = {}) {
  if (!shouldUseDirectus(options.source)) return fetchStaticNewsDetail(key);
  try {
    return await fetchDirectusNewsDetail(key);
  } catch (error) {
    console.warn("Directus news detail unavailable, fallback to static JSON:", error);
    return fetchStaticNewsDetail(key);
  }
}

export async function fetchNewsCategories(options = {}) {
  if (!shouldUseDirectus(options.source)) {
    return Object.entries(CATEGORY_MAP).map(([slug, meta]) => ({
      slug,
      value: meta.value,
      label: getLang() === "en" ? meta.labelEn : meta.labelZh,
      color: meta.color,
    }));
  }
  try {
    return await fetchDirectusCategories();
  } catch (error) {
    console.warn("Directus news categories unavailable, fallback to local categories:", error);
    return fetchNewsCategories({ source: "static" });
  }
}

export function isDirectusNewsEnabled() {
  return USE_DIRECTUS;
}
