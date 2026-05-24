---
name: operator-friendly-i18n-rework
overview: 补充改造完成后的用户侧全量操作与迁移指引要求：需提供 Directus 建表、初始化导入、配置版本、验证、上线和日常维护的完整 checklist。
todos:
  - id: audit-migration-scope
    content: 使用 [subagent:code-explorer] 复核语言链路、导入来源和文档范围
    status: completed
  - id: write-simple-spec
    content: 创建简化版 OpenSpec，补充用户迁移指引
    status: completed
    dependencies:
      - audit-migration-scope
  - id: confirm-directus-setup
    content: 使用 [skill:directus-bt-migration-coach] 确认两表字段、权限和上线步骤
    status: completed
    dependencies:
      - write-simple-spec
  - id: design-runtime-cache
    content: 设计启动检查 content_version 与 entries 缓存机制
    status: completed
    dependencies:
      - confirm-directus-setup
  - id: plan-import-guide
    content: 使用 [skill:i18n-translator] 规划 JSON 导入和英文缺失清单
    status: completed
    dependencies:
      - confirm-directus-setup
  - id: write-operations-docs
    content: 编写 Directus 建表、导入、启用、验证和日常操作文档
    status: completed
    dependencies:
      - design-runtime-cache
      - plan-import-guide
  - id: define-acceptance
    content: 补充验收清单，明确新闻分类暂不处理
    status: completed
    dependencies:
      - write-operations-docs
---

## User Requirements

用户确认采用简化版长期方案，并补充要求：改造完成后不能只交付代码，还需要明确说明用户/运营侧是否需要做额外操作，并提供完整迁移指引，确保用户可以按步骤完成 Directus 配置、初始数据导入、版本启用、验证和日常维护。

## Product Overview

建设轻量的官网中英文固定文案运营配置能力。前端完成运行时文案加载后，用户需要一次性完成 Directus 侧两张表配置和初始导入；后续日常运营只需要搜索文案、修改内容、更新 `content_version`，即可让新内容在页面刷新后生效。

## Core Features

- 仅使用 `site_i18n_entries` 和 `site_i18n_settings` 两个 Directus 集合。
- 固定文案支持后台搜索、编辑和启停。
- 英文入口由后台 `feature_en_enabled` 控制。
- 文案更新通过 `content_version` 触发前端刷新。
- 不使用 `site_i18n_releases`、`site_i18n_audit_reports`、复杂审核、复杂审计和 `cache_ttl_seconds`。
- 改造交付后提供完整迁移清单，覆盖 Directus 建表、字段配置、权限、导入、启用、验证、上线和日常操作。
- 新闻分类中英文切换暂不处理，仅在文档中明确边界。
- 翻译内容不得自行补译，未确认英文保持空值或回退中文。

## Tech Stack Selection

- **前端沿用现状**：Vue 3 + `@vue/compat`、Vue Router 4、Vue CLI、Axios。
- **语言机制沿用现状**：继续保留 `src/utils/language.js` 暴露的 `getText()`、`currentLanguage`、`switchLanguage()`、`initializeLanguage()`、`i18nPlugin`。
- **内容后台沿用现状**：继续使用现有 Directus，复用 `src/api/news.js` 中已验证的 Directus REST、异常降级和缓存思路。
- **不引入重型 i18n 框架**：当前目标是运营后台配置和无需重构建，不是重写开发侧 i18n 框架。
- **文档与迁移交付**：需要新增/更新运营文档，确保用户可完成全量 Directus 操作和初始迁移。

## Implementation Approach

### 总体策略

采用“两张 Directus 表 + 前端运行时加载器 + 本地 JSON 兜底 + 完整迁移指引”的简化方案。

代码改造完成后，用户确实需要做一次性 Directus 侧配置和初始数据导入，包括创建集合、配置字段、导入初始文案、创建 settings 记录、设置权限和验证效果。完成这次迁移后，日常操作会很简单：运营搜索文案、编辑 `value_zh` 或已确认的 `value_en`、保存、更新 `content_version`，页面刷新后即可加载新内容。

### Directus 集合设计

#### `site_i18n_entries`

用于保存官网固定文案，重点是方便搜索和编辑。

保留字段：

- `id`：Directus 主键。
- `key_path`：唯一文案 key，例如 `nav.news`、`footer.email`、`home.hero.title`。
- `group`：分组，例如 `nav`、`footer`、`home`、`news`、`product`、`common`。
- `label`：运营可读中文说明，例如“导航-新闻动态”。
- `value_zh`：中文内容。
- `value_en`：英文内容；为空时前台回退中文。
- `enabled`：是否启用，默认 `true`。
- `sort`：后台列表排序。
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

保留字段：

