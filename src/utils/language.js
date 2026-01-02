import { ref } from 'vue'

// 语言状态管理
export const currentLanguage = ref(localStorage.getItem('language') || 'zh')

// 同步语言资源 - 为了兼容现有组件
const syncLanguageResources = {
  zh: {
    nav: {
      bioIntelligent: "生物智造",
      products: "产品",
      material: "生物降解新材料", 
      aminoAcid: "生物合成氨基酸",
      knotWeed: "节豆日粮解决方案",
      aboutUs: "关于我们",
      corporate: "企业概况", 
      vision: "企业愿景",
      news: "发展动态",
      contact: "联系我们",
      language: "中文"
    },
    home: {
      sections: {
        technology: {
          title: "前沿\n科技力",
          subtitle: "与合作伙伴共担ESG责任，共筑地球可持续未来"
        },
        platform: {
          title: "平台\n强赋能",
          subtitle: "独创MiNT X Platform, AI赋能生物智造"
        },
        products: {
          title: "卓越\n产品力",
          materials: "系列高性能新型生态环保材料PiX",
          materialsDesc: "生物基、可降解、可回收",
          aminoAcids: "生物合成氨基酸",
          aminoAcidsDesc: "高效生物合成20+种氨基酸"
        },
        sustainability: {
          title: "绿色\n可持续",
          subtitle: "与合作伙伴共担ESG责任，共筑地球可持续未来"
        }
      },
      hero: {
        tagline: "生物智造，无限可能",
        description: "元素驱动已打通研发，生产，下游产品转化的生物智造全链路。我们布局多个应用领域，并与下游龙头企业合作打造自有工厂，发展可能性无限的生物智造产品矩阵。"
      }
    },
    contact: {
      title: "洽谈合作",
      subtitle: "感谢您对元素驱动的关注，如您对生物智造产品 & 解决方案有兴趣或疑问，",
      instruction: "使用1分钟填写下方表格，我们将尽快安排工作人员与您建联。",
      alternativeContact: "您也可以通过以下渠道找到我们",
      advisors: {
        aminoAcid: "氨基酸产品顾问",
        materials: "新材料产品顾问"
      },
      wechat: "扫码添加",
      email: "邮箱：mkt@mint-bio.com",
      followUs: "关注公众号了解",
      followUsDesc: "公司动向、产品信息、行业新闻、前沿进展",
      followUsItems: {
        companyUpdates: "公司动向",
        productInfo: "产品信息",
        industryNews: "行业新闻",
        frontierProgress: "前沿进展"
      }
    },
    footer: {
      slogan: "生物智造惠及每一个生命",
      sections: {
        biomanufacturing: "生物智造",
        joinUs: "加入我们"
      }
    },
    common: {
      buttons: {
        learnMore: "了解更多",
        submit: "提交",
        contact: "联系我们",
        more: "更多",
        back: "返回"
      },
      actions: {
        moreNews: "更多动态"
      },
      labels: {
        inDevelopment: "在研产品",
        performanceAdvantages: "性能优势",
        applicationAreas: "应用领域",
        partners: "合作伙伴",
        testimonial: "您的选择和他们一样",
        address: "总部地址",
        contactAdvisor: "联系顾问"
      },
      forms: {
        name: "姓名",
        email: "邮箱",
        phone: "电话",
        message: "留言",
        description: "请简单描述您的问题",
        placeholders: {
          name: "您的姓名...",
          email: "您的邮箱...",
          phone: "您的电话...",
          message: "您的留言...",
          messageWithDesc: "您的留言...(请简单描述您的问题)"
        },
        validation: {
          required: "请填写完整信息",
          invalidEmail: "请输入有效的邮箱地址",
          invalidPhone: "请输入有效的手机号码",
          submitSuccess: "提交成功",
          formatError: "请求格式错误，请检查输入信息"
        }
      }
    }
  },
  en: {
    nav: {
      bioIntelligent: "Intelligent Biomanufacturing",
      products: "Products",
      material: "Biodegradable New Materials",
      aminoAcid: "Biosynthetic Amino Acids", 
      knotWeed: "Soybean-Reduced Ration Solutions",
      aboutUs: "About Us",
      corporate: "Company Profile",
      vision: "Vision & Responsibility", 
      news: "News",
      contact: "Contact Us",
      language: "English"
    },
    home: {
      sections: {
        technology: {
          title: "Technological\nProwess",
          subtitle: "Together to build a sustainable future"
        },
        platform: {
          title: "Platform\nEmpowerment",
          subtitle: "Powered by the proprietary MiNT X Platform, leveraging AI for Bio-Intelligent Manufacturing"
        },
        products: {
          title: "Product\nExcellence",
          materials: "PiX: Novel High-Performance Eco-Friendly Materials",
          materialsDesc: "Bio-based, Biodegradable, and Recyclable",
          aminoAcids: "Biosynthetic amino acids",
          aminoAcidsDesc: "20+ Types of Brilliant BioAmino"
        },
        sustainability: {
          title: "Green &\nSustainable",
          subtitle: "Together to build a sustainable future"
        }
      },
      hero: {
        tagline: "Infinity from Biomanufacturing",
        description: "MiNT Bio has built an end-to-end intelligent biomanufacturing platform, integrating R&D, production, and commercialization. By partnering with industry leaders and establishing our own manufacturing hubs, we are cultivating a diverse bio-product matrix with limitless potential."
      }
    },
    contact: {
      title: "Cooperation Enquiry",
      subtitle: "Thank you for your interest in MiNT Bio. If you are interested in or have questions about our intelligent biomanufacturing products & solutions,",
      instruction: "please take 1 minute to fill out the form below, and we will arrange for advisors to contact you promptly.",
      alternativeContact: "Our Contacts",
      advisors: {
        aminoAcid: "Amino Acid Products Advisor",
        materials: "New Materials Products Advisor"
      },
      wechat: "Scan QR Code to Add",
      email: "Email: mkt@mint-bio.com",
      followUs: "Follow our WeChat Official Account to Learn About",
      followUsDesc: "Company Updates, Product Information, Industry News, Frontier Progress",
      followUsItems: {
        companyUpdates: "Company Updates",
        productInfo: "Product Information",
        industryNews: "Industry News",
        frontierProgress: "Frontier Progress"
      }
    },
    footer: {
      slogan: "Create Green Products Benefiting Every Life",
      sections: {
        biomanufacturing: "Intelligent Biomanufacturing",
        joinUs: "Join Us"
      }
    },
    common: {
      buttons: {
        learnMore: "Learn More",
        submit: "Submit",
        contact: "Contact Us",
        more: "More",
        back: "Back"
      },
      actions: {
        moreNews: "More News"
      },
      labels: {
        inDevelopment: "Products in R&D",
        performanceAdvantages: "Performance Advantages",
        applicationAreas: "Application Areas", 
        partners: "Partners",
        testimonial: "THEY Trusted Our Innovation.",
        address: "Address",
        contactAdvisor: "Contact Advisor"
      },
      forms: {
        name: "Name",
        email: "E-mail",
        phone: "Tel",
        message: "Message",
        description: "Please briefly describe your inquiry",
        placeholders: {
          name: "Your Name...",
          email: "Your Email...",
          phone: "Your Phone...",
          message: "Your Message...",
          messageWithDesc: "Your Message... (Please briefly describe your inquiry)"
        },
        validation: {
          required: "Please fill in all required fields",
          invalidEmail: "Please enter a valid email address",
          invalidPhone: "Please enter a valid phone number",
          submitSuccess: "Submitted successfully",
          formatError: "Request format error, please check your input"
        }
      }
    }
  }
}

