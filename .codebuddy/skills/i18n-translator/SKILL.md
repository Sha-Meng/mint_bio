---
name: i18n-translator
description: >
  This skill handles bilingual (Chinese/English) translation replacement for the mint_bio Vue 3 project.
  It should be used when the user provides Chinese-English translation pairs and needs them applied to
  the i18n JSON resource files (zh-CN.json / en-US.json) and optionally wired into Vue component templates
  via getText() calls. This skill covers JSON key updates, new key additions, template getText() wiring,
  and computed data pattern conversion for reactive i18n in Vue 3 components.
---

# i18n Translator Skill for mint_bio

## Purpose

Perform fast, accurate bilingual translation replacement for the mint_bio project. When the user provides Chinese-English translation pairs (or a translation document), apply them to the i18n resource files and wire Vue templates accordingly.

## Project i18n Architecture

### Resource Files

- **Chinese**: `src/i18n/zh-CN.json` — source of truth for all Chinese text
- **English**: `src/i18n/en-US.json` — mirrors zh-CN.json structure; untranslated values remain as Chinese placeholders

### Core API (`src/utils/language.js`)

- `getText(key, forceLang?)` — synchronous translation lookup by dot-notation key
- `currentLanguage` — reactive `ref('zh' | 'en')`
- `switchLanguage(lang)` — toggle language and persist to localStorage
- `isChinese()` — returns boolean
- `i18nPlugin` — Vue 3 plugin providing `$t`, `$lang`, and `inject('i18n')`

### Key Rules

1. **NEVER independently translate content** — only fill in translations explicitly provided by the user
2. **News section excluded** — do not touch any news-related translation
3. **Structure must match** — `en-US.json` must maintain identical key structure to `zh-CN.json`
4. **Untranslated = Chinese** — any key without provided English translation keeps its Chinese value in `en-US.json`

## Workflow

When the user provides translation pairs, execute the following steps in order:

### Step 1: Parse Translation Input

Accept translation input in any of these formats:
- Key-value pairs: `key: Chinese | English`
- Table format: `| key | 中文 | English |`
- Flat text: `中文内容 → English content`
- JSON patch: partial JSON with English values
- Document/spreadsheet reference

Map each translation to its corresponding JSON key path. If the Chinese text in the input matches an existing value in `zh-CN.json`, locate the matching key automatically.

### Step 2: Update JSON Resource Files

For each translation pair:

1. **Verify** the key exists in `zh-CN.json` and the Chinese value matches
2. **Update** the corresponding key in `en-US.json` with the English translation
3. If a new key is needed (new content not yet in JSON):
   - Add the key to both `zh-CN.json` (Chinese value) and `en-US.json` (English value)
   - Follow the existing naming convention and nesting structure

#### JSON Update Patterns

**Simple string value:**
```json
// en-US.json: before
"slogan": "生物智造惠及每一个生命"

// en-US.json: after
"slogan": "Create Green Products Benefiting Every Life"
```

**Array of objects:**
```json
// en-US.json: before
"stats": [
  { "number": "2类", "desc": "合成2类养猪氨基酸" }
]

// en-US.json: after
"stats": [
  { "number": "2 Types", "desc": "Synthesize 2 types of amino acids for pig farming" }
]
```

**Nested object:**
```json
// en-US.json: before
"features": {
  "renewable": { "title": "可再生原料", "desc": "源自微生物和秸秆、淀粉等非粮生物质。" }
}

// en-US.json: after
"features": {
  "renewable": { "title": "Renewable Materials", "desc": "Derived from microorganisms and non-grain biomass such as straw and starch." }
}
```

### Step 3: Wire Vue Templates (if needed)

If any translated text exists as hardcoded Chinese in Vue templates (not yet using `getText()`), wire it up.

#### Pattern A: Composition API (setup script)

For components using `<script setup>` or Composition API:

```vue
<script setup>
import { getText } from "@/utils/language";
</script>

<template>
  <p>{{ getText('module.key') }}</p>
</template>
```

#### Pattern B: Options API

For components using Options API, add `getText` via `setup()`:

