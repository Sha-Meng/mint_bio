---
name: operator-friendly-i18n-rework
overview: 将方案重点调整为长期运营化架构：以 Directus 作为统一内容与语言配置后台，设计固定文案、语言开关、发布版本、审计校验、前端运行时加载与回退机制。
todos:
  - id: audit-i18n-baseline
    content: 使用 [subagent:code-explorer] 审计 key、硬编码、PC/Mobile 和新闻刷新链路
    status: pending
  - id: write-long-term-spec
    content: 创建长期 OpenSpec，固化模型、流程、回滚和验收标准
    status: pending
    dependencies:
      - audit-i18n-baseline
  - id: design-directus-schema
    content: 使用 [skill:directus-bt-migration-coach] 设计 Directus 集合、权限和发布模型
    status: pending
    dependencies:
      - write-long-term-spec
  - id: design-runtime-loader
    content: 设计 siteI18n API、缓存、版本检测、fallback 和响应式资源层
    status: pending
    dependencies:
      - design-directus-schema
  - id: plan-content-migration
    content: 使用 [skill:document-docx] 规划合规翻译导入和待确认清单
    status: pending
    dependencies:
      - design-directus-schema
  - id: plan-frontend-migration
    content: 规划 language.js、Header、新闻分类和语言刷新分阶段改造
    status: pending
    dependencies:
      - design-runtime-loader
  - id: define-validation-docs
    content: 使用 [skill:i18n-translator] 定义审计脚本、运营文档和验收用例
    status: pending
    dependencies:
      - plan-content-migration
      - plan-frontend-migration
---

## User Requirements

用户希望在已有中英文切换现状评估基础上，继续深入设计“长期方案”，重点不是简单优化 JSON，而是把官网中英文固定文案、语言开关、新闻分类等运营配置逐步后台化、运行时化、可发布化，减少对开发改代码和重新构建的依赖。

## Product Overview

建设一套面向运营人员的官网多语言内容维护体系：运营可通过后台按页面、模块、字段维护中英文内容，控制英文入口开关和发布版本；前台自动读取已发布内容并安全回退，保持现有页面视觉和访问稳定性。

## Core Features

- 固定文案、导航、页脚、按钮、页面标语、产品模块等内容支持后台表单化维护。
- 英文入口、默认语言、发布版本支持后台配置，无需改源码开启。
- 支持草稿、审核、发布、回滚和翻译状态管理。
- 前台启动时读取已发布语言资源，正常文案更新无需重新构建。
- 本地内容保留兜底能力，后台异常时页面不空白、不暴露异常 key。
- 新闻内容、新闻分类与固定文案的语言行为保持一致。
- 建立翻译合规、缺失项审计、运营文档和验收流程。

## Tech Stack Selection

- **前端现状复用**：继续基于 Vue 3 + `@vue/compat`、Vue Router 4、Vue CLI、Axios、Element Plus。
- **语言层现状复用**：保留 `src/utils/language.js` 暴露的 `getText()`、`currentLanguage`、`switchLanguage()`、`i18nPlugin`，避免全站组件大规模重写。
- **内容后台复用**：继续以现有 Directus 为运营后台。当前 `src/api/news.js` 已验证 Directus REST、字段映射、中英文 fallback、sessionStorage TTL 缓存等模式，可作为长期语言资源接口设计参考。
- **不优先引入 `vue-i18n`**：标准 i18n 库能改善开发侧资源管理，但不能直接解决“运营后台维护、无需重构建发布”的核心诉求，且会扩大组件迁移范围。
- **推荐长期方向**：Directus 统一承载官网固定文案、语言设置、发布版本、新闻分类和审计元数据；前端通过运行时语言资源层读取已发布 bundle，本地 JSON 作为紧急 fallback 和开发基线。

## Implementation Approach

### 总体策略

长期方案采用“Directus 内容模型 + 前端运行时资源加载器 + 本地兜底 JSON + 审计发布流程”的架构。

高层逻辑是：运营在 Directus 中以页面/模块/字段形式维护内容，发布后生成或查询当前发布版本；前端启动时拉取当前版本的语言资源和语言设置，合并到内存资源池中；组件仍通过 `getText(key)` 读取内容。这样既降低运营理解成本，又控制前端改造面和线上风险。

