# 官网固定文案 Directus 运行时配置简化方案

## name
operator-friendly-i18n-simple-runtime

## overview
将官网固定文案和英文入口从源码 JSON / 常量开关，改造为 Directus 后台可搜索、可编辑、可配置的轻量运行时方案。方案只保留两张集合，不做复杂发布、审核、审计和快照回滚。

## User Requirements

- 运营不需要理解嵌套 JSON。
- 固定文案修改不应每次都重新构建前端。
- 配置要简单、高效、方便搜索、方便修正。
- `site_i18n_entries` 不保留 `sort` / `note`，直接用 `group + key_path` 搜索和排序。
- 不建设 `site_i18n_releases`、`site_i18n_audit_reports`。
- 不加入 `cache_ttl_seconds`，前端每次启动轻量检查整数 `content_version`。
- 新闻分类中英文切换暂不纳入本期，只在文档中标记清楚。
- 翻译内容不得自行补译，未确认英文保持空值或回退中文。
- 改造完成后必须提供完整 Directus 建表、导入、启用、验证和日常维护指引。

## Core Features

- `site_i18n_entries` 保存固定文案。
- `site_i18n_settings` 保存英文入口开关和整数 `content_version`；默认语言固定为中文。
- 前端启动时检查 settings；版本变化才重新拉取 entries。
- Directus 异常时优先旧缓存，再回退本地 `src/i18n/*.json`。
- 组件继续使用 `getText()`，避免大规模重写。

## Directus Data Model

### `site_i18n_entries`

| 字段 | 说明 |
|---|---|
| `id` | Directus 主键。 |
| `key_path` | 唯一文案 key，例如 `nav.news`、`home.hero.title`。 |
| `group` | 分组，例如 `nav`、`footer`、`home`、`news`。 |
| `label` | 运营可读中文说明。 |
| `value_zh` | 中文内容。 |
| `value_en` | 英文内容；为空时前台回退中文。 |
| `enabled` | 是否启用，默认 `true`。 |

### `site_i18n_settings`

只维护一条记录，例如 `site-default`。

| 字段 | 说明 |
|---|---|
| `id` | 固定记录 ID。 |
| `feature_en_enabled` | 是否显示英文入口。 |
| `content_version` | 整数内容版本号，初始为 `1`，每次修改文案后加 `1`。 |

## Runtime Cache Strategy

1. 每次应用启动或强制刷新时，请求 `site_i18n_settings`。
2. 如果远端 `content_version` 与本地缓存一致，使用本地 entries bundle。
3. 如果版本变化，拉取 `enabled = true` 的 `site_i18n_entries`。
4. 拉取成功后替换本地缓存并刷新运行时资源。
5. settings 请求失败时，优先旧缓存；旧缓存不存在时使用本地 JSON。
6. entries 请求失败时，保留旧缓存；旧缓存不存在时使用本地 JSON。

结论：不是实时刷新；运营更新文案后必须更新 `content_version`。用户强制刷新页面时会重新检查版本，只要 Directus 可访问且版本已变化，就会加载新文案。

## Implementation Approach

- 新增 `src/api/siteI18n.js`：读取 settings、entries，管理缓存和失败降级。
- 改造 `src/utils/language.js`：合并运行时资源和本地 fallback，保留现有 API。
- 改造 `Header` / `MobileHeader`：语言入口改读 `isEnglishEnabled()`。
- 新增 `scripts/flatten-i18n.mjs`：生成 Directus 初始导入 JSON 和英文缺失清单。
- 新增/更新运营与开发文档。

## Post-Implementation User Actions

1. 在 Directus 创建 `site_i18n_entries` 和 `site_i18n_settings`。
2. 配置字段、列表展示、搜索字段和只读权限。
3. 运行导入脚本，生成并导入初始文案。
4. 创建 settings 记录：`site-default`、`feature_en_enabled=false`、`content_version=1`。
5. 部署前端后验证读取、缓存、强刷更新和 fallback。
6. 日常修改：搜索文案，修改 `value_zh` / 已确认的 `value_en`，保存，更新 `content_version`。

## Migration Progress

- 2026-05-24：用户已在 Directus 创建 `site_i18n_entries` 和 `site_i18n_settings`。
- 2026-05-24：`site_i18n_entries` 已按最简字段建表：`key_path`、`group`、`label`、`value_zh`、`value_en`、`enabled`。
- 2026-05-24：`site_i18n_settings` 已按最简字段建表：`feature_en_enabled`、整数 `content_version`。
- 2026-05-24：Public 读取权限、初始文案导入、浏览器接口验证已由用户完成。
- 2026-05-24：本地 `yarn serve` 验证通过：`site_i18n_settings` / `site_i18n_entries` 已成功请求并写入缓存，中文文案更新 + `content_version` 递增生效，英文入口开关验证通过。
- 2026-05-24：用户已部署当前前端构建到生产，并完成生产复验 3 项：中文正常无 key 裸露、文案修改 + `content_version` 递增生效、英文入口开关生效后已按需恢复关闭。
- 当前状态：固定文案 Directus 运行时配置改造已完成并通过生产验收。

## Validation / Acceptance

- [x] 本地验证：修改 Directus 文案并更新 `content_version` 后，无需重新构建前端即可生效。
- [x] 生产验证：修改 Directus 文案并更新 `content_version` 后，无需重新构建前端即可生效。
- [x] 本地验证：英文入口由 `feature_en_enabled` 控制。
- [x] 生产验证：英文入口由 `feature_en_enabled` 控制。
- Directus 不可用时页面仍能显示旧缓存或本地 JSON。
- `value_en` 为空时回退中文。
- PC / Mobile 语言入口行为一致。
- 不处理新闻分类中英文切换。
- 不自行补译英文。
