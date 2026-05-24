# 部署、服务器、宝塔、域名与 CDN

> 面向运维、开发和后续部署人员。本文只记录当前已确认的配置边界和维护关注点，不保存真实密码或密钥。

## 1. 当前生产链路

```text
用户浏览器
  ↓
域名 DNS / CDN
  ↓
宝塔 Nginx
  ↓
Vue 静态站 dist/
  ├─ /api/contact/submit → 联系表单后端
  ├─ /directus-api/* → Directus REST / Assets
  └─ /video/* → 静态视频资源
```

新闻 CMS 链路：

```text
https://cms.mint-bio.cn
  ↓ DNS
101.200.45.52
  ↓ 宝塔 Nginx
127.0.0.1:8055
  ↓
Directus 11.17.4
```

## 2. 关键域名

| 域名 / 路径 | 用途 |
|---|---|
| `https://www.mint-bio.cn` | 官网主入口，实际 DNS / CDN 配置以阿里云控制台为准。 |
| `https://mint-bio.cn` | 根域入口，是否跳转到 `www` 以当前 Nginx / CDN 配置为准。 |
| `https://cms.mint-bio.cn` | Directus 后台入口。 |
| `/directus-api` | 官网同源访问 Directus 的代理路径。 |
| `/video` | 新闻历史视频或静态视频资源路径。 |

## 3. 本地开发代理

配置文件：`vue.config.js`

```js
proxy: {
  '/api': {
    target: 'http://101.200.45.52:8080',
    changeOrigin: true,
  },
  '/directus-api': {
    target: 'https://cms.mint-bio.cn',
    changeOrigin: true,
    pathRewrite: { '^/directus-api': '' },
  },
  '/video': {
    target: 'http://www.mint-bio.cn',
    changeOrigin: true,
  }
}
```

说明：

- `/api`：联系表单等后端接口。
- `/directus-api`：Directus API 和 assets。
- `/video`：静态视频资源。

## 4. 前端构建部署

常规流程：

```bash
yarn install
yarn build
```

部署对象：

```text
dist/
```

注意：

- 修改前端代码、`src/i18n/` fallback、`src/utils/language.js`、页面组件后，需要重新构建部署。
- Directus 新闻内容变更不需要重新构建前端。
- Directus `site_i18n_entries` 固定文案变更不需要重新构建前端；保存后更新 `site_i18n_settings.content_version`。
- 开启或关闭英文入口通过 `site_i18n_settings.feature_en_enabled` 配置，不需要重新构建前端。

## 5. 宝塔关注点

宝塔主要负责：

- 站点管理。
- Nginx 配置。
- SSL 证书。
- 反向代理。
- MySQL 管理。
- 目录权限辅助检查。
- 备份任务。

变更前建议：

1. 备份当前站点配置。
2. 备份当前前端 `dist/` 或站点目录。
3. 备份 Directus 数据库。
4. 备份 Directus 上传目录。
5. 记录变更时间、操作人、回滚方式。

## 6. Nginx / 反代关注点

主站需要保证：

- Vue Hash 路由正常访问。
- `/directus-api` 能反代到 Directus。
- `/directus-api/assets/*` 能访问 Directus 文件。
- `/video/*` 能访问静态视频资源。
- 联系表单 `/api/contact/submit` 能到达后端。

Directus 管理域需要保证：

- `cms.mint-bio.cn` 访问正常。
- HTTPS 证书有效。
- 反代到 `127.0.0.1:8055`。
- 上传大图时超时配置足够。

## 7. Directus 服务边界

当前确认：

- Directus 版本：`11.17.4`。
- 管理入口：`https://cms.mint-bio.cn`。
- 内部端口：`127.0.0.1:8055`。
- 主要集合：`news_articles`、`news_categories`、`directus_files`、`site_i18n_entries`、`site_i18n_settings`。

推荐目录边界：