### 关键技术决策

1. **保持 `getText()` API 不变**

- 现有组件大量直接调用 `getText()`，全量替换为新 i18n 框架成本高。
- 保留 API 可将改造集中在 `src/utils/language.js` 和新增 `src/api/siteI18n.js`。

2. **运行时资源优先，本地 JSON 兜底**

- Directus 成功返回时优先展示运营发布内容。
- Directus 超时、异常、字段缺失时回退 `src/i18n/zh-CN.json` / `src/i18n/en-US.json`。
- 生产环境不应出现空白文案或裸露 key。

3. **Directus 存储使用扁平 key，前端支持嵌套路径**

- 运营后台存 `nav.news`、`footer.contact.email`、`products.list.0.title` 等扁平路径，便于表格筛选和批量导入。
- 前端读取时既可直接扁平查找，也可还原嵌套对象，保证兼容当前 `getText('products.list')` 返回数组的用法。

4. **以发布版本控制缓存刷新**

- 新增语言设置或发布集合保存 `published_version`、`updated_at`。
- 前端先读取 settings/version，再决定是否复用缓存或拉取新 bundle。
- 普通内容更新无需重新构建，发布后等待缓存过期或版本变化即可生效。

5. **翻译合规优先于自动补齐**

- 英文内容只能来自 `doc/zh-en/` 对照文件或用户确认稿。
- 未确认英文不自动翻译，状态标记为 `missing` / `pending_review`，前台英文模式回退中文。

## Long-term Architecture Design

### 目标架构

```text
Directus 运营后台
  ├─ site_i18n_entries：固定文案字段库
  ├─ site_i18n_releases：发布版本与回滚记录
  ├─ site_i18n_settings：语言开关、默认语言、当前发布版本
  ├─ news_categories：新闻分类中英文名称与排序
  └─ news_articles：新闻标题、摘要、正文中英文内容

前端
  ├─ src/api/siteI18n.js：读取 settings、bundle、版本与缓存
  ├─ src/utils/language.js：合并运行时资源与本地 fallback
  ├─ src/i18n/*.json：保留紧急 fallback 与开发基线
  └─ Vue 页面组件：继续调用 getText() / currentLanguage
```

### 数据流

```text
运营编辑草稿
  -> 翻译状态检查
  -> 审核通过
  -> 发布新版本
  -> Directus 更新 published_version
  -> 前端检测版本变化
  -> 拉取已发布 bundle
  -> 合并到运行时资源
  -> 页面响应式刷新
```

### 前台 fallback 顺序

```text
runtime 当前语言
  -> runtime 中文
  -> bundled 当前语言
  -> bundled 中文
  -> key
```

对于数组或对象类字段，例如 `products.list`：

- 若完整数组在运行时资源存在，则优先使用运行时数组。
- 若只迁移了数组局部 key，如 `products.list.0.title`，前端合并时应能覆盖本地对象对应路径。
- 若结构异常，保留本地 JSON，避免页面组件收到错误类型。

## Directus Data Model

### 1. `site_i18n_entries`：固定文案字段库

用于保存全站固定文案、导航、Footer、按钮、页面模块、产品模块、表单标签等。

建议字段：

- `id`：主键。
- `key_path`：唯一 key，例如 `nav.news`、`home.hero.title`、`products.list.0.title`。
- `label_zh`：运营可读中文字段名，例如“导航-新闻动态”。
- `description_zh`：字段用途说明，例如“首页顶部主标题，不建议超过 18 个中文字”。
- `page`：页面分组，例如 `home`、`news`、`vision`、`footer`、`common`。
- `section`：模块分组，例如 `hero`、`navigation`、`product_list`、`contact`。
- `field_group`：更细的业务分组，方便后台视图筛选。
- `value_type`：字段类型，建议枚举 `text`、`textarea`、`richtext`、`url`、`image`、`number`、`boolean`、`json`、`list_item`。
- `value_zh`：中文内容。
- `value_en`：英文内容。
- `translation_status`：翻译状态，建议枚举 `missing`、`pending_review`、`approved`、`published`。
- `content_status`：内容状态，建议枚举 `draft`、`published`、`archived`。
- `release_version`：所属发布版本。
- `fallback_policy`：建议枚举 `fallback_zh`、`hide_optional`、`show_key_dev_only`。
- `sort`：排序。
- `is_required`：是否关键字段，关键字段缺失应在发布前阻断。
- `max_length`：运营输入长度提示。
- `updated_by`、`updated_at`：审计信息。
- `reviewed_by`、`reviewed_at`：审核信息。

