# 资源管理

## `public/` vs `src/` 资源约定

### `public/` - 运行时原样访问

**特点**：
- 构建时原样拷贝到 `dist/` 对应路径
- 访问路径稳定，如 `public/data/news_list.json` → `/data/news_list.json`
- 适合：运行时需要直接拉取的 JSON、reset 样式、favicon 等

**本项目使用**：
- 新闻数据：`public/data/news_list.json`、`public/data/news_{id}.json`
- 样式重置：`public/reset.css`

### `src/` - 经打包器处理

**特点**：
- 资源被 webpack 处理并输出到 `dist/static/*`
- 默认带 hash（便于缓存控制）
- 适合：页面/组件中引用的图片、字体等

**本项目使用**：
- 图片：`src/assets/**`（新闻图片在 `src/assets/News/**`）
- 字体：`src/assets/font/*`，在 `src/main.js` 中引入 `@/assets/font/font.css`

## 图片引用方式

### 方式 A：组件内直接引用

```javascript
// 适用于路径固定、编译期可确定的资源
require('@/assets/images/home-title.png')
```

### 方式 B：通过 `getImageUrl()` 动态解析

```javascript
// src/utils/index.js
export const getImageUrl = (picPath) => {
  return require(`@/${picPath}`)
}
```

**适用场景**：图片路径来自 JSON 配置（如新闻数据）

**重要约束**：
- `picPath` 必须能映射到 `src/` 下的真实文件
- 示例：`assets/News/202505/news_1.png` → `src/assets/News/202505/news_1.png`
- 新增图片资源后需要重新构建部署（否则产物中没有对应 hash 资源）

## 视频资源

项目中存在两种引用方式：

### 1. 打包型视频

通过 `require/import` 引入，走 `vue.config.js` 的 `file-loader` 规则，输出到 `static/video/`。

### 2. URL 型视频

新闻详情中 `contents[].video` 字段直接使用 URL（如 `/video/News/202505/xxx.mov`），渲染时作为 `<source :src="content.video">` 使用。

> **注意**：仓库内未发现 `public/video/**` 目录；如需播放视频，需确认视频由 CDN/服务器静态目录提供，或改造为打包型资源。

## 静态数据（新闻为例）

数据文件放在 `public/data/`，运行时通过 axios 拉取：

```javascript
axios.get('/data/news_list.json')      // 新闻列表
axios.get(`/data/news_${id}.json`)     // 新闻详情
```

**优点**：部署后可通过替换 JSON 更新内容

**注意**：若 JSON 中引用了新图片，仍需重新构建前端以包含该图片资源