```vue
<script>
import { getText } from "@/utils/language";
export default {
  setup() {
    return { getText };
  }
}
</script>
```

#### Pattern C: Computed Data Arrays

When a data array contains translatable text and needs to be reactive to language changes, convert `ref` to `computed`:

```javascript
// Before: static ref (not reactive to language change)
const cardData = ref([
  { title: "白色污染", items: ["..."] }
]);

// After: computed (reactive to language change)
const cardData = computed(() => getText('vision.crisisCards'));
```

#### Pattern D: Hover State with Computed

When computed data needs mutable hover state, use a separate `hoveredCardKey` ref:

```javascript
const hoveredCardKey = ref(null);

// In template:
// :style="{ transform: hoveredCardKey === index ? 'scale(1.05)' : '' }"
// @mouseenter="hoveredCardKey = index"
// @mouseleave="hoveredCardKey = null"
```

### Step 4: Validation

After all changes:

1. Verify `zh-CN.json` and `en-US.json` have identical key structures
2. Verify all `getText()` key references in templates match existing JSON keys
3. Run `yarn build` to confirm no compilation errors

## Key Path Naming Convention

Follow existing patterns in the JSON files:

| Module | Prefix | Example |
|--------|--------|---------|
| Navigation | `nav.*` | `nav.bioIntelligent` |
| Home page | `home.*` | `home.hero.tagline` |
| Products | `products.*` | `products.list[0].name` |
| Contact | `contact.*` | `contact.title` |
| Footer | `footer.*` | `footer.slogan` |
| Vision | `vision.*` | `vision.policies[0].title` |
| Amino Acid | `aminoAcid.*` | `aminoAcid.title1` |
| New Material | `newMaterial.*` | `newMaterial.features[0]` |
| Knot Weed | `knotWeed.*` | `knotWeed.stats[0].number` |
| Corporate | `corporate.*` | `corporate.intro1` |
| Bio Intelligent | `bioIntelligent.*` | `bioIntelligent.features.renewable.title` |
| Common | `common.*` | `common.buttons.learnMore` |
| Propagate | `propagate.*` | `propagate.title` |
| Mouse Scroll | `mouseScroll.*` | `mouseScroll.line1` |
| News | `news.*` | `news.title` |

## Pages/Components getText() Wiring Status (Audited 2026-03-08)

### Fully Wired (getText imported + all template text uses getText):
- `src/pages/AminoAcid/index.vue` ✅
- `src/pages/AminoAcidMobile/index.vue` ✅
- `src/pages/CorporateVision/index.vue` ✅
- `src/pages/CorporateVisionMobile/index.vue` ✅
- `src/pages/Home/index.vue` ✅ (⚠️ script中"应用领域"用于字符串分割逻辑，需注意语言切换兼容)
- `src/pages/HomeMobile/index.vue` ✅
- `src/pages/Vision/index.vue` ✅
- `src/pages/Vision/VisionModule5.vue` ✅
- `src/pages/VisionMobile/index.vue` ✅
- `src/pages/VisionMobile/CrisisCard/index.vue` ✅
- `src/pages/KnotWeed/index.vue` ✅
- `src/components/Header/index.vue` ✅
- `src/components/MobileHeader/index.vue` ✅
- `src/components/Contact/index.vue` ✅
- `src/components/ContactMobile/index.vue` ✅
- `src/components/Propagate/index.vue` ✅
- `src/components/MouseScrollMobile/index.vue` ✅

### Partially Wired (getText imported but some hardcoded Chinese remains):
- `src/pages/VisionMobile/VisionModule5.vue` ⚠️ — 残留: `生物智造 [ 产品解决方案 ]`、`匹配元素驱动现有产品…`
- `src/pages/KnotWeedMobile/index.vue` ⚠️ — 残留: BannerTitle中 `每年大豆进口量近`、`吨`、`进口大豆用于提供饲用蛋白`
- `src/components/Footer/index.vue` ⚠️ — 残留: `关于我们`、`企业介绍`、`愿景与责任`
- `src/components/FooterMobile/index.vue` ⚠️ — 残留: `加入我们`、`下载中心`