运营视图建议：

- 按 `page + section` 分组展示。
- 默认隐藏 `key_path` 的复杂性，但保留给开发排查。
- 对必填字段、英文缺失字段、待审核字段建立筛选视图。

### 2. `site_i18n_releases`：语言资源发布版本

用于记录每次发布的资源快照、发布人、回滚目标和变更说明。

建议字段：

- `id`：主键。
- `version`：发布版本号，例如 `i18n-20260524-001`。
- `status`：`draft`、`published`、`rolled_back`。
- `title`：发布标题。
- `change_summary`：本次变更说明。
- `entry_count`：发布字段数量。
- `missing_en_count`：英文缺失数量。
- `pending_review_count`：待审核数量。
- `published_at`、`published_by`：发布审计。
- `rollback_from`：如为回滚版本，记录来源版本。
- `snapshot_json`：可选，保存发布时 bundle 快照，便于快速回滚和排查。
- `checksum`：资源摘要，便于前端缓存一致性校验。

### 3. `site_i18n_settings`：语言与运行时配置

用于控制英文入口和默认语言，不再依赖 `FEATURE_EN_ENABLED` 源码常量。

建议字段：

- `id`：建议只维护一条全局记录，例如 `site-default`。
- `feature_en_enabled`：是否开放英文入口。
- `default_language`：默认语言，建议 `zh`。
- `supported_languages`：支持语言列表，当前为 `zh,en`。
- `published_version`：当前生效发布版本。
- `cache_ttl_seconds`：前端缓存 TTL。
- `force_refresh_token`：运营紧急刷新标识。
- `maintenance_notice`：可选，后台维护时提示。
- `updated_at`、`updated_by`：审计信息。

### 4. `news_categories`：新闻分类运营化增强

当前 `src/api/news.js` 已读取 `news_categories` 的 `slug,name_zh,name_en,sort,status`，但前端列表筛选仍存在硬编码分类。

长期建议字段：

- `slug`：稳定标识。
- `name_zh` / `name_en`：分类中英文名称。
- `display_label_zh` / `display_label_en`：前台展示标签，可含 `#`。
- `frontend_value`：兼容现有 `runtime`、`production`、`manufacture`、`vision` 等筛选值。
- `color`：分类颜色，替代前端 `CATEGORY_MAP` 中硬编码颜色。
- `sort`：排序。
- `status`：`draft` / `published`。
- `translation_status`：翻译状态。

### 5. `site_i18n_audit_reports`：审计报告记录，可选

如果希望长期沉淀检查结果，可新增该集合保存每次审计。

建议字段：

- `report_type`：`missing_translation`、`hardcoded_text`、`unused_key`、`type_mismatch`。
- `severity`：`info`、`warning`、`error`。
- `key_path`：相关 key。
- `file_path`：相关前端文件路径。
- `message`：问题描述。
- `status`：`open`、`ignored`、`fixed`。
- `created_at`、`resolved_at`。

## Frontend Runtime Loader Design

### 新增 API 模块

`src/api/siteI18n.js`

职责：

- 读取 `site_i18n_settings`。
- 按 `published_version` 读取 `site_i18n_entries` 或发布快照。
- 标准化 Directus 数据为前端 bundle。
- 实现 sessionStorage/localStorage 缓存。
- 实现请求超时和失败降级。
- 暴露清晰 API 给 `src/utils/language.js` 使用。

建议接口语义：

- `fetchSiteI18nSettings()`
- `fetchSiteI18nBundle(version)`
- `loadSiteI18nRuntime()`
- `clearSiteI18nCache()`

### 改造语言核心

`src/utils/language.js`

保留：

- `currentLanguage`
- `initializeLanguage()`
- `getText(key, forceLang)`
- `switchLanguage(lang)`
- `isChinese()`
- `i18nPlugin`

新增：

