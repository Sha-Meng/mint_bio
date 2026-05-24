---
name: operator-friendly-i18n-rework
overview: 评估当前 mint_bio 项目中英文切换与固定文案配置实现，设计面向运营更友好的改造空间与可分阶段落地方案。
todos:
  - id: audit-current-i18n
    content: 使用 [subagent:code-explorer] 审计 i18n key、硬编码和刷新链路
    status: pending
  - id: create-openspec-plan
    content: 创建运营化中英文配置 OpenSpec 计划文件
    status: pending
    dependencies:
      - audit-current-i18n
  - id: design-directus-model
    content: 设计固定文案和语言开关后台数据模型
    status: pending
    dependencies:
      - create-openspec-plan
  - id: build-runtime-loader
    content: 改造 language.js 运行时加载并保留 JSON fallback
    status: pending
    dependencies:
      - design-directus-model
  - id: clean-switch-and-news
    content: 清理语言入口、新闻分类和切换刷新逻辑
    status: pending
    dependencies:
      - build-runtime-loader
  - id: seed-approved-content
    content: 使用 [skill:document-docx] 和 [skill:i18n-translator] 生成合规种子数据
    status: pending
    dependencies:
      - design-directus-model
  - id: update-docs-validate
    content: 更新运营文档并完成 lint、build 与回退验收
    status: pending
    dependencies:
      - clean-switch-and-news
      - seed-approved-content
---

## User Requirements

用户希望梳理当前官网中英文切换与文案配置的实现方式，并评估是否存在更适合运营人员维护的改造空间。重点关注现有配置是否过于开发化、是否不易理解、是否每次改动都需要重新发布，以及能否让运营以更直观的方式维护中英文内容。

## Product Overview

官网中英文内容运营化改造方案：将目前分散、偏开发配置的固定文案与语言入口管理，逐步改造成后台表单化、可预览、可回退、可审计的运营维护流程，同时保持前台现有页面视觉与语言切换体验稳定。

## Core Features

- 梳理当前中英文切换、固定文案、新闻英文内容、语言入口开关的现状与痛点。
- 提供运营友好的维护方案，让运营通过后台字段编辑文案和开关状态。
- 前台支持运行时读取已发布内容，减少固定文案修改对重新发布的依赖。
- 保留中文兜底、英文缺失回退、异常降级，避免页面出现空白或异常 key。
- 建立内容覆盖率检查、缺失项报告和翻译合规流程，避免未确认翻译上线。

## Tech Stack Selection

- **现有前端**：Vue 3 + `@vue/compat`、Vue Router 4、Vue CLI、Axios、Element Plus。
- **现有语言机制**：自研 `src/utils/language.js`，通过 `currentLanguage`、`getText()`、`switchLanguage()` 读取 `src/i18n/zh-CN.json` 与 `src/i18n/en-US.json`。
- **现有内容后台**：新闻已接入 Directus REST，`src/api/news.js` 已有 Directus URL、资源 URL、sessionStorage TTL 缓存、中文/英文 fallback 等成熟模式。
- **推荐方案**：不引入 `vue-i18n` 做大规模替换，优先复用现有 `getText()` 调用面；新增“运行时文案资源层”，从 Directus 读取运营维护的固定文案与语言开关，并保留本地 JSON 作为构建时兜底。

## Implementation Approach

### 当前判断

当前项目确实存在面向运营不友好的问题：

1. 固定文案在源码 JSON 和部分 Vue 组件中，运营无法安全直观维护。
2. 英文入口开关是 `src/utils/language.js` 中的源码常量 `FEATURE_EN_ENABLED = false`，开启需要改代码、构建、部署。
3. 新闻内容在 Directus，固定文案在前端资源文件，维护入口割裂。
4. `src/i18n/common/`、`src/i18n/modules/` 下存在模块化 JSON，但当前运行时只导入根级 `zh-CN.json`、`en-US.json`，资源结构容易误导。
5. 部分英文资源仍残留中文，且缺 key 时直接显示 key，缺少运营前的校验与报告。
6. PC / Mobile 组件存在重复硬编码中文，开启英文后仍可能显示中文。
7. 新闻列表、首页新闻多在 mounted 时拉取，未来切换语言后需要补刷新或重新映射机制。

### 推荐分阶段方案

#### 阶段 1：低风险评估与审计

先建立 OpenSpec 计划，输出现状审计清单：

- 固定文案 key 覆盖率。
- 英文缺失/中文残留清单。
- 组件硬编码中文清单。
- 当前真正生效的 JSON 与未生效模块化 JSON 的差异。
- 语言切换后不自动刷新的页面清单。

该阶段不改变线上行为。

#### 阶段 2：运行时文案资源层

保留现有 `getText(key)` 调用方式，降低改造面：