### NOT Wired (no getText, all hardcoded Chinese — HIGH priority):
- `src/pages/NewMaterial/index.vue` ❌ — 模板+data大量中文（features、categories、cases、faqList）
- `src/pages/NewMaterialMobile/index.vue` ❌ — 模板+data大量中文
- `src/pages/BioIntelligentMobile/index.vue` ❌ — 模板+data大量中文（caseList、caseList2）
- `src/components/BioIntelligent/BioIntelligentPart2.vue` ❌ — 科研/产业描述
- `src/components/BioIntelligent/BioIntelligentPart3.vue` ❌ — 了解生物智造、bannerList
- `src/components/BioIntelligent/BioIntelligentPart4.vue` ❌ — 平台流程图全部标签
- `src/components/BioIntelligent/BioIntelligentPart5.vue` ❌ — 未来60%物质
- `src/components/BioIntelligent/BioIntelligentPart6.vue` ❌ — 基地信息（地名、数据标签）
- `src/pages/MiNTNewsMobile/MiNTNewsMobile.vue` ❌ — 发展动态标题
- `src/components/AaModuleContent/index.vue` ❌ — `匹配顾问` 按钮

### No Chinese Text (no wiring needed):
- `src/pages/BioIntelligent/index.vue` — 纯容器组件
- `src/pages/MiNTNews/MiNTNews.vue` — 纯容器组件
- `src/components/BioIntelligent/BioIntelligentPart1.vue` — 纯图片
- `src/components/BioIntelligent/BioIntelligentPart7.vue` — 纯图片
- `src/components/AaModuleContentMobile/index.vue` — 无中文
- `src/components/BannerTitle/index.vue` — props传入
- `src/components/BannerTitleAnimation/index.vue` — props传入
- `src/components/BannerTitleAnimationMobile/index.vue` — props传入

## en-US.json Untranslated Fields (Audited 2026-03-08)

The following modules in `en-US.json` still have Chinese values (not yet translated):

| Module | Untranslated Count | Severity |
|--------|-------------------|----------|
| `newMaterial.*` | ~80 fields | 🔴 Entire module |
| `knotWeed.*` | ~23 fields | 🔴 Entire module |
| `bioIntelligent.*` (except bases) | ~43 fields | 🔴 Most of module |
| `news.*` | 6 fields | 🟡 Entire module |
| `footer.*` | 10 fields | 🟡 Most of module |
| `home.hero.*` | 4 fields | 🟡 |
| `home.caseList.*` | 8 fields | 🟡 |
| `home.testimonialParts.*` | 3 fields | 🟡 |
| `vision.*` (partial) | ~12 fields | 🟡 |
| `propagate.*` | 3 fields | 🟡 |
| `mouseScroll.*` | 2 fields | 🟡 |
| `nav.*` | 2 fields | 🟢 |
| `aminoAcid.slogan1/2` | 2 fields | 🟢 |

**Total: ~198 fields still in Chinese in en-US.json**

## CRITICAL Execution Rules

When executing this skill for a translation task:

1. **MUST complete BOTH steps for every page**: JSON filling AND Vue component getText() wiring
2. **Check the wiring status table above** before starting — know which components already use getText and which don't
3. **For "NOT Wired" components**: after JSON translation, MUST also add `import { getText }` and replace hardcoded Chinese
4. **For "Partially Wired" components**: only fix the specific residual hardcoded strings
5. **Always run build verification** after all changes
6. **Update this status table** after completing each page's migration

## Batch Translation Example

When user provides:

```
footer.aboutUs: 关于我们 | About Us
footer.corporate: 企业介绍 | Company Profile
footer.visionResponsibility: 愿景与责任 | Vision & Responsibility
```

Execute:
1. Read `en-US.json`
2. Replace `"aboutUs": "关于我们"` with `"aboutUs": "About Us"` under `footer`
3. Replace `"corporate": "企业介绍"` with `"corporate": "Company Profile"` under `footer`
4. Replace `"visionResponsibility": "愿景与责任"` with `"visionResponsibility": "Vision & Responsibility"` under `footer`
5. Verify key structure consistency
