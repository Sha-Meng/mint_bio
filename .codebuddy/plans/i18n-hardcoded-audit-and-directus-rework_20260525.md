# i18n 硬编码审计与 Directus 化改造

## name

i18n-hardcoded-audit-and-directus-rework_20260525

## overview

本次按 Directus-first 的固定文案策略清理仍会进入页面渲染的硬编码文本。所有新增和日常维护文案以 Directus `site_i18n_entries` 为唯一内容来源；本地 `src/i18n/zh-CN.json` 和 `src/i18n/en-US.json` 继续保留，但仅作为构建随包 fallback，不作为日常新增入口。

## todos

- [x] 复核现有语言架构、审计脚本和用户可见硬编码候选。
- [x] 明确本地英文缺失审计结果不等同于 Directus 现网问题。
- [x] 排除注释、开发日志和非用户可见文本。
- [x] 改造 BioIntelligent、新闻、KnotWeed、NewMaterial 中确认的硬编码文案。
- [x] 新闻分类优先读取 Directus `news_categories.name_zh/name_en`。
- [x] 补齐本地 fallback key，后续需同步到 Directus。
- [x] 更新开发/运营文档中的 Directus-only 文案维护口径。
- [x] 运行审计和构建验证。
- [x] 生成 Directus `site_i18n_entries` 增量导入配置。

## User Requirements

- 日常文案维护必须走 Directus，不再把本地 JSON 作为新增入口。
- 保留中英文本地 fallback，但只用于 Directus 不可用或随包保底。
- Directus 中英文为空符合预期，未确认英文不得自动补译。
- 注释里的中文不用处理。
- 必须给出并处理明确的用户可见硬编码清单。

## Implementation Approach

- 组件模板中的固定文案统一改为 `getText()`。
- 新闻分类不再在 PC/Mobile 列表维护本地 `options`，改为调用 `fetchNewsCategories()`。
- `src/api/news.js` 中分类 fallback 不再写中文 label，改为固定 i18n key。
- 新增 fallback key：
  - `common.media.videoUnsupported`
  - `knotWeed.importAmount`
  - `newMaterial.moduleCards`
  - `news.categories.*`
- 文档同步强调：新增文案应先建 Directus key；本地 JSON 只在需要随包 fallback 时同步。

## Validation / Acceptance

- `node scripts/audit-i18n-simple.mjs` 可运行并输出审计结果。
- 手动搜索 `labelZh`、新闻列表本地分类数组、`const titles`、`const nums`、模板中的“更多动态/全部/1亿”等硬编码，确认本轮清单已处理。
- `npm.cmd run build` 可通过，或记录无法通过的原因。
- PC/Mobile 新闻列表、新闻详情、BioIntelligent、KnotWeed、NewMaterial 可继续从中文 fallback 渲染。
- Directus 增量导入文件位于 `doc/operations/site-i18n-entries-hardcoded-rework_20260525.json`，导入后需更新 `site_i18n_settings.content_version` 并强刷验证。