- 新增 `src/api/siteI18n.js`，按现有 `src/api/news.js` 的 Directus 请求和缓存风格，读取运营维护的固定文案与语言设置。
- 改造 `src/utils/language.js`：
- 本地 `zh-CN.json` / `en-US.json` 仍作为 fallback。
- 启动时读取运行时资源，成功后覆盖同名 key。
- 英文入口开关由后台配置控制，不再只依赖源码常量。
- 增加 `i18nVersion` 或等价响应式版本号，保证运行时资源加载后依赖 `getText()` 的 computed 能重新计算。
- fallback 顺序：运行时当前语言 -> 运行时中文 -> 本地当前语言 -> 本地中文 -> key。
- 改造 `src/main.js`：
- 将 `initializeLanguage()` 支持异步初始化。
- 设置合理超时，避免后台异常拖慢首屏。
- 后台不可用时仍使用本地 JSON 正常渲染。

#### 阶段 3：Directus 运营模型

建议新增两个运营集合，避免运营直接编辑复杂 JSON：

- `site_i18n_entries`
- `key_path`：如 `nav.news`、`footer.contact.email`、`products.list.0.title`。
- `label_zh`：运营可读名称。
- `page` / `section`：页面与模块分组。
- `value_type`：text、textarea、richtext、url、number 等。
- `value_zh` / `value_en`：中英文内容。
- `status`：draft / published。
- `sort`：排序。
- `updated_at`：用于缓存版本判断。
- `site_i18n_settings`
- `feature_en_enabled`：英文入口是否开放。
- `default_language`：默认语言。
- `published_version`：当前发布版本。
- `updated_at`：用于前端缓存刷新。

该模型让运营在表格/表单里按页面、模块、字段编辑，不需要理解嵌套 JSON。

#### 阶段 4：硬编码收敛与新闻联动

- Header / MobileHeader 改为读取运行时英文开关。
- 新闻分类优先使用 Directus 分类中英文名称，避免前端硬编码分类。
- 新闻列表和详情补充语言切换响应，切换语言后重新映射或重新请求。
- 清理新闻页标题、面包屑、返回按钮、筛选项等硬编码中文。
- PC / Mobile 复用同一份 key 与分类数据，减少重复维护。

#### 阶段 5：导入、校验与运营文档

- 从现有本地 JSON 生成 Directus 种子数据。
- 英文内容只能来自 `doc/zh-en/` 中已确认的翻译对照；未覆盖字段保留中文或标记待确认。
- 新增审计脚本，输出缺失翻译、未发布项、重复 key、未使用 key、组件硬编码中文报告。
- 更新运营文档，说明“新闻内容”和“官网固定文案”的维护边界。

## Implementation Notes

- **兼容性**：必须保留 `getText()`、`currentLanguage`、`switchLanguage()` 导出，避免一次性改动大量组件。
- **性能**：运行时文案只在启动或版本变化时批量加载，不在每次 `getText()` 时请求网络；内存中使用扁平 key 合并后的对象读取，单次查询接近 O(key 深度)。
- **缓存**：参考 `src/api/news.js` 的 sessionStorage TTL 模式；可使用 `published_version` 或 `updated_at` 做增量判断，避免频繁请求 Directus。
- **可靠性**：Directus 请求失败、字段缺失、英文未发布时均回退本地中文，不影响线上访问。
- **翻译合规**：不得自行补译；导入或新增英文必须严格来自 `doc/zh-en/` 对照文件或用户确认稿。
- **风险控制**：第一版只改文案资源来源和语言开关，不改变页面布局；未完成硬编码清理前，英文入口可继续保持后台关闭。
- **日志与排查**：仅在开发环境输出缺 key、资源加载失败摘要，生产避免打印大 payload 或敏感配置。
- **避免技术债**：不建议此阶段全量引入 `vue-i18n`，因为它不能直接解决运营无需发布的问题，且会扩大组件重构范围。

## Architecture Design

### Current Flow

```text
src/main.js
  -> initializeLanguage()
  -> src/utils/language.js
  -> static import src/i18n/zh-CN.json + src/i18n/en-US.json
  -> components call getText(key)
```

### Target Flow

```text
src/main.js
  -> initializeLanguage()
  -> src/utils/language.js
      -> load bundled fallback JSON
      -> fetch published runtime i18n/settings
      -> merge resources and expose getText()
  -> components keep using getText(key)
  -> Directus manages published fixed copy and language switch
```

### Data Flow

```text
运营在后台维护字段
  -> 发布 site_i18n_entries / site_i18n_settings
  -> 前端启动批量读取并缓存
  -> getText(key) 使用运行时资源
  -> 缺失或异常时回退本地 JSON
```

## Directory Structure