- `runtimeResources`：运行时资源。
- `runtimeSettings`：运行时语言设置。
- `i18nResourceVersion`：响应式版本号，用于触发 computed 重算。
- `isI18nRuntimeReady`：运行时资源加载状态。
- `isEnglishEnabled()`：替代组件直接依赖 `FEATURE_EN_ENABLED`。
- `refreshI18nResources()`：版本变化或手动刷新时调用。

需要注意：

- `getText()` 必须读取 `i18nResourceVersion.value`，确保异步加载后依赖 `getText()` 的 computed 可以响应式更新。
- `normalizeLanguage()` 不再直接依赖源码常量，而是依赖运行时 settings；settings 未加载时默认中文。
- `initializeLanguage()` 可改为异步，但 `main.js` 需要设置超时，避免首屏被 Directus 卡住。

### 改造启动流程

`src/main.js`

当前是同步调用：

```text
initializeLanguage()
createApp(App)
```

长期建议：

- 启动时调用异步 `initializeLanguage({ timeoutMs })`。
- 超时或异常时继续挂载应用。
- 加载成功后触发资源版本更新，页面自动刷新文案。
- 不在生产环境打印完整资源 payload。

### 缓存策略

建议：

- settings 缓存短 TTL，例如 30 秒到 5 分钟。
- bundle 缓存可按 `published_version` 长缓存。
- 若 settings 的 `published_version` 未变化，直接使用本地 bundle 缓存。
- 若 `force_refresh_token` 变化，强制清理旧缓存。
- 缓存 key 建议使用统一前缀，例如 `mintbio:site-i18n:*`，避免与 `mintbio:directus-api:*` 混淆。

### 失败模式

必须覆盖：

- Directus 不可用：使用本地 JSON。
- settings 可用但 bundle 不可用：使用旧缓存；旧缓存也没有则本地 JSON。
- 英文未开放：`?lang=en`、localStorage `en` 均回落中文。
- 英文开放但部分英文缺失：缺失字段回退中文。
- 字段类型错误：当前字段回退本地同 key，不影响整页。
- 运行时 bundle 被误删：保留中文站可访问。

## Publishing Workflow for Operations

### 推荐流程

1. 运营在 Directus 中按页面和模块筛选字段。
2. 修改 `value_zh` 或填入已确认的 `value_en`。
3. 系统或脚本检查必填字段、英文缺失、类型不匹配、重复 key。
4. 待审核字段进入 `pending_review`。
5. 审核通过后标记 `approved`。
6. 发布生成新的 `site_i18n_releases.version`。
7. 更新 `site_i18n_settings.published_version`。
8. 前端检测版本变化并刷新缓存。
9. 若上线异常，可将 `published_version` 切回上一版本完成回滚。

### 翻译合规流程

- 中文固定文案可作为源内容维护。
- 英文内容必须来自 `doc/zh-en/` 下翻译对照文件或用户确认稿。
- `doc/zh-en/` 未覆盖的字段不得自行翻译。
- 未确认英文的字段：
- `translation_status = missing` 或 `pending_review`
- 前台英文模式回退中文
- 审计报告中列出，但不阻塞中文站发布

## Migration Plan

### 阶段 1：审计与基线冻结

- 扫描 `src/i18n/zh-CN.json`、`src/i18n/en-US.json` 的 key 差异。
- 扫描 Vue 组件中的硬编码中文。
- 梳理 `getText()` 返回对象/数组的 key，避免迁移时破坏结构。
- 确认当前真正运行的根级 JSON 与未运行的模块化 JSON 差异。
- 生成审计报告，不改变线上行为。

### 阶段 2：Directus 模型落库

- 创建 `site_i18n_entries`、`site_i18n_releases`、`site_i18n_settings`。
- 配置运营视图、字段说明、权限和发布流程。
- 先导入中文基线。
- 英文只导入已确认来源；未确认字段标记待补。

### 阶段 3：种子数据与发布快照

- 从本地 JSON 生成扁平 key 清单。
- 保留数组/对象结构的类型信息。
- 创建首个发布版本，版本内容应等价于当前前端 JSON。
- 发布前校验 Directus bundle 与本地 JSON 的关键字段一致性。

### 阶段 4：前端运行时读取灰度

- 新增 `src/api/siteI18n.js`。
- 改造 `src/utils/language.js` 支持运行时资源合并。
- 默认仍可通过本地 fallback 保持当前行为。
- 使用后台开关控制英文入口，不再依赖源码常量。
- 先在测试环境验证，再开启生产读取。

