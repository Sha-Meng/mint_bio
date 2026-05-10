name: News API Contract
phase: Phase 6 - 官网读接口适配
date: 2026-05-10
status: draft / implemented behind feature flag

## overview

本契约定义官网新闻模块从旧静态 JSON 切到 Directus 读接口时的前端数据形状与接口行为。MVP 阶段先采用“前端直连 Directus REST + 本地 mapper + 静态 JSON 回退”，暂不引入 BFF。

## User Requirements

- 保持旧页面展示效果与交互尽量一致。
- 前端页面改动必须可回滚。
- Directus 数据源上线前必须可全量自测。
- 中文内容为主，英文字段为空时 fallback 中文。
- 禁止脚本或前端自行翻译新闻内容。

## Current Boundary

本阶段实现的是前端读适配层，不改 Directus schema，不切生产默认数据源。

- 默认：`VUE_APP_USE_DIRECTUS` 不为 `true` 时继续读取 `/data/news_list.json` 与 `/data/news_<id>.json`。
- 灰度：`VUE_APP_USE_DIRECTUS=true` 时尝试读取 Directus REST。
- 安全回退：Directus 请求失败时回退旧静态 JSON，避免页面空白。

## Known Server Requirement

2026-05-10 本机验证匿名访问：

- `GET https://cms.mint-bio.cn/items/news_articles?...` 返回 `403 FORBIDDEN`
- `GET https://cms.mint-bio.cn/items/news_categories?...` 返回 `403 FORBIDDEN`

因此正式启用 `VUE_APP_USE_DIRECTUS=true` 前，必须二选一：

1. 在 Directus Public Role 上只开放 `published` 新闻与分类的只读权限；或
2. 增加薄 BFF，由服务器持有只读 token，前端只访问官网同源 `/api/news/*`。

MVP 当前代码不把 Directus token 暴露给浏览器。

## Environment Variables

| 变量 | 默认值 | 说明 |
|---|---|---|
| `VUE_APP_USE_DIRECTUS` | `false` | `true` 时启用 Directus 数据源 |
| `VUE_APP_DIRECTUS_URL` | `/directus-api` | Directus API URL；本地走 Vue devServer 代理，生产走主站 Nginx/CDN 同源代理，避免浏览器跨域 CORS |
| `VUE_APP_DIRECTUS_ASSET_URL` | 同 `VUE_APP_DIRECTUS_URL` | 资源 URL 前缀；默认 `/directus-api/assets/*`，后续可替换为独立 CDN 资源域名 |


## 后续规划：Directus 图片 CDN

当前视频资源 `www.mint-bio.cn/video/*` 已命中 CDN；Directus 图片 `cms.mint-bio.cn/assets/*` 当前未观察到 CDN 命中特征，且响应头存在 `public, max-age=2592000` 与 `no-cache` 并存。正式切流前需完成：

- 推荐生产资源 URL：`https://www.mint-bio.cn/directus-api/assets/<uuid>?width=...&format=webp...` 或独立 CDN 资源域名。
- 主站 Nginx / CDN 回源：`/directus-api/assets/*` → `https://cms.mint-bio.cn/assets/*`。
- CDN 缓存需区分 query string，确保不同 `width/format/quality` 变换图分别缓存。
- 图片响应头应去掉 `no-cache` 冲突，保留长缓存；API JSON 可短缓存或不缓存。
- 验收：二次请求图片响应头出现 CDN 命中（如 `X-Cache` / `Via`）且页面图片仍显示一致。

## Frontend API


代码入口：`src/api/news.js`

### `fetchNewsList(options?)`

用途：新闻列表页 / 详情页“更多动态”。

参数：

```js
{
  category?: 'runtime' | 'production' | 'manufacture' | 'vision' | 'all',
  limit?: number,
  source?: 'auto' | 'directus' | 'static'
}
```

返回：旧 `news_list.json` 兼容数组。

核心字段：

