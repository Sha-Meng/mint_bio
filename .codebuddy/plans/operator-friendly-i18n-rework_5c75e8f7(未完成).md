---
name: operator-friendly-i18n-rework
overview: 按用户反馈将长期方案收敛为简单高效版本：保留最少 Directus 配置集合，不做复杂审计/发布快照/新闻分类改造，目标是稳定、易搜、易改、配置即可生效。
todos:
  - id: audit-simple-scope
    content: 使用 [subagent:code-explorer] 复核语言链路和影响文件
    status: pending
  - id: write-simple-spec
    content: 创建简化版 OpenSpec 计划文件
    status: pending
    dependencies:
      - audit-simple-scope
  - id: design-two-tables
    content: 使用 [skill:directus-bt-migration-coach] 确认两表模型
    status: pending
    dependencies:
      - write-simple-spec
  - id: design-runtime-cache
    content: 设计 siteI18n 加载、缓存和 fallback 机制
    status: pending
    dependencies:
      - design-two-tables
  - id: plan-import-script
    content: 规划 JSON 扁平化导入与缺失英文清单
    status: pending
    dependencies:
      - design-two-tables
  - id: update-doc-boundaries
    content: 更新文档并标记新闻分类暂不处理
    status: pending
    dependencies:
      - design-runtime-cache
      - plan-import-script
---

## User Requirements

用户希望将“长期方案”从复杂的发布/审计体系，收敛为更简单、高效、方便运营操作的中英文配置方案。重点是让运营能在后台快速搜索、编辑、保存和刷新配置，不需要理解复杂 JSON，也不需要每次改固定文案都重新构建前端。

## Product Overview

建设一个轻量的官网固定文案运营配置能力：运营在后台通过表格化字段维护中英文文案和英文入口开关；前台运行时读取配置并缓存，异常时自动回退本地内容，保证页面稳定可访问。

## Core Features

- 固定文案按 key、分组、中文说明、中英文内容进行后台配置。
- 英文入口通过后台开关控制，不再依赖源码常量。
- 文案更新后通过简单版本号刷新前端缓存，无需复杂发布快照。
- 不建设复杂审计、审核、关键字段、报告表和回滚系统。
- 出现问题时，运营直接修正配置并更新版本号快速生效。
- 新闻分类中英文切换暂不纳入本期，仅在文档中明确边界。
- 前端保留本地 JSON 兜底，确保 Directus 异常时页面仍稳定显示。

## Tech Stack Selection

- **前端沿用现状**：Vue 3 + `@vue/compat`、Vue Router 4、Vue CLI、Axios。
- **语言机制沿用现状**：继续保留 `src/utils/language.js` 中的 `getText()`、`currentLanguage`、`switchLanguage()`、`initializeLanguage()` 和 `i18nPlugin`。
- **内容后台沿用现状**：继续使用现有 Directus，复用 `src/api/news.js` 中已验证的 REST 请求、缓存、异常降级思路。
- **不引入重型 i18n 框架**：当前核心问题是“运营后台配置”和“无需重新构建”，不是开发侧翻译库能力，因此不优先引入 `vue-i18n`。

## Implementation Approach

### 简化后的总体策略

长期方案收敛为“两张 Directus 表 + 一个前端运行时加载器 + 本地 JSON 兜底”。

运营只需要维护：

1. `site_i18n_entries`：固定文案配置表。
2. `site_i18n_settings`：全局语言配置表。

前端启动或缓存过期时读取 `site_i18n_settings.content_version`，如果版本变化则重新拉取 `site_i18n_entries`，合并到运行时资源中。组件仍继续调用 `getText(key)`，不做大规模组件重写。

### 对用户问题的明确回答：`site_i18n_releases` 怎么生成？

原方案里的 `site_i18n_releases` 是“每次发布生成一个版本快照”的集合，通常有三种生成方式：

- 由发布脚本读取当前 `site_i18n_entries` 后写入一条 release 快照；
- 由 Directus Flow 在运营点击发布时自动生成；
- 由管理员手动创建发布记录并绑定当前内容版本。

但按照当前“简单、高效、方便操作”的要求，**不建议保留 `site_i18n_releases`**。
简化方案中不做复杂发布快照，也不做发布历史回滚。运营改完配置后，只需要更新 `site_i18n_settings.content_version`，前端检测到版本变化后清缓存重拉。若内容有问题，直接改回字段并再次更新 `content_version` 即可。

### 本期明确不做

- 不建设 `site_i18n_releases`。
- 不建设 `site_i18n_audit_reports`。
- 不做复杂审核、关键字段、审计元数据、回滚快照。
- 不改造 `news_categories` 的中英文切换；仅在文档中标记为暂不纳入本期。
- 不自行补译英文内容；缺失英文按中文回退。

## Simplified Directus Data Model

### 1. `site_i18n_entries`

用途：保存官网固定文案，运营可以按分组、中文说明、key 快速搜索和编辑。

建议字段：

