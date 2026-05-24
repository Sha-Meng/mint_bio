---
name: operator-friendly-i18n-rework
overview: 按最新确认更新简化方案：去掉 cache_ttl_seconds 字段，前端每次页面启动轻量检查 settings.content_version，entries 按 content_version 缓存；强制刷新在版本变化后可更新。
todos:
  - id: audit-simple-scope
    content: 使用 [subagent:code-explorer] 复核语言链路和影响文件
    status: pending
  - id: write-simple-spec
    content: 创建简化版 OpenSpec 计划文件
    status: pending
    dependencies:
      - audit-simple-scope
  - id: confirm-two-tables
    content: 使用 [skill:directus-bt-migration-coach] 确认两表字段和权限
    status: pending
    dependencies:
      - write-simple-spec
  - id: design-startup-version-cache
    content: 设计启动检查 content_version 与 entries 缓存机制
    status: pending
    dependencies:
      - confirm-two-tables
  - id: plan-import-and-fallback
    content: 使用 [skill:i18n-translator] 规划 JSON 导入和英文缺失清单
    status: pending
    dependencies:
      - confirm-two-tables
  - id: update-doc-boundaries
    content: 更新文档并标记新闻分类暂不处理
    status: pending
    dependencies:
      - design-startup-version-cache
      - plan-import-and-fallback
---

## User Requirements

用户确认采用简化版长期方案：把官网固定文案和英文入口从源码 JSON/常量配置，改造成 Directus 后台可搜索、可编辑、可配置的轻量运营方案。方案需要简单、高效、稳定，方便运营快速修改和修正，不引入复杂发布、审核、审计、快照回滚体系。

## Product Overview

建设轻量的官网中英文固定文案配置能力。运营在 Directus 中通过表格化字段维护文案，通过全局配置控制英文入口和内容版本；前台每次启动检查版本，版本变化时刷新文案缓存，异常时自动回退本地 JSON，保证页面稳定访问。

## Core Features

- 固定文案支持按分组、中文说明、key 搜索和编辑。
- 中文/英文文案在后台配置，英文缺失时前台回退中文。
- 英文入口由后台开关控制，不再依赖源码常量。
- 文案更新后通过 `content_version` 触发前端刷新，无需重新构建。
- 强制刷新页面时会重新检查配置；只要 `content_version` 已更新且 Directus 可访问，即可加载新内容。
- 不建设 `site_i18n_releases`、`site_i18n_audit_reports`、复杂审核字段、关键字段和审计体系。
- 新闻分类中英文切换暂不处理，仅在文档中明确边界。

## Tech Stack Selection

- **前端沿用现状**：Vue 3 + `@vue/compat`、Vue Router 4、Vue CLI、Axios。
- **语言机制沿用现状**：保留 `src/utils/language.js` 中的 `getText()`、`currentLanguage`、`switchLanguage()`、`initializeLanguage()`、`i18nPlugin`。
- **内容后台沿用现状**：继续使用当前 Directus，复用 `src/api/news.js` 已有的 Directus REST、异常降级和缓存思路。
- **不引入重型 i18n 框架**：当前核心目标是运营后台配置和无需重构建，`vue-i18n` 不能直接解决该问题，暂不引入。

## Implementation Approach

采用“两张 Directus 表 + 前端运行时加载器 + 本地 JSON 兜底”的简化方案。

### Directus 集合

#### `site_i18n_entries`

用于保存固定文案，面向运营搜索和编辑。

字段保留：

- `id`：Directus 主键。
- `key_path`：唯一文案 key，例如 `nav.news`、`footer.email`、`home.hero.title`。
- `group`：分组，例如 `nav`、`footer`、`home`、`news`、`product`、`common`。
- `label`：运营可读中文说明，例如“导航-新闻动态”。
- `value_zh`：中文内容。
- `value_en`：英文内容；为空时前台回退中文。
- `enabled`：是否启用，默认 `true`。
- `sort`：后台排序。
- `note`：可选备注，例如使用位置或字数提示。

不加入：

- `translation_status`
- `content_status`
- `release_version`
- `fallback_policy`
- `is_required`
- `reviewed_by` / `reviewed_at`
- 复杂审计字段

#### `site_i18n_settings`

用于保存全局语言配置，只维护一条记录。

字段保留：

- `id`：固定记录，例如 `site-default`。
- `feature_en_enabled`：是否显示英文入口。
- `default_language`：默认语言，建议 `zh`。
- `content_version`：内容刷新标识，例如 `20260524-2147`。
- `updated_at`：Directus 系统更新时间，如可用则保留。

不加入：

- `cache_ttl_seconds`
- `published_version`
- `force_refresh_token`
- `maintenance_notice`
- 发布人、审核人、发布快照等字段

### 关于 `site_i18n_releases`

原本 `site_i18n_releases` 是发布快照表，通常由脚本、Directus Flow 或后台发布动作生成。
当前方案不需要该表。运营如果发现内容错误，直接改回 `site_i18n_entries` 中的文案，再更新一次 `site_i18n_settings.content_version` 即可快速修正。

## Runtime Cache Strategy

前端不再通过后台字段配置缓存时间，也不使用 `cache_ttl_seconds`。

推荐固定策略：