- `id`：固定记录，例如 `site-default`。
- `feature_en_enabled`：是否显示英文入口。
- `default_language`：默认语言，建议 `zh`。
- `content_version`：内容刷新标识，例如 `20260524-2152`。
- `updated_at`：Directus 系统更新时间，如可用则保留。

不加入：

- `cache_ttl_seconds`
- `published_version`
- `force_refresh_token`
- `maintenance_notice`
- 发布人、审核人、发布快照等字段

### 前端运行时加载策略

新增 `src/api/siteI18n.js`：

- 每次应用启动请求轻量的 `site_i18n_settings`。
- 读取远端 `content_version`。
- 如果远端版本与本地缓存版本一致，直接使用本地缓存的 entries bundle。
- 如果远端版本变化，重新拉取 `site_i18n_entries` 中 `enabled = true` 的文案。
- 拉取成功后替换本地缓存，并合并到运行时资源。
- 如果 settings 请求失败，优先使用旧缓存；旧缓存不存在时使用本地 JSON。
- 如果 entries 请求失败，保留旧缓存；旧缓存不存在时使用本地 JSON。

改造 `src/utils/language.js`：

- 保留现有 API，避免大面积改组件。
- 增加运行时资源池和后台 settings。
- 增加响应式资源版本，确保异步加载后页面文案可刷新。
- 英文入口显示由 `feature_en_enabled` 控制。
- 英文未开放时，`?lang=en` 和本地 `language=en` 都回落中文。
- 英文开放但 `value_en` 为空时，对应 key 回退中文。

### Fallback 顺序

```text
runtime 当前语言
  -> runtime 中文
  -> 本地 JSON 当前语言
  -> 本地 JSON 中文
  -> key
```

生产环境应尽量避免显示裸 key；开发环境可以输出缺失摘要便于排查。

## Implementation Notes

- `getText()` 只能读内存资源，不能每次调用请求网络。
- `initializeLanguage()` 可异步加载运行时资源，但必须超时降级，避免阻塞首屏。
- 前端不使用 `cache_ttl_seconds`；强制刷新时会重新检查 `content_version`。
- 只改文案但不更新 `content_version` 时，前端允许继续使用旧缓存。
- 本地 `src/i18n/zh-CN.json` 和 `src/i18n/en-US.json` 保留为紧急 fallback 和初始导入来源。
- 翻译内容必须遵守 `doc/zh-en/` 对照规则；未覆盖英文不得自行补译。
- 新闻分类中英文切换不纳入本期，避免扩大影响范围。
- 文档必须提供截图无关的文字步骤，确保用户可独立完成迁移。

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
  │   └─ 中文 fallback 与初始导入来源
  ├─ src/i18n/en-US.json
  │   └─ 英文 fallback 与已确认英文来源
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

## Post-Implementation User Actions / Migration Guide

改造完成后，用户需要完成一次性迁移操作。交付文档应逐项指引：

### 1. Directus 集合创建

- 创建 `site_i18n_entries`。
- 创建 `site_i18n_settings`。
- 配置字段类型、显示名称、默认值和列表视图。
- 在 `site_i18n_entries` 列表中优先显示：
- `group`
- `label`
- `key_path`
- `value_zh`
- `value_en`
- `enabled`
- `sort`
- 配置搜索字段：
- `group`
- `label`
- `key_path`
- `value_zh`
- `value_en`
- 配置默认排序：
- 先按 `group`
- 再按 `sort`
- 再按 `key_path`

### 2. Directus 权限配置

- 前端公开读取 `site_i18n_settings`。
- 前端公开读取 `site_i18n_entries` 中 `enabled = true` 的记录。
- 不开放公开写入权限。
- 后台编辑权限仅给运营或管理员角色。
- 如 Directus 权限支持字段限制，前端只需读取必要字段。

### 3. 初始数据迁移

- 使用脚本从 `src/i18n/zh-CN.json` 和 `src/i18n/en-US.json` 生成扁平化导入数据。
- 每条数据对应一个 `key_path`。
- `value_zh` 来自中文 JSON。
- `value_en` 只来自现有英文 JSON 或 `doc/zh-en/` 已确认翻译。
- 不自行补译缺失英文。
- 英文缺失字段保持空值，前端回退中文。
- 导入时默认 `enabled = true`。
- 尽量根据 key 自动填充 `group`、`sort`，`label` 可先用中文值或人工补充。
- 导入后抽查导航、页脚、首页、新闻相关固定文案。

### 4. 版本启用

在 `site_i18n_settings` 创建一条记录：

- `id = site-default`
- `feature_en_enabled = false`
- `default_language = zh`
- `content_version = 当前时间戳`，例如 `20260524-2152`