### 阶段 5：新闻分类与语言刷新统一

- 将新闻分类筛选项改为优先读取 Directus 分类。
- 让分类颜色、排序、中英文名称从后台发布内容中获得。
- 首页新闻、新闻列表、新闻详情监听语言变化后重新映射或重新请求。
- 清理新闻标题、返回按钮、筛选项等硬编码中文。

### 阶段 6：运营文档与旧资源治理

- 更新 README 和运营文档。
- 明确“新闻内容”和“官网固定文案”的维护入口。
- 未使用的模块化 JSON 选择归档、删除或标注为历史资源。
- 保留根级 JSON 作为紧急 fallback，不作为日常运营入口。

## Rollback Strategy

- **内容回滚**：Directus 中将 `site_i18n_settings.published_version` 切回上一稳定版本。
- **前端回滚**：运行时资源失败时自动使用缓存或本地 JSON。
- **英文入口回滚**：后台关闭 `feature_en_enabled` 即可隐藏英文入口。
- **分类回滚**：新闻分类接口异常时沿用本地兼容映射，避免新闻列表不可用。
- **代码回滚**：长期改造应拆成小 PR 或小提交，先合并资源层，再逐步替换硬编码。

## Performance and Reliability

- `getText()` 必须保持纯内存读取，不允许每次调用发网络请求。
- 运行时资源在启动、版本变化或手动刷新时批量加载。
- 大型资源建议按发布版本缓存，避免每次页面切换重复请求。
- Directus API 请求设置超时，防止阻塞首屏。
- 缓存解析失败时应清理对应 key 并降级，不影响页面。
- 生产日志只记录摘要，例如版本号、失败原因、fallback 状态，避免打印完整文案和敏感配置。

## Directory Structure

```text
d:/UGit/mint_bio/
├── .codebuddy/
│   └── plans/
│       └── operator-friendly-i18n-runtime-long-term.md
│           # [NEW] 长期 OpenSpec 计划文件。记录 Directus 运营模型、前端运行时资源层、迁移阶段、回滚和验收标准。
│
├── src/
│   ├── main.js
│   │   # [MODIFY] 支持异步语言初始化、超时降级和启动后资源刷新。
│   │
│   ├── api/
│   │   ├── news.js
│   │   │   # [MODIFY] 新闻分类优先使用 Directus 发布字段；补充语言切换后重新映射或刷新。
│   │   └── siteI18n.js
│   │       # [NEW] 读取 Directus 固定文案、语言设置、发布版本；实现缓存、超时和降级。
│   │
│   ├── utils/
│   │   └── language.js
│   │       # [MODIFY] 合并运行时资源与本地 JSON；支持后台英文开关、资源版本、fallback 顺序。
│   │
│   ├── i18n/
│   │   ├── zh-CN.json
│   │   │   # [MODIFY] 保留中文 fallback 和开发基线；必要时补齐结构但不改变运营入口。
│   │   └── en-US.json
│   │       # [MODIFY] 保留英文 fallback；只使用已确认翻译修正。
│   │
│   ├── components/
│   │   ├── Header/index.vue
│   │   │   # [MODIFY] 语言入口改为读取运行时设置，保留现有视觉。
│   │   ├── MobileHeader/index.vue
│   │   │   # [MODIFY] 移动端与 PC 使用同一语言开关逻辑。
│   │   └── MiNTNews/
│   │       ├── MiNTNewsList.vue
│   │       │   # [MODIFY] 新闻分类筛选从后台分类资源生成，清理硬编码中文。
│   │       └── MiNTNewsListMobile.vue
│   │           # [MODIFY] 移动端新闻分类与语言刷新逻辑对齐 PC。
│   │
│   └── pages/
│       ├── Home/index.vue
│       │   # [MODIFY] 检查固定文案和首页新闻在语言切换后的刷新一致性。
│       ├── HomeMobile/index.vue
│       │   # [MODIFY] 与 PC 首页保持同一语言刷新策略。
│       └── MiNTNews/
│           └── MiNTNewsDetail.vue
│               # [MODIFY] 清理详情页硬编码中文，补充语言切换后详情刷新。
│
├── scripts/
│   ├── audit-i18n.mjs
│   │   # [NEW] 审计 key 缺失、中文残留、未使用 key、硬编码中文、类型不匹配。
│   ├── flatten-i18n.mjs
│   │   # [NEW] 将本地嵌套 JSON 转换为 Directus 可导入扁平 key 数据。
│   └── directus-i18n-seed.mjs
│       # [NEW] 生成或导入 Directus 初始内容；英文只使用已确认翻译来源。
│
├── doc/
│   ├── operations/
│   │   ├── directus-i18n-guide.md
│   │   │   # [NEW] 面向运营的固定文案维护、审核、发布、回滚指南。
│   │   └── english-content-update.md
│   │       # [MODIFY] 更新英文内容维护流程，区分新闻与固定文案。
│   └── ops-dev/
│       ├── frontend-pages-and-i18n.md
│       │   # [MODIFY] 更新运行时语言资源、缓存、fallback、组件接入说明。
│       └── directus-i18n-schema.md
│           # [NEW] Directus 集合、字段、权限、发布流程和回滚设计文档。
│
└── README.md
    # [MODIFY] 更新英文入口恢复方式，从源码常量改为后台配置。
```

