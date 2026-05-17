name: News Directus Production Cutover Plan
phase: Phase 7/8 - 前端切流与最终回归
date: 2026-05-10
status: production-cutover-completed - 48h observation in progress

## overview

本文件记录 mint_bio 新闻模块从旧静态 JSON 切到 Directus 数据源的生产部署方案。目标是在不改变现有页面表现的前提下，通过 `VUE_APP_USE_DIRECTUS=true` 开关灰度；生产优先采用主站同源代理 `/directus-api`，避免浏览器跨域 CORS，并为 Directus 图片补 CDN 缓存。

## Current Confirmed State

- Directus 后台：`https://cms.mint-bio.cn` → 宝塔 Nginx → `127.0.0.1:8055`。
- Directus Public Policy：`news_articles` / `news_categories` / `directus_files` 已开放只读，匿名 REST 返回 200。
- Directus 灰度包 `dist-directus-gray-20260517-1901.zip` 已上传复测，用户确认审查无问题。
- Phase 8.1 数据一致性审计通过：`audit-report-1779016311625.json`，source=48 / directus=48 / errors=0 / warnings=0。
- Phase 8.2 页面视觉回归通过：quote、摘要、连续图片、长图 transform 400 等抽检问题已修复。
- Phase 8.3 路由回归通过：旧 legacy_id 链接、新 slug 链接、新建文章 slug 链接均已确认。
- Directus 后台发布流程验收通过：新闻新增、编辑、删除/归档、草稿保存、发布后前端展示/隐藏链路均已确认。
- 生产服务器现网站点目录备份已由用户完成；本地临时备份目录不保留、不提交，归档以服务器备份 + Git 历史版本为准。
- 外网生产站点已切换到 Directus 版本，当前进入切流后 48h 观察窗口；对应 Git 版本以本次归档提交为准。
- 主站 `/directus-api` 新闻/分类/图片代理已验证，Directus 图片 transform 可命中 CDN。
- `src/api/news.js` 默认 Directus API/Asset 前缀为 `/directus-api`。
- 正式切流稳定后，旧静态 JSON/fallback/`VUE_APP_USE_DIRECTUS=false` 兼容路径将清理，新闻模块最终保持单一 Directus 数据源。

## Production Target Topology

```text
Browser
  ↓ same origin
https://www.mint-bio.cn/directus-api/items/news_articles
https://www.mint-bio.cn/directus-api/assets/<uuid>?width=800&format=webp
  ↓ Nginx / CDN reverse proxy
https://cms.mint-bio.cn/items/news_articles
https://cms.mint-bio.cn/assets/<uuid>?width=800&format=webp
```

视频继续走现有：

```text
https://www.mint-bio.cn/video/News/...
```

## Required Frontend Build Variables

Directus 灰度构建：

```env
VUE_APP_USE_DIRECTUS=true
VUE_APP_DIRECTUS_URL=/directus-api
VUE_APP_DIRECTUS_ASSET_URL=/directus-api
```

回滚构建：

```env
VUE_APP_USE_DIRECTUS=false
```

> 不配置 `VUE_APP_DIRECTUS_URL` / `VUE_APP_DIRECTUS_ASSET_URL` 时，代码默认也是 `/directus-api`。

## BaoTa / Nginx Production Proxy Checklist

在主站 `www.mint-bio.cn` / `mint-bio.cn` 对应站点中新增反向代理或 Nginx location。

### API proxy

```nginx
location ^~ /directus-api/ {
    proxy_pass https://cms.mint-bio.cn/;
    proxy_set_header Host cms.mint-bio.cn;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_read_timeout 60s;
    proxy_send_timeout 60s;
}
```

### Cache policy split

建议在 CDN / Nginx 层区分：

| 路径 | 缓存建议 |
|---|---|
| `/directus-api/items/*` | 短缓存或不缓存；可 `s-maxage=60, stale-while-revalidate=300` |
| `/directus-api/assets/*` | 长缓存；至少 30 天；必须按 query string 区分缓存 |
| `/video/*` | 保持现有 CDN 缓存 |

Directus 当前图片响应头存在：

```text
Cache-Control: public, max-age=2592000
Cache-Control: no-cache
```

正式切流前需在 Nginx/CDN 层消除 `no-cache` 对图片缓存的影响。

## CDN Requirements for Directus Images

- CDN 回源到 `cms.mint-bio.cn` 或主站 `/directus-api/assets/*` 代理。
- CDN cache key 必须包含 query string：
  - `width`
  - `height`
  - `fit`
  - `format`
  - `quality`
- 验收响应头应出现 CDN 命中特征：
  - `X-Cache`
  - `Via`
  - 或云厂商等价 header
- 验证样例：

```text
/directus-api/assets/<uuid>?width=800&height=500&fit=cover&format=webp&quality=80
/directus-api/assets/<uuid>?width=1200&format=webp&quality=85
```

## P0 Fix Plan Before Cutover

### P0-1 新文章 `legacy_id=null` 链接风险

状态：代码已修复，待灰度验收。

处理策略：列表/首页卡片的详情链接统一优先使用 `detailKey` / `slug`，仅历史 1~48 兼容场景继续保留 `legacy_id`。验收时需新增或使用一篇 `legacy_id=null` 的 Directus 测试文章，确认列表、首页、详情新链接均可达。

### P0-2 draft/delete 后静态 fallback 误展示风险

状态：代码已修复，待灰度验收。

