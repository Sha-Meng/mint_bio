# 官网新闻模块总览

## 概述

新闻模块采用"配置驱动 + 静态数据文件"模式：
- **列表数据**：`/data/news_list.json`
- **详情数据**：`/data/news_{id}.json`
- **图片资源**：`src/assets/News/**`（通过 `getImageUrl()` 动态解析）

## 路由入口

| 页面 | 路由 | PC 组件 | 移动端组件 |
|------|------|---------|------------|
| 列表 | `/mintNews` | `pages/MiNTNews/MiNTNews.vue` | `pages/MiNTNewsMobile/MiNTNewsMobile.vue` |
| 详情 | `/mintNews/detail/:configId` | `pages/MiNTNews/MiNTNewsDetail.vue` | `pages/MiNTNewsMobile/MiNTNewsDetailMobile.vue` |

## 组件分层

### 列表页容器

| 组件 | 说明 |
|------|------|
| `components/MiNTNews/MiNTNewsTop.vue` | PC 顶部 Banner 区 |
| `components/MiNTNews/MiNTNewsList.vue` | PC 新闻列表（含分类筛选 + 置顶预览区） |
| `components/MiNTNews/MiNTNewsListMobile.vue` | 移动端新闻列表（含分类筛选） |

### 列表渲染

| 组件 | 说明 |
|------|------|
| `MiNTNewsListPreview.vue` | 网格/列表容器（hover 放大） |
| `NewsCardPreview.vue` | 新闻卡片（图片 + 标签 + 时间 + 标题） |
| `MiNTNewsOverview.vue` | 列表页顶部"大卡预览" |

### 详情页渲染

| 组件 | 说明 |
|------|------|
| `MiNTNewsDetailCom.vue` | 详情主体布局（标题/摘要/封面图/sections） |
| `MiNTNewsDetailSection.vue` | 分段渲染（headPic/footerPic + contents） |

## 数据流

### 列表页

```
MiNTNewsList / MiNTNewsListMobile
    ↓
axios.get('/data/news_list.json')
    ↓
分类筛选：news.category === selectedOption
    ↓
渲染 NewsCardPreview
```

### 详情页

```
MiNTNewsDetail / MiNTNewsDetailMobile
    ↓
从路由参数取 configId
    ↓
axios.get(`/data/news_${configId}.json`)
    ↓
渲染 MiNTNewsDetailCom → MiNTNewsDetailSection
    ↓
同时拉取 news_list.json 用于"更多动态"
```

## 分类机制

列表组件中分类选项为硬编码：

| category 值 | 标签文本 |
|-------------|----------|
| `production` | #MiNT产品力 |
| `runtime` | #MiNT进行时 |
| `vision` | #MiNT Vision |
| `manufacture` | #MiNT智造力 |

**筛选逻辑**：
- 有 `category` 字段：可被对应分类筛选
- 无 `category` 字段：只出现在"全部"

## 相关文档

- [数据结构](./data-schema.md)
- [扩展手册](./how-to-add.md)