```text
d:/UGit/mint_bio/
├── .codebuddy/
│   └── plans/
│       └── operator-friendly-i18n-runtime.md
│           # [NEW] OpenSpec 计划文件。记录需求、现状审计、Directus 模型、实施步骤、验收标准与风险。
│
├── src/
│   ├── main.js
│   │   # [MODIFY] 支持异步语言初始化；失败或超时时使用本地 fallback，避免影响首屏稳定性。
│   │
│   ├── utils/
│   │   └── language.js
│   │       # [MODIFY] 保留现有 API，新增运行时资源合并、后台英文开关、响应式资源版本、fallback 顺序。
│   │
│   ├── api/
│   │   ├── siteI18n.js
│   │   │   # [NEW] 读取 Directus 固定文案与语言设置；实现缓存、超时、字段标准化、错误降级。
│   │   └── news.js
│   │       # [MODIFY] 按需补充语言切换刷新或复用分类中英文名称，避免新闻分类硬编码。
│   │
│   ├── i18n/
│   │   ├── zh-CN.json
│   │   │   # [MODIFY] 继续作为中文 fallback；必要时补齐 key 结构，不自行新增未确认英文内容。
│   │   └── en-US.json
│   │       # [MODIFY] 继续作为英文 fallback；仅按 doc/zh-en 或用户确认稿修正。
│   │
│   ├── components/
│   │   ├── Header/index.vue
│   │   │   # [MODIFY] 语言入口显示改为读取运行时英文开关，保留现有视觉与交互。
│   │   ├── MobileHeader/index.vue
│   │   │   # [MODIFY] 移动端语言入口同 PC 逻辑，避免源码常量控制。
│   │   └── MiNTNews/
│   │       ├── MiNTNewsList.vue
│   │       │   # [MODIFY] 清理新闻筛选硬编码中文，支持分类中英文与语言切换刷新。
│   │       └── MiNTNewsListMobile.vue
│   │           # [MODIFY] 与 PC 新闻列表保持同一套分类和语言逻辑。
│   │
│   └── pages/
│       ├── Home/index.vue
│       │   # [MODIFY] 检查首页固定文案和新闻数据在语言切换后的刷新行为。
│       ├── HomeMobile/index.vue
│       │   # [MODIFY] 与 PC 首页保持一致，避免移动端语言切换后内容不更新。
│       └── MiNTNews/
│           └── MiNTNewsDetail.vue
│               # [MODIFY] 清理详情页硬编码中文，补充语言切换后详情内容刷新。
│
├── scripts/
│   ├── audit-i18n.mjs
│   │   # [NEW] 扫描缺失 key、中文残留、未使用 key、硬编码中文，生成审计报告。
│   └── directus-i18n-seed.mjs
│       # [NEW] 从本地 fallback 和批准翻译对照生成 Directus 导入数据；不自动编造翻译。
│
├── doc/
│   ├── operations/
│   │   ├── directus-i18n-guide.md
│   │   │   # [NEW] 面向运营的固定文案维护指南，说明页面分组、发布、回退和注意事项。
│   │   └── english-content-update.md
│   │       # [MODIFY] 更新英文内容维护流程，区分新闻内容与固定文案后台维护。
│   └── ops-dev/
│       └── frontend-pages-and-i18n.md
│           # [MODIFY] 更新运行时语言资源、fallback、缓存、开关配置和组件接入说明。
│
└── README.md
    # [MODIFY] 更新英文入口恢复方式，从源码常量改为后台配置与发布流程。
```

## Key Code Structures

```js
// Directus site_i18n_entries 运行时标准化后的前端结构
export interface SiteI18nEntry {
  key_path: string
  label_zh: string
  page: string
  section: string
  value_type: 'text' | 'textarea' | 'richtext' | 'url' | 'number'
  value_zh: string
  value_en?: string
  status: 'draft' | 'published'
  sort?: number
  updated_at?: string
}

export interface SiteI18nSettings {
  feature_en_enabled: boolean
  default_language: 'zh' | 'en'
  published_version?: string
  updated_at?: string
}
```

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: 继续做全仓 i18n key、硬编码中文、语言切换刷新链路审计。
- Expected outcome: 输出可实施的影响范围清单，避免遗漏 PC/Mobile 重复组件和新闻相关入口。

### Skill

- **document-docx**
- Purpose: 读取 `doc/zh-en/` 下翻译对照文档，提取已批准的中英文对应关系。
- Expected outcome: 为种子数据和英文修正提供合规来源，避免自行翻译。

- **i18n-translator**
- Purpose: 在用户提供或文档确认翻译后，安全更新 i18n fallback 和组件 `getText()` 接入。
- Expected outcome: 保持中英文资源结构一致，并生成缺失翻译清单。