初期建议保持 `feature_en_enabled = false`，先验证中文固定文案运行时加载稳定，再决定是否开放英文入口。

### 5. 上线验证

- Directus 可访问。
- 前端启动时可以读取 settings。
- `content_version` 变化后可以重新拉取 entries。
- 强制刷新页面可以加载新版本文案。
- Directus 不可用时页面仍使用旧缓存或本地 JSON。
- `feature_en_enabled = false` 时 PC 和移动端英文入口隐藏。
- `feature_en_enabled = true` 时 PC 和移动端英文入口显示。
- `value_en` 为空时英文模式回退中文。
- Header 和 MobileHeader 行为一致。
- 新闻分类中英文不受本期改造影响，并在文档中标记。

### 6. 正式上线步骤

- 部署包含运行时加载器的前端代码一次。
- 在 Directus 创建两张集合并设置权限。
- 导入初始 `site_i18n_entries`。
- 创建并配置 `site_i18n_settings`。
- 在测试或预览环境完成验证。
- 生产环境先保持 `feature_en_enabled = false`。
- 确认固定文案可接受后，再由用户确认是否打开英文入口。

### 7. 日常运营流程

- 在 Directus 打开 `site_i18n_entries`。
- 通过 `group`、`label`、`key_path` 搜索目标文案。
- 修改 `value_zh` 或已确认的 `value_en`。
- 保存。
- 打开 `site_i18n_settings`。
- 更新 `content_version`，建议填当前时间。
- 通知用户刷新页面或等待下一次打开页面。
- 如果内容错误，直接改回文案并再次更新 `content_version`。

## Directory Structure

```text
d:/UGit/mint_bio/
├── .codebuddy/
│   └── plans/
│       └── operator-friendly-i18n-simple-runtime.md
│           # [NEW] 简化版 OpenSpec 计划。记录两表模型、启动版本检查、缓存、fallback、运营迁移和边界。
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
│   │   # [NEW] 将本地嵌套 JSON 转成 site_i18n_entries 可导入数据，并输出导入文件。
│   └── audit-i18n-simple.mjs
│       # [NEW] 本地输出缺失 key、英文缺失和硬编码中文摘要，不写入 Directus。
│
├── doc/
│   ├── operations/
│   │   ├── directus-i18n-guide.md
│   │   │   # [NEW] 运营迁移与日常操作指南：建表、权限、导入、版本启用、验证、快速修正。
│   │   └── english-content-update.md
│   │       # [MODIFY] 区分固定文案后台维护与新闻内容维护。
│   └── ops-dev/
│       └── frontend-pages-and-i18n.md
│           # [MODIFY] 记录简化运行时加载、fallback、缓存和新闻分类暂不处理边界。
│
└── README.md
    # [MODIFY] 更新英文入口说明：从源码开关改为 Directus 后台配置。
```

## Key Code Structures

```js
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
export interface SiteI18nSettings {
  id: string
  feature_en_enabled: boolean
  default_language: 'zh' | 'en'
  content_version: string
}
```

```js
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

- 用户获得明确答案：改造完成后需要做一次 Directus 配置和初始导入。
- 文档能指引用户完成全量迁移，不依赖口头记忆。
- 运营可以通过 `group`、`label`、`key_path` 搜索和修改固定文案。
- 修改文案并更新 `content_version` 后，用户强制刷新页面可加载新内容。
- 只修改文案但不更新 `content_version` 时，前端允许继续使用旧缓存。
- 英文入口可通过 `feature_en_enabled` 控制，无需修改代码。
- Directus 不可用时，中文站仍使用旧缓存或本地 JSON 正常访问。
- 英文内容为空时，前台回退中文。
- 不创建 `site_i18n_releases`、`site_i18n_audit_reports`。
- 不加入 `cache_ttl_seconds`。
- 新闻分类中英文切换不纳入本期，文档明确标记。
- 不自行补译 `doc/zh-en/` 未覆盖的英文内容。

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: 复核当前 `language.js`、`Header`、`MobileHeader`、`src/i18n/*.json`、文档和脚本影响范围。
- Expected outcome: 明确实际改动文件、迁移输入来源和风险点，避免遗漏当前真正生效的语言链路。

### Skill

- **directus-bt-migration-coach**
- Purpose: 校验简化后的 Directus 两表模型、权限和迁移步骤是否适合当前自托管 Directus 与宝塔部署环境。
- Expected outcome: 确认集合字段、权限、前端读取方式和上线迁移流程稳定可落地。

- **i18n-translator**
- Purpose: 基于已确认翻译来源维护 fallback JSON 结构、导入数据和英文缺失清单。
- Expected outcome: 不自行补译，仅辅助生成可导入字段、标记待确认英文并保持中英文资源结构一致。