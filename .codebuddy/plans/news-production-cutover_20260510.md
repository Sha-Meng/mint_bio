name: News Directus Production Cutover Plan
phase: Phase 7/8 - 前端切流与最终回归
date: 2026-05-10
status: draft - proxy/CDN and P0 code fixes done, waiting for full regression

## overview

本文件记录 mint_bio 新闻模块从旧静态 JSON 切到 Directus 数据源的生产部署方案。目标是在不改变现有页面表现的前提下，通过 `VUE_APP_USE_DIRECTUS=true` 开关灰度；生产优先采用主站同源代理 `/directus-api`，避免浏览器跨域 CORS，并为 Directus 图片补 CDN 缓存。

## Current Confirmed State

- Directus 后台：`https://cms.mint-bio.cn` → 宝塔 Nginx → `127.0.0.1:8055`。
- Directus Public Policy：`news_articles` / `news_categories` / `directus_files` 已开放只读，匿名 REST 返回 200。
- 本地 Directus 模式重点页面已由用户确认。
- 前端默认仍为 `VUE_APP_USE_DIRECTUS=false`，不影响当前生产。
- `src/api/news.js` 默认 Directus API/Asset 前缀为 `/directus-api`。

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

## Cutover Steps

1. 服务器侧新增 `/directus-api` 同源代理。
2. 验证主站域名下可匿名访问：
   ```text
   https://www.mint-bio.cn/directus-api/items/news_articles?limit=1&fields=legacy_id,slug,title_zh,status
   https://www.mint-bio.cn/directus-api/assets/<uuid>?width=800&format=webp
   ```
3. 配置 Directus 图片 CDN 缓存，并验证 CDN 命中。
4. 本地执行：
   ```pwsh
   npm run build
   node scripts/audit-news-migration.mjs
   ```
5. 使用 `VUE_APP_USE_DIRECTUS=true` 构建测试包。
6. 部署到测试/灰度环境。
7. 按 Phase 8 清单做 PC + Mobile 视觉回归。
8. 观察 48h。
9. 生产切流。

## Rollback

若灰度或生产异常：

1. 重新构建：
   ```env
   VUE_APP_USE_DIRECTUS=false
   ```
2. 部署旧静态 JSON 数据源版本。
3. 保留 Directus 数据，不删除；问题修复后可再次切换。

## Acceptance Checklist

- [ ] `/directus-api/items/news_articles` 主站同源返回 200。
- [ ] `/directus-api/items/news_categories` 主站同源返回 200。
- [ ] `/directus-api/assets/<uuid>?width=800&format=webp` 主站同源返回 200。
- [ ] Directus 图片响应头命中 CDN 或至少具备可缓存策略。
- [ ] `VUE_APP_USE_DIRECTUS=true` 构建包 PC/Mobile 新闻页面视觉一致。
- [ ] 旧链接 `/mintNews/detail/1` 可达。
- [ ] 新链接 `/mintNews/detail/news-1` 可达。
- [ ] id=48 / 1 / 11 / 19 / 30 样例通过，其中 id=1 需确认视频可播放且 poster 缩略图显示。
- [ ] id=32 灰度回归：列表缩略图正常，详情页标题下方不再重复显示同标题摘要行。
- [ ] Directus 后台流程：新闻新增、编辑、删除/归档、草稿保存、发布后前端展示/隐藏链路验证通过。


- [ ] `VUE_APP_USE_DIRECTUS=false` 回滚包验证通过。

