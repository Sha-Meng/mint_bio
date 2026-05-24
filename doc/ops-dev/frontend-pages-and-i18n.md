# 页面、路由与中英文机制

## 1. 路由入口

路由文件：`src/router/index.js`

当前使用：

```js
createWebHashHistory()
```

即 URL 使用 Hash 模式。

## 2. PC / Mobile 分流

项目在创建 router 时通过 `validPcOrPhone()` 判断使用 PC 路由还是移动端路由：

- PC：`PcRoutes`
- Mobile：`MobileRoutes`

`src/App.vue` 监听窗口尺寸变化。如果 PC / Mobile 状态变化，会触发页面 reload，重新初始化对应路由和组件。

## 3. 路由表

| 路由 | PC 组件 | Mobile 组件 | 说明 |
|---|---|---|---|
| `/` | `Home` | `HomeMobile` | 默认首页。 |
| `/home` | `Home` | `HomeMobile` | 首页，路由配置隐藏 PC Header。 |
| `/bioIntelligent` | `BioIntelligent` | `BioIntelligentMobile` | 生物智造。 |
| `/corporate` | `CorporateVision` | `CorporateVisionMobile` | 企业介绍。 |
| `/vision` | `Vision` | `VisionMobile` | 愿景与责任。 |
| `/material` | `NewMaterial` | `NewMaterialMobile` | 生物降解新材料。 |
| `/aminoAcid` | `AminoAcid` | `AminoAcidMobile` | 生物合成氨基酸。 |
| `/knotWeed` | `KnotWeed` | `KnotWeedMobile` | 节豆日粮方案。 |
| `/mintNews` | `MiNTNews` | `MiNTNewsMobile` | 新闻列表。 |
| `/mintNews/detail/:configId` | `MiNTNewsDetail` | `MiNTNewsDetailMobile` | 新闻详情。 |

## 4. 全局布局

`src/App.vue` 负责全局布局：

- PC：`Header`、`Footer`、`Contact`
- Mobile：`MobileHeader`、`FooterMobile`、`ContactMobile`
- 中间为 `router-view`

PC Header 可通过路由 `meta.unRequiresHeader` 隐藏。

## 5. 联系表单

PC 和移动端联系表单均提交到相对路径：

```text
/api/contact/submit
```

本地开发时由 `vue.config.js` 代理到后端。

## 6. i18n 实现

核心文件：`src/utils/language.js`

主要导出：

| 名称 | 说明 |
|---|---|
| `currentLanguage` | 当前语言状态。 |
| `runtimeSettings` | Directus 运行时语言配置。 |
| `i18nResourceVersion` | 资源版本响应式标记，用于触发文案刷新。 |
| `initializeLanguage()` | 初始化语言并加载运行时文案。 |
| `refreshI18nResources()` | 手动刷新运行时文案。 |
| `getText(key)` | 根据 key 获取当前语言文案。 |
| `switchLanguage(lang)` | 切换语言。 |
| `isChinese()` | 判断当前是否中文。 |
| `isEnglishEnabled()` | 判断后台是否开启英文入口。 |
| `i18nPlugin` | Vue 插件，全局注入 `$t` 和 `$lang`。 |

运行时文案接口：`src/api/siteI18n.js`

读取 Directus 集合：

- `site_i18n_settings`
- `site_i18n_entries`

本地 fallback：

```text
src/i18n/zh-CN.json
src/i18n/en-US.json
```

`src/i18n/common/*.json` 和 `src/i18n/modules/**/*.json` 当前不作为运行时入口。固定文案日常维护以 Directus `site_i18n_entries` 为准。

## 7. 英文入口开关

英文入口由 Directus 控制：

```text
site_i18n_settings.feature_en_enabled
```

关闭时：

- `en` 被视为无效语言。
- `?lang=en` 不生效。
- `localStorage.language=en` 会被重置为 `zh`。
- Header / MobileHeader 中语言切换入口隐藏。

开启时：

- PC Header 显示语言切换。
- MobileHeader 显示 CN / EN 切换。
- `?lang=en` 生效。
- 语言偏好保存到 `localStorage.language`。

