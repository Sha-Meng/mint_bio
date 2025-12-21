# 发展动态（新闻）

**路由**：
- 列表页：`/mintNews`
- 详情页：`/mintNews/detail/:configId`

## 页面入口

| 页面 | PC | 移动端 |
|------|-----|--------|
| 列表 | `pages/MiNTNews/MiNTNews.vue` | `pages/MiNTNewsMobile/MiNTNewsMobile.vue` |
| 详情 | `pages/MiNTNews/MiNTNewsDetail.vue` | `pages/MiNTNewsMobile/MiNTNewsDetailMobile.vue` |

## 列表页结构

| 端 | 组件 |
|----|------|
| PC | `MiNTNewsTop`（Banner）+ `MiNTNewsList`（分类筛选 & 列表） |
| 移动端 | `BannerTitle` + `MiNTNewsListMobile` |

**数据来源**：`/data/news_list.json`

## 详情页结构

- 根据 `configId` 拉取：`/data/news_{configId}.json`
- 下方"更多动态"：复用 `news_list.json` 作为推荐列表

## 常见改动点

| 需求 | 修改位置 |
|------|----------|
| 分类筛选项 | `MiNTNewsList.vue` / `MiNTNewsListMobile.vue` 的 `options` |
| 详情内容渲染 | `MiNTNewsDetailSection.vue`（支持 `pic/nopaddingpic/desc/strongText/video`） |

## 相关文档

详细的新闻模块实现与扩展说明：

- [模块总览](../modules/news/overview.md)
- [数据结构](../modules/news/data-schema.md)
- [扩展手册](../modules/news/how-to-add.md)