// 资源缓存
const resourceCache = new Map()

// 语言代码映射
const langMap = {
  'zh': 'zh-CN',
  'en': 'en-US'
}

// 动态导入资源文件
async function loadResource(module, locale) {
  const cacheKey = `${module}-${locale}`
  
  if (resourceCache.has(cacheKey)) {
    return resourceCache.get(cacheKey)
  }

  try {
    let resource
    if (module === 'common') {
      resource = await import(`../i18n/common/${locale}.json`)
    } else {
      resource = await import(`../i18n/modules/${module}/${locale}.json`)
    }
    
    const data = resource.default || resource
    resourceCache.set(cacheKey, data)
    return data
  } catch (error) {
    console.warn(`Failed to load language resource: ${module}/${locale}`, error)
    return {}
  }
}

// 获取嵌套对象属性
function getNestedProperty(obj, path) {
  if (!obj || !path) return undefined
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// 混合语言管理器类
class LanguageManager {
  constructor() {
    this.preloadedResources = {
      // 预加载的通用资源和导航资源
      common: null,
      navigation: null
    }
    
    // 预加载核心资源
    this.preloadCoreResources()
  }

  async preloadCoreResources() {
    const locale = langMap[currentLanguage.value] || 'zh-CN'
    
    try {
      // 预加载通用资源和导航资源
      this.preloadedResources.common = await loadResource('common', locale)
      this.preloadedResources.navigation = await loadResource('navigation', locale)
    } catch (error) {
      console.warn('Failed to preload core resources:', error)
    }
  }

  // 核心文本获取方法 - 支持优先级查找
  async getText(key, options = {}) {
    const {
      module = null,
      forceLang = null,
      fallback = key
    } = options

    const locale = langMap[forceLang || currentLanguage.value] || 'zh-CN'
    let text = undefined

    // 1. 如果指定了模块，优先从模块资源中查找
    if (module) {
      try {
        const moduleResource = this.preloadedResources[module] || 
                               await loadResource(module, locale)
        text = getNestedProperty(moduleResource, key)
        
        if (text) return text
      } catch (error) {
        console.warn(`Failed to get text from module ${module}:`, error)
      }
    }

    // 2. 从通用资源中查找
    try {
      const commonResource = this.preloadedResources.common || 
                            await loadResource('common', locale)
      text = getNestedProperty(commonResource, key)
      
      if (text) return text
    } catch (error) {
      console.warn('Failed to get text from common resources:', error)
    }

    // 3. 如果没有指定模块，尝试从预加载的导航资源中查找
    if (!module && this.preloadedResources.navigation) {
      text = getNestedProperty(this.preloadedResources.navigation, key)
      if (text) return text
    }

    // 4. 返回fallback值
    return fallback
  }

  // 语言切换
  async switchLanguage(lang) {
    if (lang !== 'zh' && lang !== 'en') {
      console.warn('Unsupported language:', lang)
      return
    }

    currentLanguage.value = lang
    localStorage.setItem('language', lang)
    
    // 清除缓存，重新加载核心资源
    resourceCache.clear()
    this.preloadedResources.common = null
    this.preloadedResources.navigation = null
    
    await this.preloadCoreResources()
  }

  // 预加载特定模块资源
  async preloadModule(moduleName) {
    const locale = langMap[currentLanguage.value] || 'zh-CN'
    
    try {
      this.preloadedResources[moduleName] = await loadResource(moduleName, locale)
    } catch (error) {
      console.warn(`Failed to preload module ${moduleName}:`, error)
    }
  }

  // 获取当前语言
  getCurrentLanguage() {
    return currentLanguage.value
  }

  // 判断是否为中文
  isChinese() {
    return currentLanguage.value === 'zh'
  }
}

// 创建全局语言管理器实例
const languageManager = new LanguageManager()

// 获取嵌套对象属性的同步工具函数
function getNestedPropertySync(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// 兼容性函数 - 保持与现有代码的同步兼容性
export function getText(key, forceLang = null) {
  const lang = forceLang || currentLanguage.value
  const resources = syncLanguageResources[lang] || syncLanguageResources.zh
  const text = getNestedPropertySync(resources, key)
  return text || key
}

export function switchLanguage(lang) {
  if (lang === 'zh' || lang === 'en') {
    currentLanguage.value = lang
    // 持久化到本地存储
    localStorage.setItem('language', lang)
    
    // 触发语言管理器更新
    languageManager.switchLanguage(lang).catch(console.warn)
  }
}

// 异步版本的getText - 用于新功能
export async function getTextAsync(key, options = {}) {
  const {
    module = null,
    forceLang = null,
    fallback = key
  } = options

  const locale = langMap[forceLang || currentLanguage.value] || 'zh-CN'
  let text = undefined

  // 1. 如果指定了模块，优先从模块资源中查找
  if (module) {
    try {
      const moduleResource = await loadResource(module, locale)
      text = getNestedPropertySync(moduleResource, key)
      
      if (text) return text
    } catch (error) {
      console.warn(`Failed to get text from module ${module}:`, error)
    }
  }

  // 2. 从通用资源中查找
  try {
    const commonResource = await loadResource('common', locale)
    text = getNestedPropertySync(commonResource, key)
    
    if (text) return text
  } catch (error) {
    console.warn('Failed to get text from common resources:', error)
  }

  // 3. fallback到同步资源
  text = getText(key, forceLang)
  return text !== key ? text : fallback
}

// 中文状态判断函数
export function isChinese() {
  return currentLanguage.value === 'zh'
}

// 新版API - 支持模块化调用
export const useTranslation = () => {
  return {
    t: (key, options) => getTextAsync(key, options),
    tSync: (key, forceLang) => getText(key, forceLang),
    switchLang: (lang) => switchLanguage(lang),
    currentLang: currentLanguage,
    isChinese: () => isChinese(),
    preloadModule: (module) => languageManager.preloadModule(module)
  }
}

// 导出语言管理器实例供高级使用
export { languageManager }

// 默认导出保持兼容性
export default {
  currentLanguage,
  getText,
  switchLanguage, 
  isChinese,
  useTranslation,
  languageManager
}