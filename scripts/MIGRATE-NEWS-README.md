# 历史新闻迁移脚本 · 操作说明

把 `public/data/news_1.json ~ news_48.json` + `news_list.json` 共 48 篇历史新闻批量迁移到 Directus（`https://cms.mint-bio.cn`）。

契约文档：

- `.codebuddy/plans/directus-bt-migration-execution.md`（5.1 / 5.2 / 5.2.1 / 5.2.2 / 6.0）
- `.codebuddy/plans/news-migration-mapping_20260505.md`（48 篇逐条映射 + EditorJS block 类型映射 + 媒体上传规则）

---

## 1. 前置条件

### 1.1 Node 版本

要求 Node 18+（脚本依赖内置 `fetch` / `FormData` / `Blob`）。本机当前版本：

```pwsh
node -v
```

### 1.2 Directus 后台准备（一次性）

- ✅ Phase 4A 媒体库 22 folder 已建好（含 `news/_legacy/`）
- ✅ Phase 4B/5 后台 4 条 `news_categories` 已建好（slug：`mint-runtime` / `mint-products` / `mint-biomanufacturing` / `mint-vision`）
- ✅ Phase 4C-D `news_articles` 集合 + Block Editor 字段已配齐

### 1.3 生成 Static Access Token

1. 浏览器登录 `https://cms.mint-bio.cn/admin/`（用 Admin 账号，**不是** Editor 测试账号）
2. 顶栏头像 → User Directory → 点你自己的 Admin 用户
3. 拉到底部 `Token` 字段 → 右侧"刷新"按钮生成 → 复制 → 立即点上方"Save"保存
4. **Token 仅在生成时可见一次**，Save 后页面只显示掩码，请妥善保存

### 1.4 写 .env.migration

在仓库根的 `scripts/` 下新建 `scripts/.env.migration`（**已被 `.gitignore` 排除**，不会入库）：

```env
DIRECTUS_URL=https://cms.mint-bio.cn
DIRECTUS_TOKEN=<上一步生成的 Static Token>
```

也可以直接 export 环境变量替代该文件：

```pwsh
$env:DIRECTUS_URL = "https://cms.mint-bio.cn"
$env:DIRECTUS_TOKEN = "<token>"
```

---

## 2. 命令

| 场景 | 命令 |
|---|---|
| 全量试运行（不写 Directus，只构建 payload + 报告） | `node scripts/migrate-news-to-directus.mjs --dry-run` |
| 小批次试运行（前 3 篇） | `node scripts/migrate-news-to-directus.mjs --dry-run --limit=3` |
| 单条试运行（id=11，含视频 + nopaddingpic） | `node scripts/migrate-news-to-directus.mjs --dry-run --ids=11` |
| 几条小批量真迁（验证一切正常后） | `node scripts/migrate-news-to-directus.mjs --ids=1,11,45` |
| 全量正式执行 | `node scripts/migrate-news-to-directus.mjs` |
| 全量结构审计（旧 JSON ↔ Directus 已入库数据） | `node scripts/audit-news-migration.mjs` |

> ⚠️ 没有 `--dry-run` 即真实写 Directus。**强烈建议先全量 dry-run 检查无错，再真跑；真跑后必须执行全量结构审计**。


---

## 3. 推荐执行顺序

### Step 1：全量 dry-run

```pwsh
node scripts/migrate-news-to-directus.mjs --dry-run
```

期望输出：

- `[start] dryRun=true ...`
- `[check] Directus 健康检查通过`
- `[folder] news/_legacy = <uuid>`
- `[category] 分类 4 条 OK：mint-runtime, mint-products, mint-biomanufacturing, mint-vision`
- `[source] 待处理 48 篇（总 48 篇）`
- 48 行 `[article] [N/48] legacy_id=X → __dry-run-...（M blocks）`
- 摘要行：`创建: 48 / 跳过: 0 / 失败: 0`、`分类分布: {...}`、`pending_videos: 1`（id=45）

**检查 `scripts/.migration-cache/report-<ts>.json`**，重点：

- `error_log: []`（应为空）
- `category_distribution`（4 类合计 = 48）
- `pending_videos`（应只有 `legacy_id=45`）
- `pending_no_content`（应为 14 篇 id=20-33 等无 sections.headPic 文章；脚本会塞空 paragraph 兜底，不阻塞）
- `total_articles_created: 48`

如有 `error_log` 非空，**先修脚本/数据再继续**。

### Step 2：小批量真迁（3 篇代表性）

挑覆盖最多分支的 3 篇：

- `id=1`：含视频 + strongText 复杂样式 + headPic[0] 抽 cover
- `id=11`：含 2 段视频 + 多个 nopaddingpic + footerPic
- `id=45`：视频缺占位（pending_videos）+ 含 strongText + 含 pic

```pwsh
node scripts/migrate-news-to-directus.mjs --ids=1,11,45
```

完成后到 `https://cms.mint-bio.cn/admin/content/news_articles` 检查：

1. 列表能看到这 3 条（slug = `news-1` / `news-11` / `news-45`）
2. 进入 `news-1` 详情：cover 正常显示、Block Editor 中有 image / paragraph / raw 三类块、raw 块里 `<video>` 标签内嵌正确
3. 进入 `news-45`：raw 块**没有视频**（视频缺占位被脚本跳过）
4. Activity & Revisions 显示当前 Admin 创建

**前端临时验证**（如已部署 Phase 7 前端切流）：访问 `/MiNTNews/news-11`，查看视频是否能播放（视频走 `https://www.mint-bio.cn/video/News/...` 静态路径）。

### Step 3：全量真迁

