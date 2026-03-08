import { ref } from 'vue'
import zhCN from '@/i18n/zh-CN.json'
import enUS from '@/i18n/en-US.json'

// 语言资源
const resources = { zh: zhCN, en: enUS }

// 语言状态管理
export const currentLanguage = ref(localStorage.getItem('language') || 'zh')

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
  if (lang === 'zh' || lang === 'en') {
    currentLanguage.value = lang
    localStorage.setItem('language', lang)
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
  currentLanguage,
  getText,
  switchLanguage,
  isChinese,
  i18nPlugin
}
