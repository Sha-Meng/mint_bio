# 官网新闻扩展手册

## A. 新增新闻（常见流程）

### 1. 选择新的 `id`

- `id` 必须是数字，与详情文件名一致：`news_{id}.json`
- 建议保持递增，`news_list.json` 中按时间倒序排列（新内容在前）

### 2. 修改列表数据 `public/data/news_list.json`

新增一条对象，核心字段：

```json
{
  "id": 38,
  "title": "新闻标题",
  "time": "2025-01",
  "pic": "assets/News/202501/news_38.png",
  "category": "runtime",
  "categorylabel": "#MiNT 进行时",
  "categorycolor": "#FF7200"
}
```

可选字段：`overviewtitle` / `overviewcontent`（用于列表页顶部预览）

### 3. 新增详情数据 `public/data/news_{id}.json`

顶层建议至少包含：

```json
{
  "id": 38,
  "title": "新闻标题",
  "time": "2025-01",
  "categorylabel": "#MiNT 进行时",
  "categorycolor": "#FF7200",
  "overviewtitle": "详情页大标题",
  "sections": [...]
}
```

### 4. 内容组织建议

| 类型 | 字段 | 示例 |
|------|------|------|
| 纯文本 | `desc` | `{ "desc": "这是一段文字" }` |
| 强调文本 | `strongText` | `{ "strongText": "<span class='orange-text'>重点</span>" }` |
| 图片 | `pic` | `{ "pic": "assets/News/202501/img1.png" }` |
| 无边距图片 | `nopaddingpic` | `{ "nopaddingpic": "assets/News/202501/img2.png" }` |
| 视频 | `video` + `poster` | `{ "video": "/video/News/202501/v1.mp4", "poster": "assets/News/202501/poster.png" }` |

支持的强调样式类：`.orange-text` / `.blue-text` / `.green-text`

### 5. 准备图片资源

- 将图片放入 `src/assets/News/<年月>/`（如 `202501/`）
- JSON 中使用相对 `src/` 的路径：`assets/News/202501/news38_pic_1.jpg`

> **重要**：新增图片后需要重新 `yarn build` 并部署，否则线上找不到资源

### 6. 验证

- 列表页 `/mintNews` 是否正常展示卡片图
- 详情页 `/mintNews/detail/{id}` 是否正常加载并渲染

## B. 新增新闻分类（偶发）

分类由两部分决定：

1. **数据层**：`news_list.json` 条目的 `category` 字段
2. **UI 层**：列表组件的分类选项（硬编码）

### 需要修改的位置

| 文件 | 修改内容 |
|------|----------|
| `components/MiNTNews/MiNTNewsList.vue` | `options` 数组新增 `{ value, label }` |
| `components/MiNTNews/MiNTNewsListMobile.vue` | 同上 |

### 数据侧配合

- 对应新闻条目设置 `category: "<newCategory>"`
- 同时设置 `categorylabel` 与 `categorycolor` 保证 UI 一致

## C. 常见问题排查

| 问题 | 排查点 |
|------|--------|
| 列表能看到但分类筛不到 | 检查 `news_list.json` 条目是否缺少 `category` |
| 图片不显示 | 检查路径是否以 `assets/...` 开头且文件存在；注意大小写（Linux 敏感） |
| 详情页 404 或空白 | 检查是否存在 `public/data/news_{id}.json` |
| 视频不播放 | 确认服务器/CDN 提供 `/video/...` 静态文件 |

> **提示**：新增图片后必须重新构建部署前端产物