处理策略：`VUE_APP_USE_DIRECTUS=true` 时区分“网络/API 异常”和“业务未命中”。只有网络错误、无响应或 5xx 等系统级异常允许 fallback 到旧静态 JSON；Directus 明确返回空列表、详情未命中、文章非 `published` 或 4xx 时不再 fallback 静态详情，详情页会清空旧内容，避免被下线的旧 48 篇重新展示。

## Production Cutover Checklist

### 0. 切流前备份

1. 在宝塔/服务器上备份当前生产站点目录（例如 `/www/wwwroot/mint-bio.cn`），保留为 `pre-directus-cutover-YYYYMMDD-HHmm`。
2. 保留当前线上可用 dist 包或站点目录副本，作为短期应急回滚包。
3. 不删除 Directus 数据、不删除旧 `public/data` 与旧资源；旧兼容路径等切流稳定后再统一清理。

### 1. 上线包

1. 使用已通过灰度验收的 Directus 包：`dist-directus-gray-20260517-1901.zip`。
2. 解压后确认包内根层级直接包含：`index.html`、`js/`、`css/`、`static/`、`reset.css`，不要多套一层 `dist/`。
3. 覆盖生产站点目录。

### 2. 生产同源代理与资源验证

切流后立即验证：

```text
https://www.mint-bio.cn/directus-api/items/news_articles?limit=1&fields=legacy_id,slug,title_zh,status
https://www.mint-bio.cn/directus-api/items/news_categories?limit=1&fields=slug,name_zh,status
https://www.mint-bio.cn/directus-api/assets/b5215e42-9573-45a4-a56a-f3b626e26ea2?width=800&height=500&fit=cover&format=webp&quality=80
https://www.mint-bio.cn/directus-api/assets/4a4b8dc5-806a-41d1-a888-296be91d683b?width=800&height=500&fit=cover&format=webp&quality=80
```

期望：API 返回 200；图片返回 200 + `image/webp` + 长缓存。

### 3. CDN/浏览器刷新

正式生产域名已在 CDN 账号中时，刷新：

```text
https://www.mint-bio.cn/
https://www.mint-bio.cn/index.html
https://www.mint-bio.cn/js/
https://www.mint-bio.cn/css/
https://www.mint-bio.cn/reset.css
```

如 CDN 不支持目录刷新，则刷新对应文件 URL；浏览器用无痕窗口或 Ctrl+F5 验证。

### 4. 快速业务验收

切流后 15 分钟内完成：

```text
/mintNews
/mintNews/detail/1
/mintNews/detail/news-1
/mintNews/detail/48
/mintNews/detail/news-48
/mintNews/detail/test-null-legacy-article
```

重点检查：PC/Mobile 首页新闻区、列表、详情、视频、quote、连续图片、长图、slug 新文章。

### 5. 观察窗口

切流后观察 48h：

- 新闻首页/列表/详情是否正常。
- Directus 后台发布/编辑/下线是否符合预期。
- `/directus-api` 是否有 4xx/5xx 异常。
- 图片 CDN 是否持续命中。
- 如无异常，再进入切流后清理任务。

## Emergency Rollback

正式切流当天保留短期应急回滚能力，但不再把旧静态 JSON 作为长期兼容路线。

若生产异常：

1. 立即恢复切流前备份的生产站点目录或上一版 dist 包。
2. 刷新 CDN：首页、`index.html`、`js/`、`css/`、`reset.css`。
3. 验证首页、新闻列表、新闻详情恢复到切流前状态。
4. 保留 Directus 数据，不删除、不回滚 CMS 数据。
5. 记录异常 URL、浏览器控制台错误、接口响应和截图，再修复后重新灰度。

> 说明：`VUE_APP_USE_DIRECTUS=false` 旧包、静态 JSON fallback 和旧资源仅作为切流前历史兼容能力；正式 Directus 源稳定后会进入清理任务，不长期维护双数据源。

## Acceptance Checklist

- [x] `/directus-api/items/news_articles` 主站同源返回 200。
- [x] `/directus-api/items/news_categories` 主站同源返回 200。
- [x] `/directus-api/assets/<uuid>?width=800&format=webp` 主站同源返回 200。
- [x] Directus 图片响应头命中 CDN 或至少具备可缓存策略。
- [x] `VUE_APP_USE_DIRECTUS=true` 构建包 PC/Mobile 新闻页面视觉一致。
- [x] 旧链接 `/mintNews/detail/1` 可达。
- [x] 新链接 `/mintNews/detail/news-1` 可达。
- [x] id=48 / 1 / 11 / 19 / 30 样例通过，其中 id=1 需确认视频可播放且 poster 缩略图显示。
- [x] id=32 灰度回归：列表缩略图正常，详情页标题下方不再重复显示同标题摘要行。
- [x] 新建 `legacy_id=null` 新闻后，首页/列表链接使用 slug 并可进入详情。
- [x] 已发布历史新闻改为 draft 或删除后，Directus 模式详情不再 fallback 展示旧静态 JSON。
- [x] Directus 后台流程：新闻新增、编辑、删除/归档、草稿保存、发布后前端展示/隐藏链路验证通过。
- [x] 正式切流当天保留上一版站点目录/上一版 dist 的短期应急回滚包。
- [ ] 切流稳定后清理旧静态 JSON、旧资源、fallback 逻辑和 `VUE_APP_USE_DIRECTUS=false` 开关。