1. 每次应用启动或页面强制刷新时，请求轻量的 `site_i18n_settings`。
2. 读取远端 `content_version`。
3. 如果远端版本与本地缓存版本一致，直接使用本地缓存的 entries bundle。
4. 如果远端版本变化，重新拉取 `site_i18n_entries` 中 `enabled = true` 的文案。
5. 拉取成功后替换本地缓存，并合并到运行时资源。
6. 如果 settings 请求失败，优先使用旧缓存；旧缓存不存在时使用本地 JSON。
7. 如果 entries 请求失败，保留旧缓存；旧缓存不存在时使用本地 JSON。

因此：

- 不是实时刷新。
- 强制刷新会重新检查 `content_version`。
- 只要运营已更新 `content_version` 且 Directus 可访问，强制刷新后会更新文案。
- 如果只改文案但未改 `content_version`，前端可能继续使用旧缓存。

## Implementation Notes

- `getText()` 只能读取内存资源，不能每次调用请求网络。
- `initializeLanguage()` 可异步加载运行时资源，但必须设置超时或安全降级，避免阻塞首屏。
- 英文入口显示由 `site_i18n_settings.feature_en_enabled` 控制。
- 英文未开放时，`?lang=en` 和本地 `language=en` 都应回落中文。
- 英文开放但 `value_en` 为空时，对应 key 回退中文。
- 本地 `src/i18n/zh-CN.json` 和 `src/i18n/en-US.json` 保留为紧急 fallback 和初始导入来源。
- 不自行补译英文内容；`doc/zh-en/` 未覆盖的内容保持中文或留空，等待用户确认。
- 新闻分类中英文切换不纳入本期，避免扩大影响范围。

## Architecture Design

```text
Directus
  ├─ site_i18n_entries
  │   └─ 固定文案 key-value 配置
  └─ site_i18n_settings
      └─ 英文开关、默认语言、content_version

Frontend
  ├─ src/api/siteI18n.js
  │   └─ 读取 settings、entries，管理缓存与降级
  ├─ src/utils/language.js
  │   └─ 合并运行时资源和本地 fallback
  ├─ src/i18n/zh-CN.json
  │   └─ 中文 fallback
  ├─ src/i18n/en-US.json
  │   └─ 英文 fallback
  └─ components/pages
      └─ 继续使用 getText()
```

### Data Flow

```text
运营修改 site_i18n_entries
  -> 更新 site_i18n_settings.content_version
  -> 用户打开或强制刷新页面
  -> 前端请求 settings
  -> content_version 变化则拉取 entries
  -> 合并 runtimeResources
  -> getText() 返回新文案
```

## Directory Structure

```text
d:/UGit/mint_bio/
├── .codebuddy/
│   └── plans/
│       └── operator-friendly-i18n-simple-runtime.md
│           # [NEW] 简化版 OpenSpec 计划。记录两表模型、启动检查版本、缓存、fallback、运营流程和边界。
│
├── src/
│   ├── main.js
│   │   # [MODIFY] 支持语言资源异步初始化和超时降级。
│   │
│   ├── api/
│   │   └── siteI18n.js
│   │       # [NEW] 读取 site_i18n_settings 与 site_i18n_entries；按 content_version 管理缓存和失败降级。
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
│       │   # [MODIFY] 英文入口显示改为读取运行时英文开关。
│       └── MobileHeader/index.vue
│           # [MODIFY] 移动端英文入口与 PC 保持一致。
│
├── scripts/
│   ├── flatten-i18n.mjs
│   │   # [NEW] 将本地嵌套 JSON 转成 site_i18n_entries 可导入数据。
│   └── audit-i18n-simple.mjs
│       # [NEW] 本地输出缺失 key、英文缺失和硬编码中文摘要，不写入 Directus。
│
├── doc/
│   ├── operations/
│   │   └── directus-i18n-guide.md
│   │       # [NEW] 运营指南：搜索、编辑、更新 content_version、强刷生效、快速修正。
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
}
```

```js
// src/api/siteI18n.js 返回给 language.js 的运行时结构
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

- 运营可以在 Directus 通过 `group`、`label`、`key_path` 搜索并修改固定文案。
- 修改文案并更新 `content_version` 后，用户强制刷新页面可加载新内容。
- 只修改文案但不更新 `content_version` 时，前端允许继续使用旧缓存。
- 英文入口可通过 `feature_en_enabled` 控制，无需修改代码。
- Directus 不可用时，中文站仍使用旧缓存或本地 JSON 正常访问。
- 英文内容为空时，前台回退中文。
- 不创建 `site_i18n_releases` 和 `site_i18n_audit_reports`。
- 不加入 `cache_ttl_seconds`。
- 新闻分类中英文切换不纳入本期，文档明确标记。
- 不自行补译 `doc/zh-en/` 未覆盖的英文内容。

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: 复核当前 `language.js`、`Header`、`MobileHeader`、`src/i18n/*.json` 和硬编码中文影响范围。
- Expected outcome: 明确简化方案实际改动文件和风险点，避免遗漏当前真正生效的语言链路。

### Skill

- **directus-bt-migration-coach**
- Purpose: 校验简化后的 Directus 两表模型是否适合当前自托管 Directus 和宝塔部署环境。
- Expected outcome: 确认集合字段、权限和前端读取方式足够简单且可稳定落地。

- **i18n-translator**
- Purpose: 基于已确认翻译来源维护 fallback JSON 结构和缺失英文清单。
- Expected outcome: 不自行补译，仅辅助保持中英文资源结构一致，并标记待确认内容。