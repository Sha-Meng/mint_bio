# 官网新闻数据结构

> 数据文件位于 `public/data/`，运行时按 `/data/*` 访问

## 新闻列表 `news_list.json`

### 用途

- 新闻列表页的数据来源
- 首页新闻预览（取前 6 条）

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | number | ✓ | 唯一 id，对应详情文件名 `news_{id}.json` |
| `title` | string | ✓ | 列表/卡片标题 |
| `time` | string | ✓ | 展示用时间字符串 |
| `pic` | string | ✓ | 图片路径（指向 `src/`，如 `assets/News/202505/news_1.png`） |
| `category` | string | | 分类 key（`production/runtime/vision/manufacture`） |
| `categorylabel` | string | | UI 展示标签文本（如 `#MiNT 进行时`） |
| `categorycolor` | string | | UI 标签颜色（hex） |
| `overviewtitle` | string | | 列表页顶部预览区标题 |
| `overviewcontent` | string | | 列表页顶部预览区简介 |

### 关键约束

- `pic` 路径通过 `getImageUrl(picPath)` 解析，必须映射到 `src/` 下真实文件
- `category` 缺失时仍会出现在"全部"，但不会被分类筛选命中

## 新闻详情 `news_{id}.json`

### 顶层字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | number | ✓ | 必须与文件名一致 |
| `title` | string | ✓ | 详情标题 |
| `time` | string | | 展示用时间 |
| `pic` | string | | 详情内图片 |
| `coverPic` | string | | 详情封面 |
| `categorylabel` | string | | 标签 |
| `categorycolor` | string | | 标签色 |
| `overviewtitle` | string | | 详情页大标题区域展示 |
| `overviewcontent` | string | | 详情页摘要（纯文本） |
| `abstract` | string | | 详情页 overview 区块（纯文本） |
| `sections` | array | | 分段内容数组 |

### `sections[]` 结构

每个 section 由 `MiNTNewsDetailSection.vue` 渲染：

| 字段 | 类型 | 说明 |
|------|------|------|
| `headPic` | string[] | 段落头部图片数组 |
| `footerPic` | string[] | 段落尾部图片数组 |
| `contents` | array | 段落正文内容数组 |

### `contents[]` 内容形态

| 类型 | 字段 | 渲染方式 |
|------|------|----------|
| 图片 | `{ "pic": "assets/News/..." }` | `<img>` |
| 无 padding 图片 | `{ "nopaddingpic": "assets/News/..." }` | `<img>` 无边距 |
| 文本 | `{ "desc": "..." }` | `<span>` |
| 富文本强调 | `{ "strongText": "<span class='orange-text'>...</span>" }` | `v-html` |
| 视频 | `{ "video": "/video/News/...", "poster": "assets/News/..." }` | `<video>` |

**视频说明**：
- `poster` 走 `getImageUrl()`
- `video` 直接作为 URL 使用（不走 `getVideoUrl()`）

> **注意**：数据中可能存在 `height` 等字段，但当前渲染组件未使用