- `id`：Directus 主键。
- `key_path`：唯一文案 key，例如 `nav.news`、`footer.email`、`home.hero.title`。
- `group`：分组，例如 `nav`、`footer`、`home`、`news`、`product`、`common`。
- `label`：运营可读中文说明，例如“导航-新闻动态”。
- `value_zh`：中文内容。
- `value_en`：英文内容；未确认时可为空，前端回退中文。
- `enabled`：是否启用，默认 true。
- `sort`：排序，方便后台列表展示。
- `note`：可选备注，例如使用位置或字数提示。

不保留复杂字段：

- 不要 `translation_status`。
- 不要 `content_status`。
- 不要 `release_version`。
- 不要 `fallback_policy`。
- 不要 `is_required`。
- 不要 `reviewed_by` / `reviewed_at`。
- 不要复杂审计字段。

### 2. `site_i18n_settings`

用途：保存全局语言配置。建议只维护一条记录。

建议字段：

- `id`：固定一条记录，例如 `site-default`。
- `feature_en_enabled`：是否显示英文入口。
- `default_language`：默认语言，建议 `zh`。
- `content_version`：内容版本或刷新标识，例如 `20260524-2136`。
- `cache_ttl_seconds`：前端缓存时间，例如 300。
- `updated_at`：Directus 默认更新时间即可。

不保留复杂字段：

- 不要 `published_version`，改用更直观的 `content_version`。
- 不要 `force_refresh_token`，由 `content_version` 承担刷新作用。
- 不要 `maintenance_notice`。
- 不要发布人、审核人、发布快照等字段。

## Frontend Runtime Loader Design

### 新增 `src/api/siteI18n.js`

职责：

- 读取 `site_i18n_settings` 的全局配置。
- 读取 `site_i18n_entries` 中 `enabled = true` 的文案。
- 将扁平 key 转成前端可用资源。
- 根据 `content_version` 做缓存判断。
- Directus 异常时返回旧缓存或本地 fallback 状态。

建议导出能力：

- `fetchSiteI18nSettings()`：读取全局语言配置。
- `fetchSiteI18nEntries()`：读取启用的文案条目。
- `loadSiteI18nRuntime()`：组合 settings、entries、cache 的统一入口。
- `clearSiteI18nCache()`：必要时清理缓存。

### 改造 `src/utils/language.js`

保留现有 API：

- `getText(key, forceLang)`
- `currentLanguage`
- `switchLanguage(lang)`
- `initializeLanguage()`
- `isChinese()`
- `i18nPlugin`

新增轻量能力：

- `runtimeResources`：运行时从 Directus 加载的文案资源。
- `runtimeSettings`：运行时语言设置。
- `i18nResourceVersion`：响应式版本号，确保异步加载后页面文案能刷新。
- `isEnglishEnabled()`：替代组件直接使用 `FEATURE_EN_ENABLED`。
- `refreshI18nResources()`：手动刷新运行时文案。

### Fallback 顺序

```text
runtime 当前语言
  -> runtime 中文
  -> 本地 JSON 当前语言
  -> 本地 JSON 中文
  -> key
```

生产环境应尽量避免直接显示 key。开发环境可以输出缺 key 摘要，便于排查。

### 缓存策略

- 使用统一缓存前缀，例如 `mintbio:site-i18n:*`。
- `settings` 按短 TTL 缓存，例如 60 到 300 秒。
- `entries bundle` 按 `content_version` 缓存。
- 如果 `content_version` 未变化，优先使用缓存。
- 如果版本变化，重新拉取 entries。
- 如果 Directus 不可用，优先使用旧缓存；旧缓存也没有时使用本地 JSON。

## Simplified Operations Workflow

1. 运营进入 Directus 的 `site_i18n_entries`。
2. 按 `group`、`label` 或 `key_path` 搜索文案。
3. 修改 `value_zh` 或 `value_en`。
4. 保存条目。
5. 进入 `site_i18n_settings`。
6. 修改 `content_version`，例如填当前时间 `20260524-2136`。
7. 前端在缓存过期或检测到版本变化后重新加载。
8. 如果发现内容有问题，直接改回条目，再更新一次 `content_version`。

## Implementation Notes

- 保持 `getText()` 调用方式不变，避免大面积改组件。
- `getText()` 只能读内存资源，不能每次调用发请求。
- `initializeLanguage()` 可异步加载运行时资源，但必须设置超时，不能阻塞首屏。
- 英文未开放时，`?lang=en` 和本地缓存英文都应回落中文。
- 英文开放但 `value_en` 为空时，当前 key 回退中文。
- `site_i18n_entries` 结构应优先支持搜索与编辑，不追求复杂流程。
- 本地 `src/i18n/zh-CN.json` 和 `src/i18n/en-US.json` 保留为紧急 fallback。
- 新闻分类中英文暂不改，避免扩大影响范围。
- 翻译内容仍必须遵守 `doc/zh-en/` 对照规则，不能自行补译。

## Architecture Design

### 简化目标架构

