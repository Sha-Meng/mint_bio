import axios from "axios";
import { renderColorShortcodes } from "@/utils/colorShortcode";
import { currentLanguage, getText } from "@/utils/language";

const DEFAULT_DIRECTUS_URL = "/directus-api";
const DIRECTUS_URL = (process.env.VUE_APP_DIRECTUS_URL || DEFAULT_DIRECTUS_URL).replace(/\/$/, "");
const DIRECTUS_ASSET_URL = (process.env.VUE_APP_DIRECTUS_ASSET_URL || DIRECTUS_URL).replace(/\/$/, "");
const DIRECTUS_API_CACHE_TTL = 30 * 1000;
const DIRECTUS_API_CACHE_PREFIX = "mintbio:directus-api:";

class NewsNotFoundError extends Error {
  constructor(key) {
    super(`News article not found: ${key}`);
    this.name = "NewsNotFoundError";
  }
}

function canUseBrowserCache() {
  return typeof window !== "undefined" && !!window.sessionStorage;
}

function getDirectusCacheKey(path, params) {
  const search = new URLSearchParams(
    Object.entries(params || {})
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => [key, String(value)])
  ).toString();
  return `${DIRECTUS_API_CACHE_PREFIX}${path}?${search}`;
}

function readDirectusCache(key) {
  if (!canUseBrowserCache()) return null;
  try {
    const cached = window.sessionStorage.getItem(key);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    if (!parsed || Date.now() > parsed.expiresAt) {
      window.sessionStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch (error) {
    window.sessionStorage.removeItem(key);
    return null;
  }
}

function writeDirectusCache(key, data) {
  if (!canUseBrowserCache()) return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify({
      expiresAt: Date.now() + DIRECTUS_API_CACHE_TTL,
      data,
    }));
  } catch (error) {
    // sessionStorage 可能被禁用或空间不足，忽略即可
  }
}

const THUMB_TRANSFORM = { width: 800, height: 500, fit: "cover", format: "webp", quality: 80 };
const DETAIL_TRANSFORM = { width: 1200, format: "webp", quality: 85 };
const POSTER_TRANSFORM = { width: 960, format: "webp", quality: 80 };
const MAX_TRANSFORM_PIXELS = 24000000;
const MAX_TRANSFORM_RATIO = 4;

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
    labelKey: "news.categories.runtime",
    color: "#FF7200",
  },
  "mint-products": {
    value: "production",
    labelKey: "news.categories.products",
    color: "#144BE1",
  },
  "mint-biomanufacturing": {
    value: "manufacture",
    labelKey: "news.categories.biomanufacturing",
    color: "#7455F6",
  },
  "mint-vision": {
    value: "vision",
    labelKey: "news.categories.vision",
    color: "#007D30",
  },
};

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
    labelKey: "news.categories.runtime",
    color: "#FF7200",
  };
}

function getCategoryLabel(category, meta) {
  const lang = getLang();
  if (lang === "en" && category?.name_en) return `#${category.name_en}`;
  if (category?.name_zh) return `#${category.name_zh}`;
  return getText(meta.labelKey);
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
  const ratio = Math.max(width / height, height / width);
  return width * height <= MAX_TRANSFORM_PIXELS && ratio <= MAX_TRANSFORM_RATIO;
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

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isImageGroupBreakText(value) {
  const normalized = String(value || "")
    .replace(/<br\s*\/?\s*>/gi, "")
    .replace(/&nbsp;/gi, "")
    .trim();
  return normalized === "";
}

function normalizeRichHtml(html) {
  return String(html || "")
    .replace(/https?:\/\/www\.mint-bio\.cn\/video\//g, "/video/")
    .replace(
      /(["'])\/assets\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(\?[^"']*)?/gi,
      (_, quote, fileId) => `${quote}${getAssetUrl(fileId, POSTER_TRANSFORM)}`
    );
}

function mapInlineTextContent(text) {
  const value = String(text || "");
  const colorResult = renderColorShortcodes(value, { preserveHtml: hasHtml(value) });
  if (colorResult.changed) return { strongText: colorResult.html };
  return hasHtml(value) ? { strongText: value } : { desc: value };
}

function normalizeHeaderLevel(level) {
  const value = Number(level);
  if (!Number.isInteger(value)) return 2;
  return Math.min(Math.max(value, 2), 4);
}

function mapHeadingContent(text, level) {
  const value = String(text || "").trim();
  if (!value) return null;

  const inline = mapInlineTextContent(value);
  return {
    heading: {
      level: normalizeHeaderLevel(level),
      text: inline.desc || "",
      html: inline.strongText || "",
    },
  };
}

function renderInlineHtml(text) {
  const value = String(text || "");
  const colorResult = renderColorShortcodes(value, { preserveHtml: hasHtml(value) });
  if (colorResult.changed) return colorResult.html;
  return hasHtml(value) ? value : escapeHtml(value);
}

function getListItemContent(item) {
  if (typeof item === "string") return item;
  return item?.content || item?.text || "";
}

function getNestedListItems(item) {
  return Array.isArray(item?.items) ? item.items : [];
}

function renderListItems(items, tagName) {
  return items
    .map((item) => {
      const content = renderInlineHtml(getListItemContent(item)).trim();
      const children = getNestedListItems(item);
      const childHtml = children.length ? renderListItems(children, tagName) : "";
      if (!content && !childHtml) return "";
      return `<li>${content}${childHtml}</li>`;
    })
    .filter(Boolean)
    .join("");
}

function mapListContent(data) {
  const items = Array.isArray(data.items) ? data.items : [];
  if (!items.length) return null;

  const tagName = data.style === "ordered" ? "ol" : "ul";
  const listItems = renderListItems(items, tagName);
  if (!listItems) return null;

  return {
    listHtml: `<${tagName}>${listItems}</${tagName}>`,
  };
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
      if (isImageGroupBreakText(text)) return { imageGroupBreak: true };
      if (!text.trim()) return null;
      return mapInlineTextContent(text);
    }
    case "header": {
      return mapHeadingContent(data.text, data.level);
    }
    case "list":
    case "nestedlist": {
      return mapListContent(data);
    }
    case "delimiter": {
      return { divider: true };
    }
    case "quote": {
      const text = data.text || "";
      if (!text.trim()) return null;
      return {
        quote: [mapInlineTextContent(text)],
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

  return {
    id: item.legacy_id,
    slug: item.slug,
    detailKey: item.slug || item.legacy_id,
    title,
    category: category.value,
    categorylabel: getCategoryLabel(item.category, category),
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

async function directusGet(path, params = {}) {
  const cacheKey = getDirectusCacheKey(path, params);
  const cached = readDirectusCache(cacheKey);
  if (cached !== null) return cached;

  const response = await axios.get(`${DIRECTUS_URL}${path}`, { params });
  const data = response.data?.data;
  writeDirectusCache(cacheKey, data);
  return data;
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
  if (!item) throw new NewsNotFoundError(key);
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
      label: getCategoryLabel(item, meta),
      color: meta.color,
      sort: item.sort,
    };
  });
}

export async function fetchNewsList(options = {}) {
  return fetchDirectusNewsList(options);
}

export async function fetchLatestNews(limit = 6, options = {}) {
  return fetchNewsList({ ...options, limit });
}

export async function fetchNewsDetail(key) {
  return fetchDirectusNewsDetail(key);
}

export async function fetchNewsCategories() {
  return fetchDirectusCategories();
}

export function isDirectusNewsEnabled() {
  return true;
}
