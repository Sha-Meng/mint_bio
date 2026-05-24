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
| CMS | Directus 11.14.1，实际以服务器当前容器为准 |

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

完整开发环境和本地代理配置见下一节。

## 4. 开发环境完整还原流程

### 4.1 基础要求

| 项目 | 要求 |
|---|---|
| Node.js | 推荐 `24.x LTS`。当前交接机器验证版本为 `v24.12.0`。 |
| 包管理器 | Yarn Classic `1.22.x`。当前交接机器验证版本为 `1.22.22`。 |
| npm | 随 Node.js 安装即可，不作为本项目日常包管理器。 |
| Git | 能正常 clone / pull 本仓库。 |
| 网络 | 安装依赖时需要访问 npm registry；本地开发时 `/directus-api` 会代理到 `https://cms.mint-bio.cn`。 |

项目当前没有 `.nvmrc`、`engines` 或 Volta 配置文件，因此版本要求以本文档为准。后续如新增版本约束文件，应同步更新本文档。

### 4.2 从零配置步骤

1. 安装 Node.js `24.x LTS`。
2. 安装或启用 Yarn Classic `1.22.x`。
3. 克隆仓库并进入项目目录。
4. 检查版本：

```bash
node -v
yarn -v
npm -v
```

5. 安装依赖：

```bash
yarn install
```

6. 启动本地开发服务：

```bash
yarn serve
```

7. 生产构建：

```bash
yarn build
```

8. 代码检查和 i18n 审计：

```bash
yarn lint
yarn i18n:audit
```

### 4.3 本地代理完整配置

本地开发代理在 `vue.config.js` 中配置。下面是当前项目可直接使用的完整配置，不是模板：

```js
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer: {
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
      },
    },
  },
  chainWebpack: config => {
    config.resolve.alias.set('vue', '@vue/compat')
    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif|jfif)$/)
      .type('asset/resource')
      .set('generator', {
        filename: 'static/img/[name].[hash:8][ext]',
      })
      .use('image-webpack-loader')
      .loader('image-webpack-loader')
      .options({
        mozjpeg: {
          progressive: true,
          quality: 75,
        },
        optipng: {
          enabled: false,
        },
        pngquant: {
          quality: [0.8, 0.9],
          speed: 4,
        },
        gifsicle: {
          interlaced: false,
        },
        webp: {
          quality: 75,
        },
      })
      .end()
    config.module
      .rule('videos')
      .test(/\.(mp4|webm|ogg|mov|avi|flv|wmv|mkv)$/i)
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'static/video/[name].[hash:8].[ext]',
        esModule: false,
      })
    config.plugin('html').tap(args => {
      args[0].title = '元素驱动: 引领生物制造创新'
      return args
    })
  },
})
```

代理说明：

| 路径 | 目标 | 用途 |
|---|---|---|
| `/api` | `http://101.200.45.52:8080` | 联系表单等后端接口。 |
| `/directus-api` | `https://cms.mint-bio.cn` | Directus REST 和 assets。 |
| `/video` | `http://www.mint-bio.cn` | 静态视频资源。 |

如果本地新闻、固定文案或图片无法加载，优先检查开发服务代理、网络访问和 Directus 后台可用性。

### 4.4 Windows PowerShell 注意事项

如果 PowerShell 提示 `yarn.ps1` 或 `npm.ps1` 被执行策略拦截，可先用 `cmd /c` 执行同等命令：

```bash
cmd /c yarn -v
cmd /c yarn install
cmd /c yarn serve
cmd /c yarn build
```

也可以由本机管理员按公司安全策略调整 PowerShell 执行策略。

## 5. 主要目录

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

## 6. 页面功能范围

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

## 7. 运行时链路

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

## 8. 新闻系统现状

当前新闻数据由 `src/api/news.js` 读取 Directus：

- 列表：`/items/news_articles`
- 分类：`/items/news_categories`
- 过滤：只展示 `status=published`
- 排序：`featured` 优先，其次 `publish_at` 倒序

## 9. 中英文现状

- 固定文案：优先读取 Directus `site_i18n_entries`，本地 `src/i18n/*.json` 仅作为前端紧急 fallback。
- 新闻内容：Directus `news_articles` 的 `_zh` / `_en` 字段。
- 英文入口：由 Directus `site_i18n_settings.feature_en_enabled` 控制。
- 固定文案和新闻英文字段为空时，前端回退中文。
- 新闻分类名称来自 Directus `news_categories.name_zh` / `name_en`，不纳入 `site_i18n_entries` 固定文案配置。

## 10. 交接注意事项

- 不要把新闻维护流程改回静态 JSON。
- 不要把真实密码、Token、私钥提交到仓库。
- 不要自行补译英文内容。
- Directus schema、角色、Nginx、CDN 配置变更前应先备份并记录。
