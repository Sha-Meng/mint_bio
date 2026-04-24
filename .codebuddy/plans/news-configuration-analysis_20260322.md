name: 新闻配置与更新机制现状分析

overview:
- 目标：深度梳理当前项目新闻模块的配置方式、更新链路、依赖关系、已知问题与改进方向。
- 范围：`src/pages/MiNTNews*`、`src/components/MiNTNews/*`、`public/data/news*.json`、`src/assets/News/*`、路由、首页复用、文档说明。
- 输出：现状总结、问题分析、改进方案、验证依据。

todos:
- [x] 梳理新闻模块入口与配置位置
- [x] 追踪新闻内容更新链路
- [x] 总结现状与问题分析
- [x] 输出改进方案与分析文档


## User Requirements
- 按 spec 范式深度分析当前项目的新闻配置与更新方式。
- 形成现状总结与问题分析。
- 给出可落地的改进方案。

## Product Overview
- 当前新闻模块承担官网新闻列表、详情页与首页新闻预览展示。
- 数据源看起来为前端仓库维护的静态内容，而非独立后台系统。

## Core Features
- 新闻列表展示
- 新闻详情展示
- 首页新闻预览复用
- PC / 移动端双端页面

## Tech Stack Selection
- Vue 3 单页应用
- Vue Router
- Axios 访问静态 JSON
- `public/` 静态数据 + `src/assets/` 打包图片资源

## Implementation Approach
- 先检索代码与文档，定位新闻页面、组件、路由和数据文件。
- 再核对 JSON 结构与页面消费字段，梳理更新链路。
- 结合脚本统计补充结构完整性、字段缺失与依赖风险。
- 最后输出分析报告与改进建议。

## Implementation Notes
- 当前为分析任务，优先保持只读；仅新增 spec 与分析产物。
- 结论必须基于仓库实现和文档，不凭经验推断。

## Architecture Design
- 展示层：`src/pages/MiNTNews*` 与 `src/components/MiNTNews/*`
- 数据层：`public/data/news_list.json`、`public/data/news_{id}.json`
- 资源层：`src/assets/News/*`
- 路由/入口层：`src/router/index.js`、`src/main.js`、`src/App.vue`
- 复用层：首页、头部、底部导航、语言系统

## Directory Structure
- `src/pages/MiNTNews/`
- `src/pages/MiNTNewsMobile/`
- `src/components/MiNTNews/`
- `public/data/`
- `src/assets/News/`
- `doc/modules/news/`

## Key Code Structures
- 新闻列表通过 `news_list.json` 加载与筛选。
- 新闻详情通过 `news_{id}.json` 加载内容。
- 首页新闻模块复用同一列表数据。
- 图片路径通过工具函数动态映射到打包资源。

## Validation / Acceptance
- 已确认新闻数据来源为 `public/data/news_list.json` 与 `public/data/news_{id}.json`，图片来自 `src/assets/News/*`。
- 已确认首页、新闻列表、新闻详情共用同一列表数据源；首页固定取前 6 条，详情页会再次拉取整份列表作为“更多动态”。
- 已确认分类筛选与高亮逻辑硬编码在 `MiNTNewsList.vue` 与 `MiNTNewsListMobile.vue`。
- 已确认国际化只覆盖部分 UI，新闻内容本身不按语言切换，且 `en-US.json` 中 `news` 段仍为中文。
- 已通过脚本统计得到当前数据风险：37 条列表、37 个详情文件；缺失 `category` 的列表项有 5 条（37、36、35、34、21）；缺失 `overviewcontent` 的列表项有 36 条；详情文件存在 3 处 `文件名 != 内部 id`（`news_13.json`、`news_14.json`、`news_18.json`）。
- 已形成现状总结、问题分析与分层改进建议，并输出独立分析文档供审阅。