英文入口只通过 Directus `site_i18n_settings.feature_en_enabled` 控制。

## 8. 固定文案维护

组件继续通过 `getText()` 读取文案：

```js
getText('nav.news')
```

文案来源优先级：

```text
Directus 当前语言
  -> Directus 中文
  -> 本地 JSON 当前语言
  -> 本地 JSON 中文
  -> key
```

Directus 维护位置：

| 集合 | 用途 |
|---|---|
| `site_i18n_entries` | 固定文案 key-value。 |
| `site_i18n_settings` | 英文入口、整数 `content_version`；默认语言固定为中文。 |

文案更新流程：

1. 运营修改 `site_i18n_entries.value_zh` 或 `value_en`。
2. 运营更新 `site_i18n_settings.content_version`。
3. 用户重新打开或强制刷新页面。
4. 前端检查版本变化并刷新缓存。

如果只改文案但不更新 `content_version`，前端允许继续使用旧缓存。

## 9. 缓存和强制刷新

前端不使用后台配置的缓存时长。

固定策略：

1. 每次应用启动请求轻量的 `site_i18n_settings`。
2. 如果 `content_version` 没变，使用本地缓存的 entries bundle。
3. 如果 `content_version` 变化，重新拉取 `enabled = true` 的 `site_i18n_entries`。
4. Directus 异常时，优先旧缓存；没有旧缓存时使用本地 JSON。

因此，强制刷新页面会重新检查版本。只要运营已更新 `content_version` 且 Directus 可访问，强刷后会加载新文案。

## 10. 新闻内容与固定文案的区别

| 内容 | 维护位置 | 是否需要重新构建 |
|---|---|---|
| 导航、页面标题、按钮、表单提示等固定文案 | Directus `site_i18n_entries` | 否；更新 `content_version` 即可 |
| 新闻标题、摘要、正文 | Directus `news_articles` | 否 |
| 新闻分类中英文切换 | 当前不纳入固定文案配置 | 不处理 |

新闻英文 fallback 逻辑在 `src/api/news.js`，详见 [Directus 新闻前端集成](./directus-news-integration.md)。

## 11. 翻译规则

- 只能使用 `doc/archive/zh-en/` 中已有对照、用户确认稿或负责人明确确认的翻译资料。
- 未覆盖内容不得自行翻译。
- 固定文案英文缺失时，`site_i18n_entries.value_en` 保持空值，前端回退中文。

## 12. 后续开发新增文本规范

所有新增和日常维护的固定文案都必须走 Directus `site_i18n_entries`。本地 `src/i18n/zh-CN.json` 和 `src/i18n/en-US.json` 只作为构建随包 fallback，不作为日常新增入口。

新增文案流程：

1. 先设计稳定的 `key_path`，例如 `news.moreNews`、`common.media.videoUnsupported`、`newMaterial.moduleCards.0.title`。
2. 在 Directus `site_i18n_entries` 中新增记录，填写 `group`、`label`、`key_path`、`value_zh`、`enabled`。
3. 只有已有确认英文稿时才填写 `value_en`；没有确认英文时保持为空。
4. 前端模板、按钮、placeholder、错误提示、媒体 fallback、列表分类、数组/对象文案统一通过 `getText()` 或 Directus 字段读取。
5. 保存 Directus 文案后更新 `site_i18n_settings.content_version`。
6. 如该文案需要离线/接口异常兜底，再把同 key 同步到本地 JSON；本地 JSON 不承担日常运营维护职责。

开发禁止项：

- 不要在 `.vue` 模板中直接写用户可见中文或英文。
- 不要在 JS 数组里维护用户可见分类 label、标题、按钮文案。
- 不要为了英文页面自行翻译；没有确认译文时让英文值为空并回退中文。
- 不要新增只存在本地 JSON、Directus 中没有对应记录的长期文案。

自查命令：

```text
node scripts/audit-i18n-simple.mjs
```

审计结果中的注释中文不影响中英文切换，可不处理；需要处理的是会进入页面渲染的用户可见文本。
