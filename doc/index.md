# mint_bio 当前交接文档入口

> 本目录是当前有效的项目交接文档入口。历史资料已移动到 `archive/`，仅用于追溯，不作为当前操作依据。

## 当前状态摘要

- 官网前端：Vue 3 + Vue CLI + Vue Router + Element Plus，兼容层使用 `@vue/compat`。
- 页面架构：PC / Mobile 双版本组件，通过屏幕宽度分流。
- 新闻模块：已固定切换为 Directus 单一数据源，不再读取 `public/data/news_*.json`。
- Directus 后台：`https://cms.mint-bio.cn`。
- 官网读取新闻：默认经同源 `/directus-api` 访问 Directus REST。
- 固定文案：由 Directus `site_i18n_entries` 运行时维护，修改后将 `site_i18n_settings.content_version` 加 `1` 即可生效，无需重新构建前端。
- 英文入口：由 Directus `site_i18n_settings.feature_en_enabled` 控制，当前建议保持关闭。
- 英文能力：新闻英文字段和固定文案英文为空时前端回退中文。

## 运营文档

| 文档 | 用途 |
|---|---|
| [Directus 新闻编辑器使用手册](./operations/directus-news-guide.md) | 面向运营，说明如何新增、编辑、发布、下线新闻，以及如何维护图片、正文块、颜色短代码。 |
| [Directus 固定文案配置指南](./operations/directus-i18n-guide.md) | 面向运营，说明如何搜索和修改官网固定文案、刷新版本、控制英文入口。 |
| [英文信息更新说明](./operations/english-content-update.md) | 面向运营和内容负责人，说明新闻英文、固定英文文案、英文入口和翻译来源要求。 |

## 运维 / 开发文档

| 文档 | 用途 |
|---|---|
| [技术总览](./ops-dev/technical-overview.md) | 项目功能、技术栈、目录、运行链路总览。 |
| [页面、路由与中英文机制](./ops-dev/frontend-pages-and-i18n.md) | 页面清单、PC/移动端分流、全局布局、i18n 和英文入口开关。 |
| [Directus 新闻前端集成](./ops-dev/directus-news-integration.md) | 新闻 API、字段映射、分类映射、图片资源、缓存、fallback、短代码渲染。 |
| [部署、服务器、宝塔、域名与 CDN](./ops-dev/deployment-server-cdn.md) | 生产链路、宝塔/Nginx、Directus、CDN/DNS、备份回滚和排障。 |
| [账号凭据安全交接模板](./ops-dev/credentials-handoff-template.md) | 服务器、宝塔、Directus、MySQL、DNS/CDN 等凭据交接模板。**不保存真实密码**。 |

## 归档资料

| 目录 | 内容 | 注意事项 |
|---|---|---|
| `archive/update/` | 历史官网更新需求资料 | 仅作背景参考。 |
| `archive/zh-en/` | 历史中英对照 docx | 可作为翻译来源，但需人工确认适用范围。 |
| `archive/legacy-docs/` | 旧版架构、页面、新闻、CDN 文档 | 其中可能包含过期流程，不作为当前操作依据。 |
| `archive/i18n-runtime-migration_20260524.md` | 固定文案 Directus 运行时配置迁移记录 | 仅用于追溯建表、导入和验收过程。 |

详见 [归档区说明](./archive/README.md)。

## 当前禁止继续使用的旧流程

- 不再通过 `public/data/news_list.json` 或 `public/data/news_{id}.json` 更新新闻。
- 不再把新闻图片放入 `src/assets/News/**` 后重新构建作为运营流程。
- 不再使用 `VUE_APP_USE_DIRECTUS` 切换新旧新闻数据源。
- 不再依赖旧新闻静态 JSON fallback。
- 日常固定文案维护不再修改 `src/i18n/*.json`；该目录仅作为前端紧急 fallback。
- 运营不得自行根据上下文翻译英文内容；翻译必须来自历史中英对照资料或用户确认稿。
- 仓库文档不得保存真实服务器密码、宝塔密码、数据库密码、Token、私钥。