```text
Directus
  ├─ site_i18n_entries：固定文案 key-value 配置
  └─ site_i18n_settings：英文开关、默认语言、内容版本

Frontend
  ├─ src/api/siteI18n.js：读取 Directus 配置并缓存
  ├─ src/utils/language.js：合并运行时资源和本地 fallback
  ├─ src/i18n/zh-CN.json：中文 fallback
  ├─ src/i18n/en-US.json：英文 fallback
  └─ components/pages：继续使用 getText()
```

### 简化数据流

```text
运营修改文案
  -> 更新 content_version
  -> 前端检测版本变化
  -> 拉取 enabled entries
  -> 合并 runtimeResources
  -> getText() 返回新文案
```

## Directory Structure

```text
d:/UGit/mint_bio/
├── .codebuddy/
│   └── plans/
│       └── operator-friendly-i18n-simple-runtime.md
│           # [NEW] 简化版 OpenSpec 计划文件。记录两表模型、前端运行时加载、缓存、回退、边界和验收标准。
│
├── src/
│   ├── main.js
│   │   # [MODIFY] 支持语言资源异步初始化和超时降级，避免 Directus 异常影响首屏。
│   │
│   ├── api/
│   │   └── siteI18n.js
│   │       # [NEW] 读取 site_i18n_settings 和 site_i18n_entries，实现 content_version 缓存和失败降级。
│   │
│   ├── utils/
│   │   └── language.js
│   │       # [MODIFY] 保留现有 API，新增运行时资源合并、后台英文开关、响应式版本和 fallback 顺序。
│   │
│   ├── i18n/
│   │   ├── zh-CN.json
│   │   │   # [MODIFY] 保留为中文 fallback 和初始导入来源。
│   │   └── en-US.json
│   │       # [MODIFY] 保留为英文 fallback；仅允许使用已确认翻译修正。
│   │
│   └── components/
│       ├── Header/index.vue
│       │   # [MODIFY] 英文入口显示改为读取 isEnglishEnabled()。
│       └── MobileHeader/index.vue
│           # [MODIFY] 移动端英文入口与 PC 保持一致。
│
├── scripts/
│   ├── flatten-i18n.mjs
│   │   # [NEW] 将本地嵌套 JSON 转成 site_i18n_entries 可导入数据。
│   └── audit-i18n-simple.mjs
│       # [NEW] 本地输出缺失 key 和硬编码中文摘要，不写入 Directus。
│
├── doc/
│   ├── operations/
│   │   └── directus-i18n-guide.md
│   │       # [NEW] 面向运营的简单配置指南：搜索、编辑、更新 content_version、快速修正。
│   └── ops-dev/
│       └── frontend-pages-and-i18n.md
│           # [MODIFY] 记录简化运行时加载、fallback、缓存和新闻分类暂不处理边界。
│
└── README.md
    # [MODIFY] 更新英文入口说明：从源码开关改为 Directus 后台配置。
```

## Key Code Structures

```js
// Directus site_i18n_entries 简化结构
export interface SiteI18nEntry {
  id: number | string
  key_path: string
  group: string
  label: string
  value_zh: unknown
  value_en?: unknown
  enabled: boolean
  sort?: number
  note?: string
}
```

```js
// Directus site_i18n_settings 简化结构
export interface SiteI18nSettings {
  id: string
  feature_en_enabled: boolean
  default_language: 'zh' | 'en'
  content_version: string
  cache_ttl_seconds?: number
}
```

```js
// src/api/siteI18n.js 返回给 language.js 的结构
export interface SiteI18nRuntimePayload {
  settings: SiteI18nSettings
  resources: {
    zh: Record<string, unknown>
    en: Record<string, unknown>
  }
  meta: {
    content_version: string
    loaded_from: 'network' | 'cache' | 'fallback'
  }
}
```

## Validation / Acceptance

- 运营可以在 Directus 通过 `group`、`label`、`key_path` 搜索并修改文案。
- 修改文案并更新 `content_version` 后，前端无需重新构建即可刷新内容。
- 英文入口可通过 `feature_en_enabled` 后台控制。
- Directus 不可用时，中文站仍使用本地 JSON 正常访问。
- 英文内容为空时，前台回退中文。
- 不创建 `site_i18n_releases`、`site_i18n_audit_reports`。
- 新闻分类中英文切换不纳入本期，文档明确标记。
- 不自行补译 `doc/zh-en/` 未覆盖的英文内容。

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: 复核当前 `language.js`、`Header`、`MobileHeader`、`src/i18n/*.json` 和硬编码中文范围。
- Expected outcome: 明确简化方案实际影响文件，避免遗漏当前真正生效的语言链路。

### Skill

- **directus-bt-migration-coach**
- Purpose: 校验简化后的 Directus 两表模型是否适合当前自托管 Directus 和宝塔部署环境。
- Expected outcome: 确认集合字段、权限、缓存刷新方式足够简单且可稳定落地。

- **i18n-translator**
- Purpose: 在已有 `doc/zh-en/` 或用户确认翻译基础上，辅助保持中英文 fallback JSON 结构一致。
- Expected outcome: 不自行补译，仅输出可导入字段和缺失英文清单。