## Key Code Structures

```js
// src/api/siteI18n.js 返回给语言层的标准结构
export interface SiteI18nRuntimePayload {
  settings: {
    feature_en_enabled: boolean
    default_language: 'zh' | 'en'
    supported_languages: Array<'zh' | 'en'>
    published_version: string
    cache_ttl_seconds?: number
    force_refresh_token?: string
  }
  resources: {
    zh: Record<string, unknown>
    en: Record<string, unknown>
  }
  meta: {
    version: string
    loaded_from: 'network' | 'cache' | 'fallback'
    updated_at?: string
  }
}
```

```js
// Directus 固定文案条目前端标准化结构
export interface SiteI18nEntry {
  key_path: string
  label_zh: string
  page: string
  section: string
  value_type: 'text' | 'textarea' | 'richtext' | 'url' | 'image' | 'number' | 'boolean' | 'json' | 'list_item'
  value_zh: unknown
  value_en?: unknown
  translation_status: 'missing' | 'pending_review' | 'approved' | 'published'
  content_status: 'draft' | 'published' | 'archived'
  fallback_policy?: 'fallback_zh' | 'hide_optional' | 'show_key_dev_only'
  sort?: number
}
```

## Validation / Acceptance Criteria

- Directus 不可用时，中文站仍可正常访问，页面不空白。
- Directus 不可用时，生产环境不出现裸露 key；开发环境可输出缺失摘要。
- 运营在 Directus 修改固定文案并发布后，前端可在缓存刷新或版本变化后生效，无需重新构建。
- 英文入口可通过后台 `feature_en_enabled` 开关控制，无需修改 `src/utils/language.js`。
- 英文缺失字段回退中文，并进入审计报告。
- 新闻分类筛选项的中英文名称、排序、颜色与后台一致。
- PC 与 Mobile 同一页面展示的语言内容一致。
- `getText()` 的现有调用方式保持兼容。
- 本地 JSON 仍可作为紧急 fallback 和开发基线。
- 翻译内容未覆盖 `doc/zh-en/` 或用户确认稿时，不得自行补译上线。

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: 深入审计全仓 i18n key、硬编码中文、PC/Mobile 重复组件、新闻语言刷新链路。
- Expected outcome: 形成可迁移 key 清单、硬编码清理清单和风险文件清单。

### Skill

- **directus-bt-migration-coach**
- Purpose: 结合当前 Directus 自托管与宝塔部署背景，校验长期集合模型、权限、缓存和发布流程是否适合现有部署。
- Expected outcome: Directus 模型与现有生产部署约束一致，避免引入不适合当前后台环境的方案。

- **document-docx**
- Purpose: 读取 `doc/zh-en/` 下翻译对照文档，提取已批准中英文对应关系。
- Expected outcome: 为 Directus 种子数据和英文 fallback 修正提供合规来源。

- **i18n-translator**
- Purpose: 在已有翻译对照或用户确认稿基础上，辅助维护 i18n JSON 结构和组件 `getText()` 接入。
- Expected outcome: 保持中英文资源结构一致，生成缺失翻译清单，不自行补译。