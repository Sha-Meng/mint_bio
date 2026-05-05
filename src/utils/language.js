import { ref } from 'vue'
import zhCN from '@/i18n/zh-CN.json'
import enUS from '@/i18n/en-US.json'

// 英文入口功能开关（设为 true 可恢复英文版入口，详见 README.md "英文版入口恢复指引"）
export const FEATURE_EN_ENABLED = false

// 语言资源
const resources = { zh: zhCN, en: enUS }
const LANGUAGE_STORAGE_KEY = 'language'
const LANGUAGE_QUERY_KEY = 'lang'
const DEFAULT_LANGUAGE = 'zh'
const SUPPORTED_LANGUAGES = ['zh', 'en']

function normalizeLanguage(lang) {
  // 开关关闭时，en 视为无效语言
  if (!FEATURE_EN_ENABLED && lang === 'en') return null
  return SUPPORTED_LANGUAGES.includes(lang) ? lang : null
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
  const targetLang = normalizeLanguage(lang) || DEFAULT_LANGUAGE

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
  const targetLang = normalizeLanguage(lang) || DEFAULT_LANGUAGE
  currentLanguage.value = targetLang
  persistLanguage(targetLang)
  syncLanguageToUrl(targetLang)
  return targetLang
}

function resolveInitialLanguage() {
  // 开关关闭时直接返回默认语言，并清理可能残留的英文 localStorage
  if (!FEATURE_EN_ENABLED) {
    try {
      if (localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'en') {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, DEFAULT_LANGUAGE)
      }
    } catch (e) { /* ignore */ }
    return DEFAULT_LANGUAGE
  }
  return getLanguageFromUrl() || getStoredLanguage() || DEFAULT_LANGUAGE
}

// 语言状态管理
export const currentLanguage = ref(resolveInitialLanguage())

export function initializeLanguage() {
  return applyLanguage(resolveInitialLanguage())
}

// 获取嵌套对象属性
function getNestedProperty(obj, path) {
  if (!obj || !path) return undefined
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// 同步获取翻译文本
export function getText(key, forceLang = null) {
  const lang = forceLang || currentLanguage.value
  const res = resources[lang] || resources.zh
  const text = getNestedProperty(res, key)
  return text !== undefined ? text : key
}

// 切换语言
export function switchLanguage(lang) {
  const normalizedLang = normalizeLanguage(lang)
  if (normalizedLang) {
    applyLanguage(normalizedLang)
  }
}

// 判断是否为中文
export function isChinese() {
  return currentLanguage.value === 'zh'
}

// Vue 插件 - 全局注入
export const i18nPlugin = {
  install(app) {
    app.config.globalProperties.$t = getText
    app.config.globalProperties.$lang = currentLanguage
    app.provide('i18n', { getText, currentLanguage, switchLanguage, isChinese })
  }
}

// 默认导出保持兼容性
export default {
  FEATURE_EN_ENABLED,
  currentLanguage,
  initializeLanguage,
  getText,
  switchLanguage,
  isChinese,
  i18nPlugin
}