```js
{
  id,              // legacy_id，旧链接继续可用
  slug,            // Directus slug，如 news-48
  title,
  category,        // 旧分类值：runtime / production / manufacture / vision
  categorylabel,
  categorycolor,
  time,            // YYYY/MM/DD
  pic,             // 静态路径或 Directus 绝对资源 URL
  overviewtitle,
  overviewcontent,
  transform
}
```

### `fetchLatestNews(limit = 6)`

用途：首页新闻区。

行为：按 `publish_at desc` / 旧 JSON 当前顺序取前 N 条。

### `fetchNewsDetail(key)`

用途：详情页。

`key` 支持：

- 旧 `legacy_id`：`48`
- 新 `slug`：`news-48`

返回：旧 `news_<id>.json` 兼容对象。

Directus `content_blocks_zh/en` 会被 mapper 转回旧组件可渲染的 `sections[].contents[]`：

| EditorJS block | 旧组件字段 | 说明 |
|---|---|---|
| `image` + `stretched=false` | `pic` | 普通图片 |
| `image` + `stretched=true` | `nopaddingpic` | 无 padding 图片 |
| `paragraph` 纯文本 | `desc` | 普通段落 |
| `paragraph` 含 HTML/class | `strongText` | 用 `v-html` 保留颜色 class |
| `quote` | `quote[]` | 保留左边框引用样式 |
| `raw` | `richHtml` | 视频与富 HTML 直接 `v-html` |
| `delimiter` | 忽略 | 旧组件无等价视觉块 |

### `fetchNewsCategories()`

用途：后续分类动态化。当前列表组件仍保留旧固定分类选项，避免扩大改动面。

返回：

```js
[
  { slug, value, label, color, sort }
]
```

## Directus REST Query Contract

### List / Latest

```http
GET /items/news_articles
  ?filter[status][_eq]=published
  &fields=legacy_id,slug,title_zh,title_en,summary_zh,summary_en,cover,category.slug,category.name_zh,category.name_en,publish_at,featured
  &sort=-featured,-publish_at
  &limit=<N|-1>
```

### Detail by slug

```http
GET /items/news_articles
  ?filter[status][_eq]=published
  &filter[slug][_eq]=<slug>
  &fields=legacy_id,slug,title_zh,title_en,summary_zh,summary_en,cover,category.slug,category.name_zh,category.name_en,publish_at,content_blocks_zh,content_blocks_en
  &limit=1
```

### Detail by legacy_id

```http
GET /items/news_articles
  ?filter[status][_eq]=published
  &filter[legacy_id][_eq]=<id>
  &fields=...
  &limit=1
```

### Categories

```http
GET /items/news_categories
  ?filter[status][_eq]=published
  &fields=slug,name_zh,name_en,sort,status
  &sort=sort
```

## Validation / Acceptance

### Data validation

- `node scripts/audit-news-migration.mjs` 输出 `source=48 directus=48 errors=0 warnings=0`。
- `VUE_APP_USE_DIRECTUS=false` 下页面保持旧静态数据。
- `VUE_APP_USE_DIRECTUS=true` 且 Directus 可匿名读时，列表 / 首页 / 详情能读取 Directus。
- Directus 403 或网络失败时，页面回退旧静态 JSON，不空白。

### Visual regression

Phase 7/8 必测 PC + Mobile：

- 首页新闻 6 条。
- 新闻列表全部分类筛选。
- 详情旧链接 `/mintNews/detail/48`。
- 详情新链接 `/mintNews/detail/news-48`。
- id=48 richHtml 数字徽章。
- id=1 `.orange-text` 与视频。
- id=11 `stretched=true` 无 padding 图片。
- id=19 长摘要。
- id=30 完整详情图文。

## Rollback

- 不设置 `VUE_APP_USE_DIRECTUS=true` 即完全使用旧静态 JSON。
- 如灰度环境开启后异常，移除该环境变量重新构建即可回退。
- 本阶段不删除 `public/data/*.json` 与 `src/assets/News/**`。