| 类型 | 推荐路径 | 说明 |
|---|---|---|
| Directus 服务目录 | `/srv/mintbio/directus/` | 服务配置和运行文件。 |
| 上传目录 | `/data/mintbio/directus/uploads/` | 媒体文件，不能放入前端发布目录。 |
| 备份目录 | `/data/backup/mintbio/directus/` | 数据库和上传文件备份。 |
| 前端站点目录 | 宝塔站点目录 | 只放构建产物或站点文件。 |

实际路径以服务器当前配置为准。若与推荐路径不同，应在本文件后续维护记录中补充。

## 8. CDN / DNS 关注点

CDN 需要关注：

- `www.mint-bio.cn` 和 `mint-bio.cn` 的解析状态。
- 回源地址和回源 Host。
- HTTPS 证书。
- 静态资源缓存策略。
- HTML 短缓存策略。
- Directus assets 缓存策略。
- 发布后是否需要刷新缓存。

建议缓存策略：

| 类型 | 建议 |
|---|---|
| JS / CSS / 图片 / 字体 | 长缓存，文件名带 hash 时较安全。 |
| HTML | 短缓存，避免发布后长时间不更新。 |
| Directus assets | 可长缓存，但替换图片后要注意刷新。 |
| 新闻 API JSON | 不建议 CDN 长缓存，前端已有 30 秒 sessionStorage 短缓存。 |
| 固定文案 API JSON | 不建议 CDN 长缓存，前端通过 `site_i18n_settings.content_version` 和 localStorage 缓存控制刷新。 |

## 9. 备份与回滚

### 前端回滚

至少保留：

- 上一版 `dist/`。
- 当前 Nginx 站点配置。
- 发布记录。

回滚方式：

1. 将站点目录切回上一版 `dist/`。
2. 检查首页、新闻列表、新闻详情。
3. 如涉及 CDN，刷新 HTML 和入口资源。

### Directus 回滚

至少备份：

- Directus 数据库。
- Directus 上传目录。
- Directus 配置文件 / 环境变量。

误改新闻内容优先使用 Directus Activity / Revisions 恢复，不要直接还原整库。

### CDN 回滚

如发布后资源异常：

1. 确认源站文件是否正确。
2. 刷新 CDN 缓存。
3. 如回源配置错误，恢复上一版回源配置。

## 10. 常见故障排查

### 官网新闻不更新

检查：

- Directus 文章是否 `published`。
- 前端 30 秒短缓存是否过期。
- `/directus-api/items/news_articles` 是否正常。
- CDN 是否缓存异常响应。

### Directus 后台打不开

检查：

- `cms.mint-bio.cn` DNS。
- 宝塔站点状态。
- SSL 证书。
- Directus 服务是否运行。
- 反代到 `127.0.0.1:8055` 是否正常。

### 图片不显示

检查：

- Directus 文件是否存在。
- `/directus-api/assets/<uuid>` 是否可访问。
- CDN 是否缓存了 404。
- 上传目录权限是否正常。

### 联系表单失败

检查：

- 前端请求 `/api/contact/submit`。
- 本地代理或生产 Nginx 是否转发到后端。
- 后端服务是否运行。
- 浏览器控制台和 Nginx 日志。

### 英文入口误开启或无效

检查：

- Directus `site_i18n_settings.feature_en_enabled`。
- 是否已更新 `site_i18n_settings.content_version`。
- `/directus-api/items/site_i18n_settings` 是否可读取。
- Header / MobileHeader 语言入口是否显示。
- `?lang=en` 和 `localStorage.language`。

## 11. 配置变更记录建议

每次改动服务器、宝塔、Nginx、Directus、CDN、DNS 时，建议记录：

| 字段 | 说明 |
|---|---|
| 时间 | 操作时间。 |
| 操作人 | 谁改的。 |
| 变更内容 | 改了什么。 |
| 影响范围 | 官网、CMS、图片、接口等。 |
| 验证结果 | 如何确认成功。 |
| 回滚方式 | 出问题怎么恢复。 |