```pwsh
node scripts/migrate-news-to-directus.mjs
```

幂等：已成功的 3 篇会从 `article-index.json` 命中跳过；已上传的图从 `file-index.json` 命中跳过。预计耗时（48 篇 + 350-400 张图，假设宽带 2MB/s 上传）：3-8 分钟。

### Step 4：全量结构审计（必跑）

```pwsh
node scripts/audit-news-migration.mjs
```

期望输出：

- `source=48 directus=48`
- `errors=0 warnings=0`
- 报告写入 `scripts/.migration-cache/audit-report-<ts>.json`

审计覆盖：legacy_id / slug / title / summary / category / status / publish date / cover file_id / block type 序列 / image file_id 序列 / `stretched` flags / raw 数量 / inline class 保留。

### Step 5：抽检 5 篇 PC + Mobile（plan 5.3 验收清单）

- id 48（首页置顶最新）：cover、richHtml 数字徽章块 01/02/03 已作为 raw block 保留；后台 Block Editor 可能不呈现最终颜色，最终以前端 `v-html` 视觉回归为准
- id 1（含视频 + strongText 复杂样式）：视频可播放、`orange-text` 高亮在前端生效
- id 11（多视频 + nopaddingpic）：不要求人工识别 JSON；运行审计脚本确认 `image.stretched=true` 数量，前端视觉回归再确认无 padding 效果
- id 19（含 overviewcontent 长摘要）：summary_zh 取的是 `news_list.json` 的长版本，不是 title
- id 30（完整详情图文）：源文件 `news_30.json` 实际存在完整正文和多张图片，详情页应按完整图文渲染；不再作为“无正文 list 兜底”样例

---


## 4. 缓存与回滚

### 4.1 缓存文件

`scripts/.migration-cache/`（已 .gitignore）：

| 文件 | 作用 |
|---|---|
| `file-index.json` | `{srcPath: directus_file_uuid}` — 媒体上传去重表，重跑时同源路径不重复传 |
| `article-index.json` | `{legacy_id: directus_article_uuid}` — 文章创建去重表，重跑时同 legacy_id 跳过 |
| `report-<ts>.json` | 每次运行的报告（保留所有历次，方便对比） |

### 4.2 全部清掉重来

```pwsh
Remove-Item -Recurse -Force scripts/.migration-cache
```

⚠️ 这只清本地缓存。**Directus 上已创建的文章和文件不会被删**。如果想清 Directus 端：

- 文章：后台 News Articles 集合 → 全选 → 删除
- 文件：后台 File Library → 进 `news/_legacy/` folder → 全选 → 删除

之后再跑就是干净状态。

### 4.3 单条重做

某篇文章想重做（比如发现某图错了）：

1. Directus 后台手工删除该文章
2. 编辑 `scripts/.migration-cache/article-index.json`，把对应 `legacy_id` 行删除
3. 用 `--ids=<legacy_id>` 重跑

---

## 5. 已知 pending 项（非阻塞）

| 项 | 说明 | 处理建议 |
|---|---|---|
| `pending_videos` | id=45 视频缺占位（`video:""` + `_note` 标注） | 用户后续从公众号下载 mp4，放到 `public/video/News/202604/news45_video1.mov`，然后在 Directus 后台手工编辑 `news-45` 的 Block Editor，把对应位置插一段 raw block：`<video controls poster="/assets/<poster_uuid>"><source src="/video/News/202604/news45_video1.mov" type="video/mp4"></video>` |
| `pending_no_content` | 约 14 篇 id 20-33（除 21 等）只有 list 项，无 news_<id>.json 详情 | 脚本已塞 cover image + 空 paragraph 兜底；用户后续按需在后台补正文 |
| `pending_en_translations` | 全部 48 篇 `_en` 字段空 | 按 plan 5.3 P0/P1/P2 优先级用户在后台手工补；前端 lang=en 走 fallback 中文不阻塞 |

---

## 6. 故障排查

| 现象 | 可能原因 | 处理 |
|---|---|---|
| `403 Forbidden` | Token 过期或权限不足 | 后台重新生成 Static Token，更新 `.env.migration` |
| `404 News Articles collection not found` | Phase 4 未建集合 | 走 plan 4.7 重建 |
| `未找到 folder：news/_legacy` | Phase 4A folder 树未建 | 走 plan 4A 建 22 folder |
| `Directus 后台缺少分类：mint-xxx` | Phase 5 后台 categories 未扩 | 按 plan 5.2.1 v4 在后台补 4 条 |
| `cover 上传失败` | headPic[0] 与 news_list.pic 都不在 src/assets 下 | 检查 `error_log` 中的具体路径，确认源文件是否在仓库内 |
| `EACCES` / `ENOENT` | Node 进程权限或路径问题 | Windows 下用管理员 PowerShell；确认仓库根有 `public/data/news_list.json` |
| 长时间无输出 | 大文件上传中 | 单张图最大 ~1MB，正常应 < 5s/张；如卡 30s+ 可能反代超时，看反代 proxy_read_timeout |

---

## 7. 重要约束（项目铁律）

- **i18n 严格走 doc/zh-en/，不自动翻译**：脚本对 `_en` 字段全部置 `null`，等用户后续在后台手工补充
- **视频文件不上传 Directus**：保留为站点静态资源 `/video/News/*.mov`，前端 raw block 渲染时拼 `https://www.mint-bio.cn` 前缀
- **slug 与前端 i18n key 完全对称**：`mint-runtime ↔ news.categories.runtime`，前端 mapper 用 `slug.replace(/^mint-/, '')` 即可（plan 5.2.1 v4）
