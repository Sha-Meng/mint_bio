# 技术总览

> 面向运维、开发和后续接手工程师。

## 1. 项目概述

`mint_bio` 是元素驱动官网前端项目，当前主要形态为 Vue 静态站，新闻内容通过自建 Directus 后台动态维护。

当前关键状态：

- 前端仍是 Vue 官网。
- 新闻模块已切换为 Directus 单一数据源。
- 固定文案已切换为 Directus 运行时配置，日常修改不需要重新构建前端。
- 英文入口由 Directus `site_i18n_settings.feature_en_enabled` 控制，当前建议保持关闭。
- PC 和移动端使用不同页面/组件。

## 2. 技术栈

| 类型 | 技术 |
|---|---|
| 前端框架 | Vue 3 |
| 兼容层 | `@vue/compat` |
| 路由 | Vue Router 4，Hash 模式 |
| UI 组件 | Element Plus |
| HTTP | Axios |
| 动画 | animate.css、自定义 `v-intersect` |
| 轮播 | Swiper |
| 样式 | Less / Sass |
| 构建 | Vue CLI |
| CMS | Directus 11.17.4 |

## 3. 常用命令

```bash
yarn install
yarn serve
yarn build
yarn lint
```

说明：

- `yarn serve`：本地开发。
- `yarn build`：生产构建，产物在 `dist/`。
- `yarn lint`：ESLint 检查。

## 4. 主要目录

| 路径 | 说明 |
|---|---|
| `src/pages/` | 页面级组件，PC / Mobile 分开。 |
| `src/components/` | 公共组件和业务组件。 |
| `src/router/index.js` | 路由定义和 PC / Mobile 分流。 |
| `src/api/news.js` | Directus 新闻读取和数据映射。 |
| `src/api/siteI18n.js` | Directus 固定文案和语言配置读取。 |
| `src/i18n/` | 本地中英文紧急 fallback。 |
| `src/utils/language.js` | i18n 状态、运行时文案合并、英文开关、语言切换。 |
| `src/utils/colorShortcode.js` | 新闻颜色短代码解析。 |
| `src/utils/isPc.js` | PC / Mobile 判断和 rem 适配。 |
| `public/` | 静态公共资源。当前不再保存新闻 JSON。 |
| `doc/` | 当前交接文档。 |

## 5. 页面功能范围

| 页面 | 路由 | 说明 |
|---|---|---|
| 首页 | `/`、`/home` | 品牌展示、核心能力、产品/案例、新闻预览。 |
| 生物智造 | `/bioIntelligent` | 生物智造能力介绍。 |
| 企业介绍 | `/corporate` | 公司介绍、时间线、荣誉等。 |
| 愿景与责任 | `/vision` | 愿景、责任、可持续相关内容。 |
| 生物降解新材料 | `/material` | 产品线和材料介绍。 |
| 生物合成氨基酸 | `/aminoAcid` | 氨基酸产品介绍。 |
| 节豆日粮方案 | `/knotWeed` | 节豆日粮解决方案。 |
| 发展动态 | `/mintNews` | 新闻列表，读取 Directus。 |
| 新闻详情 | `/mintNews/detail/:configId` | 新闻详情，支持 `slug` 和旧 `legacy_id`。 |

## 6. 运行时链路

```text
用户浏览器
  ↓
CDN / DNS
  ↓
宝塔 Nginx
  ↓
Vue 静态站 dist/
  ↓
/directus-api
  ↓
Directus REST
  ↓
news_articles / news_categories / directus_files / site_i18n_entries / site_i18n_settings
```

## 7. 新闻系统现状

当前新闻数据由 `src/api/news.js` 读取 Directus：

- 列表：`/items/news_articles`
- 分类：`/items/news_categories`
- 过滤：只展示 `status=published`
- 排序：`featured` 优先，其次 `publish_at` 倒序

已废弃：

- `public/data/news_list.json`
- `public/data/news_*.json`
- 旧新闻图片仓库资源维护流程
- 静态 JSON fallback
- `VUE_APP_USE_DIRECTUS` 双轨开关

## 8. 中英文现状

- 固定文案：优先读取 Directus `site_i18n_entries`，本地 `src/i18n/*.json` 仅作为前端紧急 fallback。
- 新闻内容：Directus `news_articles` 的 `_zh` / `_en` 字段。
- 英文入口：由 Directus `site_i18n_settings.feature_en_enabled` 控制。
- 固定文案和新闻英文字段为空时，前端回退中文。
- 新闻分类中英文切换当前不纳入固定文案配置。

## 9. 交接注意事项

- 不要把新闻维护流程改回静态 JSON。
- 不要把真实密码、Token、私钥提交到仓库。
- 不要自行补译英文内容。
- Directus schema、角色、Nginx、CDN 配置变更前应先备份并记录。
