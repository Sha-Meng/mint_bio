# mint_bio 项目文档

> 元素驱动（MiNT BiO）企业官网 - Vue 3 项目文档
>
> 目标：帮助后续开发者快速理解工程结构、实现方式与业务扩展配置。

## 快速开始

```bash
# 安装依赖
yarn install

# 本地开发（自动打开浏览器）
yarn serve

# 生产构建
yarn build
```

## 项目概述

这是一个基于 **Vue 3 + Vue Router 4 + Element Plus** 的企业官网项目，采用 **PC端 + 移动端双版本** 架构，通过屏幕宽度自动切换。

### 核心特性

- **双端适配**：PC 和移动端使用独立组件，`< 992px` 判定为移动端
- **静态数据驱动**：新闻等内容通过 JSON 文件管理
- **响应式设计**：使用 `postcss-pxtorem` 实现 px 到 rem 自动转换
- **滚动动画**：自定义 `v-intersect` 指令实现元素进入视口触发动画

## 文档导航

### 架构与工程化

| 文档 | 说明 |
|------|------|
| [技术栈总览](./architecture/stack.md) | 技术选型、目录结构、运行时架构 |
| [构建与配置](./architecture/build-and-config.md) | `vue.config.js`、PostCSS、开发代理 |
| [资源管理](./architecture/resource-management.md) | `public/` vs `src/`、图片/字体/视频/数据 |

### 页面与路由


| 文档 | 说明 |
|------|------|
| [路由地图](./pages/route-map.md) | PC/移动端分流策略、路由表 |
| [页面索引](./pages/index.md) | 所有页面的功能导航入口 |
| [全局布局](./pages/global-layout.md) | Header/Footer/Contact 公共组件 |

#### 业务页面

| 页面 | 路由 | 文档 |
|------|------|------|
| 首页 | `/` `/home` | [home.md](./pages/home.md) |
| 生物智造 | `/bioIntelligent` | [bio-intelligent.md](./pages/bio-intelligent.md) |
| 企业介绍 | `/corporate` | [corporate-vision.md](./pages/corporate-vision.md) |
| 愿景与责任 | `/vision` | [vision.md](./pages/vision.md) |
| 生物降解新材料 | `/material` | [new-material.md](./pages/new-material.md) |
| 生物合成氨基酸 | `/aminoAcid` | [amino-acid.md](./pages/amino-acid.md) |
| 节豆日粮方案 | `/knotWeed` | [knotweed.md](./pages/knotweed.md) |
| 发展动态 | `/mintNews` | [mint-news.md](./pages/mint-news.md) |

### 业务模块：官网新闻

| 文档 | 说明 |
|------|------|
| [模块总览](./modules/news/overview.md) | 新闻模块实现架构、组件分层、数据流 |
| [数据结构](./modules/news/data-schema.md) | `news_list.json` 与 `news_{id}.json` 字段说明 |
| [扩展手册](./modules/news/how-to-add.md) | 新增新闻、新增分类、常见问题排查 |

## 关键文件索引

| 类别 | 文件路径 | 说明 |
|------|----------|------|
| 应用入口 | `src/main.js` | Vue 应用创建与插件注册 |
| 根组件 | `src/App.vue` | PC/移动端布局切换 |
| 路由配置 | `src/router/index.js` | 双端路由表定义 |
| 端判断 | `src/utils/isPc.js` | `validPcOrPhone()` / `autoFont()` |
| 自定义指令 | `src/utils/directives/intersect.js` | `v-intersect` 滚动触发 |
| 资源工具 | `src/utils/index.js` | `getImageUrl()` / `getVideoUrl()` |
| 事件总线 | `src/event/event.js` | mitt 实例，用于组件通信 |
| 全局样式 | `src/style/variable.less` | 颜色变量、通用样式 |
| 新闻数据 | `public/data/news_*.json` | 新闻列表与详情数据 |

## 备注

- `news-editor/` 目录为已废弃的编辑器工具，文档中不涉及
- `dist/` 为构建产物目录，不作为源码阅读入口
