import axios from "axios";

const DEFAULT_DIRECTUS_URL = "/directus-api";
const DIRECTUS_URL = (process.env.VUE_APP_DIRECTUS_URL || DEFAULT_DIRECTUS_URL).replace(/\/$/, "");

const SETTINGS_COLLECTION = "site_i18n_settings";
const ENTRIES_COLLECTION = "site_i18n_entries";
const SETTINGS_ID = "site-default";

const CACHE_PREFIX = "mintbio:site-i18n:";
const BUNDLE_CACHE_KEY = `${CACHE_PREFIX}bundle`;
const REQUEST_TIMEOUT = 3000;

const DEFAULT_SETTINGS = {
  id: SETTINGS_ID,
  feature_en_enabled: false,
  content_version: 0,
};

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function readBundleCache() {
  if (!canUseStorage()) return null;
  try {
    const cached = window.localStorage.getItem(BUNDLE_CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    if (!parsed?.content_version || !parsed?.resources) return null;
    return parsed;
  } catch (error) {
    window.localStorage.removeItem(BUNDLE_CACHE_KEY);
    return null;
  }
}

function writeBundleCache(settings, resources) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(BUNDLE_CACHE_KEY, JSON.stringify({
      content_version: settings.content_version,
      settings,
      resources,
      cached_at: Date.now(),
    }));
  } catch (error) {
    // localStorage 可能被禁用或空间不足，忽略即可
  }
}

function directusUrl(path) {
  return `${DIRECTUS_URL}${path}`;
}

function normalizeContentVersion(value) {
  const version = Number(value);
  return Number.isFinite(version) && version > 0 ? version : DEFAULT_SETTINGS.content_version;
}

function normalizeSettings(item) {
  if (!item) return { ...DEFAULT_SETTINGS };
  return {
    id: item.id || SETTINGS_ID,
    feature_en_enabled: item.feature_en_enabled === true,
    content_version: normalizeContentVersion(item.content_version),
  };
}

function isNumericSegment(segment) {
  return /^\d+$/.test(segment);
}

function createContainer(nextSegment) {
  return isNumericSegment(nextSegment) ? [] : {};
}

function isEmptyValue(value) {
  return value === undefined || value === null || value === "";
}

function setNestedValue(target, path, value) {
  if (!path || isEmptyValue(value)) return;
  const segments = String(path).split(".").filter(Boolean);
  if (!segments.length) return;

  let current = target;
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const key = isNumericSegment(segment) ? Number(segment) : segment;
    const isLast = index === segments.length - 1;

    if (isLast) {
      current[key] = value;
      return;
    }

    const nextSegment = segments[index + 1];
    if (current[key] === undefined || current[key] === null || typeof current[key] !== "object") {
      current[key] = createContainer(nextSegment);
    }
    current = current[key];
  }
}

function entriesToResources(entries = []) {
  const resources = { zh: {}, en: {} };
  entries.forEach((entry) => {
    if (!entry?.key_path) return;
    setNestedValue(resources.zh, entry.key_path, entry.value_zh);
    setNestedValue(resources.en, entry.key_path, entry.value_en);
  });
  return resources;
}

async function directusGet(path, params = {}) {
  const response = await axios.get(directusUrl(path), {
    params,
    timeout: REQUEST_TIMEOUT,
  });
  return response.data?.data;
}

export async function fetchSiteI18nSettings() {
  const fields = "id,feature_en_enabled,content_version";
  const data = await directusGet(`/items/${SETTINGS_COLLECTION}`, {
    fields,
    limit: 1,
  });
  return normalizeSettings(Array.isArray(data) ? data[0] : data);
}

export async function fetchSiteI18nEntries() {
  const data = await directusGet(`/items/${ENTRIES_COLLECTION}`, {
    fields: "id,key_path,group,label,value_zh,value_en,enabled",
    limit: -1,
    sort: "group,key_path",
    "filter[enabled][_eq]": true,
  });
  return Array.isArray(data) ? data : [];
}

export async function loadSiteI18nRuntime() {
  const cached = readBundleCache();

  try {
    const settings = await fetchSiteI18nSettings();

    if (cached?.content_version === settings.content_version && cached.resources) {
      return {
        settings,
        resources: cached.resources,
        meta: {
          content_version: settings.content_version,
          loaded_from: "cache",
        },
      };
    }

    try {
      const entries = await fetchSiteI18nEntries();
      const resources = entriesToResources(entries);
      writeBundleCache(settings, resources);
      return {
        settings,
        resources,
        meta: {
          content_version: settings.content_version,
          loaded_from: "network",
        },
      };
    } catch (error) {
      if (cached?.resources) {
        return {
          settings,
          resources: cached.resources,
          meta: {
            content_version: cached.content_version,
            loaded_from: "cache",
          },
        };
      }
      return {
        settings,
        resources: { zh: {}, en: {} },
        meta: {
          content_version: settings.content_version,
          loaded_from: "fallback",
        },
      };
    }
  } catch (error) {
    if (cached?.resources) {
      return {
        settings: normalizeSettings(cached.settings),
        resources: cached.resources,
        meta: {
          content_version: cached.content_version,
          loaded_from: "cache",
        },
      };
    }

    return {
      settings: { ...DEFAULT_SETTINGS },
      resources: { zh: {}, en: {} },
      meta: {
        content_version: DEFAULT_SETTINGS.content_version,
        loaded_from: "fallback",
      },
    };
  }
}

export function clearSiteI18nCache() {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(BUNDLE_CACHE_KEY);
  } catch (error) {
    // 忽略缓存清理异常
  }
}

export default {
  fetchSiteI18nSettings,
  fetchSiteI18nEntries,
  loadSiteI18nRuntime,
  clearSiteI18nCache,
};
