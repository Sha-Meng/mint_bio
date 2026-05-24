import { ref } from 'vue'
import zhCN from '@/i18n/zh-CN.json'
import enUS from '@/i18n/en-US.json'
import { loadSiteI18nRuntime } from '@/api/siteI18n'

const LANGUAGE_STORAGE_KEY = 'language'
const LANGUAGE_QUERY_KEY = 'lang'
const DEFAULT_LANGUAGE = 'zh'
const SUPPORTED_LANGUAGES = ['zh', 'en']

const bundledResources = { zh: zhCN, en: enUS }
const defaultSettings = {
  feature_en_enabled: false,
  content_version: 0
}

export const currentLanguage = ref(DEFAULT_LANGUAGE)
export const runtimeSettings = ref({ ...defaultSettings })
export const i18nResourceVersion = ref(0)
export const isI18nRuntimeReady = ref(false)

function isSupportedLanguage(lang) {
  return SUPPORTED_LANGUAGES.includes(lang)
}

export function isEnglishEnabled() {
  return runtimeSettings.value.feature_en_enabled === true
}

function getDefaultLanguage() {
  return DEFAULT_LANGUAGE
}

function normalizeLanguage(lang) {
  if (!isSupportedLanguage(lang)) return null
  if (lang === 'en' && !isEnglishEnabled()) return null
  return lang
}

function getStoredLanguage() {
  try {
    return normalizeLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY))
  } catch (error) {
    return null
  }
}

function getLanguageFromUrl() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const url = new URL(window.location.href)
    return normalizeLanguage(url.searchParams.get(LANGUAGE_QUERY_KEY))
  } catch (error) {
    return null
  }
}

function persistLanguage(lang) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
  } catch (error) {
    // 忽略本地存储异常，避免影响页面渲染
  }
}

function syncLanguageToUrl(lang) {
  if (typeof window === 'undefined') {
    return
  }

  const url = new URL(window.location.href)
  const targetLang = normalizeLanguage(lang) || getDefaultLanguage()

  if (targetLang === 'en') {
    url.searchParams.set(LANGUAGE_QUERY_KEY, 'en')
  } else {
    url.searchParams.delete(LANGUAGE_QUERY_KEY)
  }

  const nextUrl = url.toString()
  if (nextUrl !== window.location.href) {
    window.history.replaceState(window.history.state, '', nextUrl)
  }
}

function applyLanguage(lang) {
  const targetLang = normalizeLanguage(lang) || getDefaultLanguage()
  currentLanguage.value = targetLang
  persistLanguage(targetLang)
  syncLanguageToUrl(targetLang)
  return targetLang
}

function resolveInitialLanguage() {
  if (!isEnglishEnabled()) {
    try {
      if (localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'en') {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, getDefaultLanguage())
      }
    } catch (e) { /* ignore */ }
    return getDefaultLanguage()
  }
  return getLanguageFromUrl() || getStoredLanguage() || getDefaultLanguage()
}

export const runtimeResources = ref({ zh: {}, en: {} })

function getNestedProperty(obj, path) {
  if (!obj || !path) return undefined
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function cloneValue(value) {
  if (Array.isArray(value)) return value.map(cloneValue)
  if (isPlainObject(value)) {
    return Object.keys(value).reduce((result, key) => {
      result[key] = cloneValue(value[key])
      return result
    }, {})
  }
  return value
}

function isEmptyOverride(value) {
  return value === undefined || value === null || value === ''
}

function mergeValue(base, override) {
  if (isEmptyOverride(override)) return cloneValue(base)
  if (Array.isArray(base) || Array.isArray(override)) {
    const result = Array.isArray(base) ? base.map(cloneValue) : []
    if (Array.isArray(override)) {
      override.forEach((item, index) => {
        result[index] = mergeValue(result[index], item)
      })
      return result
    }
    return cloneValue(override)
  }
  if (isPlainObject(base) || isPlainObject(override)) {
    const result = isPlainObject(base) ? cloneValue(base) : {}
    if (isPlainObject(override)) {
      Object.keys(override).forEach((key) => {
        result[key] = mergeValue(result[key], override[key])
      })
      return result
    }
    return cloneValue(override)
  }
  return cloneValue(override)
}

function getResolvedValue(key, lang) {
  const normalizedLang = isSupportedLanguage(lang) ? lang : DEFAULT_LANGUAGE
  const localZh = getNestedProperty(bundledResources.zh, key)
  const localCurrent = getNestedProperty(bundledResources[normalizedLang], key)
  const runtimeZh = getNestedProperty(runtimeResources.value.zh, key)
  const runtimeCurrent = getNestedProperty(runtimeResources.value[normalizedLang], key)

  return mergeValue(
    mergeValue(
      mergeValue(localZh, localCurrent),
      runtimeZh
    ),
    runtimeCurrent
  )
}

export async function refreshI18nResources() {
  try {
    const payload = await loadSiteI18nRuntime()
    runtimeSettings.value = {
      ...defaultSettings,
      ...(payload.settings || {})
    }
    runtimeResources.value = payload.resources || { zh: {}, en: {} }
  } catch (error) {
    runtimeSettings.value = { ...defaultSettings }
    runtimeResources.value = { zh: {}, en: {} }
  } finally {
    isI18nRuntimeReady.value = true
    i18nResourceVersion.value += 1
  }
}

export async function initializeLanguage() {
  applyLanguage(resolveInitialLanguage())
  await refreshI18nResources()
  return applyLanguage(resolveInitialLanguage())
}

export function getText(key, forceLang = null) {
  i18nResourceVersion.value
  const lang = isSupportedLanguage(forceLang) ? forceLang : currentLanguage.value
  const text = getResolvedValue(key, lang)
  return text !== undefined ? text : key
}

export function switchLanguage(lang) {
  const normalizedLang = normalizeLanguage(lang)
  if (normalizedLang) {
    applyLanguage(normalizedLang)
  }
}

export function isChinese() {
  return currentLanguage.value === 'zh'
}

export const i18nPlugin = {
  install(app) {
    app.config.globalProperties.$t = getText
    app.config.globalProperties.$lang = currentLanguage
    app.provide('i18n', {
      getText,
      currentLanguage,
      switchLanguage,
      isChinese,
      isEnglishEnabled,
      refreshI18nResources
    })
  }
}

export default {
  currentLanguage,
  runtimeSettings,
  i18nResourceVersion,
  isI18nRuntimeReady,
  initializeLanguage,
  refreshI18nResources,
  getText,
  switchLanguage,
  isChinese,
  isEnglishEnabled,
  i18nPlugin
}
