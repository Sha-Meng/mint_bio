name: Directus 宝塔迁移执行追踪

overview:
- 目标：在现有阿里云 + 宝塔 + MySQL + CDN 环境中，分阶段完成 mint_bio 新闻模块向 Directus 后台的最低可行版迁移。
- 工作方式：长期维护本文件，每次执行前先读取，每次执行后更新当前阶段、进展、阻塞与下一步。
- 当前确认方案：`Directus + 现有阿里云服务器/数据库 + 工程外媒体目录 + 现有 CDN`。

todos:
- [x] 完成环境盘点与备份方案确认
- [x] 完成宝塔站点与 Directus 部署
- [~] 完成数据库与媒体目录配置（本地卷完成，`/assets/*` CDN 缓存未做）
- [x] 完成内容模型与权限配置
- [ ] 完成历史数据迁移
- [ ] 完成官网读接口适配
- [ ] 完成前端切流与验收

## Current Status
- **Phase 1 / Phase 2 / Phase 4 已收官**；Phase 3 部分完成（本地卷+CDN 缓存未做）；**Phase 5 历史数据已全量入库**（48/48），待人工抽检验收。
- **当前入口**：生产域名 `https://cms.mint-bio.cn`（DNS → 101.200.45.52 → 宝塔 Nginx → `127.0.0.1:8055` Directus `11.17.4` 容器）。
- **Phase 4 完工状态（2026-05-05）**：
  - 4A 媒体库 folder 树（22 个）✅
  - 4B `news_categories` 集合 ✅
  - 4C `news_articles` 集合（含 _seo_desc_en 字段命名修正）✅
  - 4D Block Editor（`content_blocks_zh/en` 两个 EditorJS 字段，9 种 toolbar block，实测产出真实 JSON 样本固化在 4.3）✅
  - 4E Editor 角色 + Editor Policy（宽松版权限：news_articles 全权 / news_categories 仅读 / directus_files CRUD / 系统集合 App Access Minimum）✅
  - 4F 测试 Editor 账号 + 4G 端到端验收 ✅
  - **4H 双语策略放宽**：`title_en` / `content_blocks_en` 改为可空，前端 lang=en 走 fallback 中文（plan 4.0/4.1/4.2/4.6/5.2/6.0 同步更新）✅
- **Phase 5 状态（2026-05-05）**：
  - 5.1 冻结版字段映射表 ✅（[`news-migration-mapping_20260505.md`](./news-migration-mapping_20260505.md)，48 篇逐条）
  - 5.2.1 分类扩展 v4 终版（4 条 mint-runtime / mint-products / mint-biomanufacturing / mint-vision）✅，后台用户已建好
  - 5.2.2 EditorJS block 映射规则 ✅（含 cover v2 修订：listItem.pic 优先）
  - 5.3 迁移脚本 `scripts/migrate-news-to-directus.mjs` + README ✅
  - **5.4 全量真跑完成**（report-1777990658995.json）：attempted=48 / created=45 / skipped=3 / failed=0；error_log=[]；media uploaded=344 + cacheHit=164 + failed=0；分布 runtime:32 / products:8 / biomanufacturing:4 / vision:4 = 48；article-index size=48 ✅
  - **5.5 人工抽检验收 ⏳ 待下次会话**：抽检 5 篇 PC+Mobile（id=48 富文本徽章 / id=1 视频+strongText / id=11 多视频+stretched / id=19 长摘要 / id=30 list 兜底 cover），README plan 5.3 验收清单
  - 5.6 _en 字段缺失清单（48 篇全空，前端 fallback 中文不阻塞）⏳ 待运营按 P0/P1/P2 优先级人工补
- **Phase 4 收尾长尾**（不阻塞）：4.8 文本颜色高亮调色盘扩展（已归档候选方案 + 落地步骤）；上传默认目录动态路径模板；Phase 3 残项 /assets/* CDN 缓存。




## Current Phase
- `phase_2_directus_deployment` = `done`
- `phase_3_database_and_storage` = `partial`（本地卷已打通，`/assets/*` CDN 缓存策略未做）
- `phase_4_content_model_and_permissions` = `done` ✅（2026-05-05 完工，4A-4H 全部通过）
- `phase_5_data_migration` = `data_loaded`（48/48 入库，待人工抽检验收 5 篇 PC+Mobile）



## Confirmed Background
- 现有阿里云服务器已部署网站后台。
- 现有环境使用宝塔面板管理站点与 MySQL。
- 已有 CDN 与域名可复用。
- 不希望引入新增订阅成本。
- 后续主要由非技术运营维护，要求浏览器可操作、无本地环境依赖。
- 新闻复杂度不高，当前重点是快速、稳定、低成本落地。

## Confirmed Decisions
- 采用 `Directus` 自建，不采用 SaaS CMS。
- 官网前端继续保留当前 Vue 项目，改为运行时读新接口。
- 媒体文件存放在工程外目录，不放在前端仓库内。
- 一期不引入 `COS`，后续按资源增长再升级。
- 推荐官网读接口与 Directus 管理接口解耦。

## Phase Checklist

### Phase 1 - 环境盘点与备份
- [x] 确认宝塔中现有站点和域名映射（`mint-bio.cn` -> `/www/wwwroot/mint-bio.cn`）
- [x] 确认可在宝塔中新增 `cms` 子域名站点入口（`cms.mint-bio.cn` 可录入；仍待 DNS 解析与证书申请验证）
- [x] 确认 MySQL 版本、账号权限、可否新建独立数据库（本地 `MySQL 5.7.40`，宝塔具备新增数据库入口）
- [x] 确认是否支持 Docker；若不支持则准备 Node + PM2 路线（当前 `Docker` / `Node.js` / `npm` / `pm2` 均未安装）
- [x] 确认服务器可用目录与磁盘空间（根分区剩余约 `27G`）
- [x] 确认当前数据库备份与站点备份方式（当前无现成备份，需先补手工备份）
- [ ] 记录现网回滚入口


### Phase 2 - 宝塔站点与 Directus 部署
- [x] 创建或规划 `cms` 站点入口
- [x] 部署 Directus 服务
- [x] 配置宝塔反向代理到 Directus
- [x] 配置 HTTPS
- [x] 验证后台可访问

### Phase 3 - 数据库与媒体目录配置
- [x] 创建独立 CMS 数据库
- [x] 配置 Directus 数据库连接
- [x] 创建工程外上传目录
- [x] 配置上传目录权限
- [ ] 配置 `/assets/*` 访问与 CDN 缓存
- [x] 验证图片上传与访问


### Phase 4 - 内容模型与权限配置

> 设计基线确认日期：2026-05-05。下列默认值已与用户确认通过，作为本阶段建模依据。

#### 4.0 设计基线（已确认）

| 项 | 默认值 |
|---|---|
| 1. 双语策略 | 字段并列：`title_zh` / `title_en` / `summary_zh` / `summary_en` / `content_blocks_zh` / `content_blocks_en`。**[2026-05-05 最终态]** 中文必填，**英文字段全部可空**（fallback 中文策略）：运营常态写纯中文文章，留空英文字段；前端切到英文 lang 时，若 `_en` 字段空则回落显示中文原文（Phase 6 BFF/前端 mapper 实现 `title = item.title_en \|\| item.title_zh`）。不使用 Directus Translations 集合。 |
| 8. 字段校验 | `slug` 必填 + 唯一 + 仅 `[a-z0-9-]`；`title_zh`、`cover`、`category`、`publish_at` 必填；`content_blocks_zh` 必填且至少 1 个 block；`title_en` / `content_blocks_en` / `summary_*` / `seo_*` 全部可空（双语放宽，见第 1 项）。 |
| 2. 正文形态 | **EditorJS Block Editor**（Directus 11.17 内置）。启用 9 种 block：`Header / Paragraph / Image / NestedList / Embed / Quote / Underline / Delimiter / Raw HTML`。数据存储为 EditorJS 标准 JSON `{ time, blocks: [{id, type, data}], version }`。**[2026-05-05 最终态]** 经历过 Repeater + Conditions、Repeater 全字段裸露、Builder M2A 三个备选，最终选 Block Editor，因其 Notion 风格编辑体验最契合非技术运营、数据结构最简单（单字段 JSON）、与原 plan 语义最一致。 |
| 3. 发布状态 | 仅 `draft` / `published`，不做定时发布。后期如需定时再用 Directus Flows 增量加。 |
| 4. 旧 URL 兼容 | `news_articles` 加 `legacy_id`（int，可空，迁移老数据时填入原 1~48）。前端路由 `/MiNTNews/:idOrSlug` 先 slug 后 legacy_id，老链接 + 新链接均可达。 |
| 5. 角色 | 仅 `Admin` + `Editor`。Editor 可写 `news_*` + 上传文件 + 改草稿，不可删已发布文章、不可改 schema、不可使用 `raw_html` block。 |
| 6. 媒体库 | 逻辑 folder 按 `news/{YYYY}/{MM}/` 分；历史迁移进 `news/_legacy/`；新闻文章字段配置上传默认目录自动预填当年当月。 |
| 7. 修订历史 | 启用 Directus 自带 Activity & Revisions，每次 Save 自动留版本，可一键 revert。 |
| 8. 字段校验 | `slug` 必填 + 唯一 + 仅 `[a-z0-9-]`；`title_zh`、`cover`、`category`、`publish_at` 必填；`content_blocks_zh` 必填且至少 1 个 block；`title_en` / `content_blocks_en` / `summary_*` / `seo_*` 全部可空（双语放宽，见第 1 项）。 |

#### 4.1 集合 `news_categories` 字段

| 字段 | 类型 | 约束 | 备注 |
|---|---|---|---|
| `id` | uuid | PK | Directus 默认 |
| `slug` | string | 必填 + 唯一 + `[a-z0-9-]` | 用于 URL 与外部引用 |
| `name_zh` | string | 必填 | 中文分类名 |
| `name_en` | string | 必填 | 英文分类名 |
| `sort` | int | 默认 0 | 列表排序，升序；Directus 系统 sort 字段，编辑面板自动隐藏，列表页拖动行排序 |
| `status` | enum | `published` / `archived` | 隐藏分类用 archived |

#### 4.2 集合 `news_articles` 字段

| 字段 | 类型 | 约束 | 备注 |
|---|---|---|---|
| `id` | uuid | PK | Directus 默认 |
| `legacy_id` | int | 可空 + 唯一（非空时） | 迁移老数据时填 1~48；新文章留空 |
| `slug` | string | 必填 + 唯一 + `[a-z0-9-]` | URL 关键字段 |
| `title_zh` | string | 必填 | |
| `title_en` | string | **可空（fallback 中文）** | 留空时前端 lang=en 回落显示 title_zh |
| `summary_zh` | text | 可空 | 列表页摘要 |
| `summary_en` | text | 可空 | fallback 中文 |
| `cover` | file (M2O) | 必填 | 封面图，指向 `directus_files` |
| `category` | M2O `news_categories` | 必填 | |
| `publish_at` | datetime | 必填 | 前端按此字段倒序 |
| `status` | enum | `draft` / `published` | 默认 `draft` |
| `content_blocks_zh` | json | 必填，至少 1 块 | block 数组（EditorJS 结构，见 4.3） |
| `content_blocks_en` | json | **可空（fallback 中文）** | 留空时前端 lang=en 回落显示 content_blocks_zh |
| `featured` | boolean | 默认 false | 首页置顶手动开关，前端 `ORDER BY featured DESC, publish_at DESC` |
| `seo_title_zh` | string | 可空 | 留作 SEO 扩展 |
| `seo_title_en` | string | 可空 | |
| `seo_desc_zh` | text | 可空 | |
| `seo_desc_en` | text | 可空 | |
| `created_by` / `updated_by` / `date_created` / `date_updated` | system | 自动 | Directus 内置 |

#### 4.3 `content_blocks` block 规范（EditorJS 标准）

> **[2026-05-05 最终态]** 落地为 Directus 11.17 内置的 **Block Editor**（基于 EditorJS 2.31.2）。`content_blocks_zh / content_blocks_en` 字段类型 `JSON`，存储 EditorJS 标准结构 `{ time, blocks: [{ id, type, data }], version }`。已用 `phase4-test-article` 实测产出真实数据样本（见下）。

启用的 9 种 toolbar block：`Header / Paragraph / Image / List(NestedList) / Embed / Quote / Underline / Delimiter / Raw HTML`。

##### 字段顶层结构

```jsonc
{
  "time": 1777968328713,           // 编辑器最后保存时间戳（ms）
  "version": "2.31.2",             // EditorJS 版本（Directus 11.17 锁定）
  "blocks": [...]                  // 块数组，按顺序渲染
}
```

##### 块（block）类型与数据结构（**实测样本**）

| `block.type` | EditorJS Tool | `block.data` 关键字段 | 前端渲染策略 |
|---|---|---|---|
| `header` | Header | `text: string`（HTML，含 `<b>/<i>` 等行内格式）<br>`level: 2 \| 3`（暂只用 H2/H3） | `<h${level} v-html="text">` |
| `paragraph` | Paragraph | `text: string`（HTML，含 `<b>/<i>/<u>/<a>` 等） | `<p v-html="text">` |
| `image` | Image | `data.file.fileId: uuid`（指向 `directus_files.id`）<br>`data.file.url: string`（相对路径 `/assets/<uuid>`）<br>`data.file.width / height / extension / size`<br>`caption: string`（可空）<br>`stretched / withBorder / withBackground: bool` | `<figure>` + `<img :src="cdnBase + data.file.url">` + `<figcaption v-if="caption">`<br>`stretched=true` 时图占满容器宽度 |
| `nestedlist` | NestedList | `style: 'ordered' \| 'unordered'`<br>`items: Array<{ content: string, items: Array<...> }>`（**递归**结构） | 递归组件渲染 `<ul>/<ol>` + `<li v-html="content">`，子层再递归 |
| `delimiter` | Delimiter | `{}`（无字段） | `<hr>` |
| `embed` | Embed | `service: 'youtube' \| 'bilibili' \| ...`<br>`source: string`<br>`embed: string`（iframe URL）<br>`caption: string` | `<iframe :src="embed">` + `<figcaption>` |
| `quote` | Quote | `text: string`（HTML）<br>`caption: string`（来源） | `<blockquote v-html="text">` + `<cite>` |
| `raw` | Raw HTML | `html: string`（任意 HTML） | `<div v-html="html">`，**仅 Admin 可写**（4E Editor 角色权限层禁，本字段在前端无差别渲染） |

> ⚠️ **关键差异点**：List 实际类型是 `nestedlist`（**不是 `list`**，因 Directus 11 内置 NestedList 插件支持子列表）。前端 mapper 必须识别 `nestedlist`。

##### 真实数据样本（来自 `phase4-test-article` 2026-05-05 实测）

```json
{
  "time": 1777968328713,
  "version": "2.31.2",
  "blocks": [
    {
      "id": "wWZ7M4tQi5",
      "type": "header",
      "data": { "text": "这是一段二级标题", "level": 2 }
    },
    {
      "id": "ZqXC_l-MAL",
      "type": "paragraph",
      "data": { "text": "这是一段普通正文，用来测试 <b>加粗</b>&nbsp;和 <i>斜体</i>&nbsp;是否能用工具栏切换" }
    },
    {
      "id": "B1PEx_PkQK",
      "type": "image",
      "data": {
        "file": {
          "url": "/assets/c7db4700-96f4-4d7c-9192-c3f19d1ad06a",
          "name": "268.png", "size": 716733, "title": "268",
          "width": 944, "height": 451, "extension": "png",
          "fileId": "c7db4700-96f4-4d7c-9192-c3f19d1ad06a",
          "fileURL": "/files/c7db4700-96f4-4d7c-9192-c3f19d1ad06a"
        },
        "caption": "测试图注",
        "stretched": false, "withBorder": false, "withBackground": false
      }
    },
    {
      "id": "Q2OjCuBVgj",
      "type": "nestedlist",
      "data": {
        "style": "unordered",
        "items": [
          { "content": "第一条", "items": [] },
          { "content": "第二条", "items": [] },
          { "content": "第三条", "items": [] }
        ]
      }
    },
    { "id": "fOsNCM1tS_", "type": "delimiter", "data": {} }
  ]
}
```

##### 前端 / BFF mapper 契约（Phase 6/7 输入）

前端取资源用 `https://cms.mint-bio.cn${block.data.file.url}`，可附加 `?width=800&format=webp` 走 Directus 内置图片变换 + CDN。

##### 已废弃的旧字段名（防迁移误用）

之前 Repeater 方案下设计的 `html_paragraph / heading_level / heading_text / image_file / image_caption / video_file / video_poster` 字段全部废弃。Phase 5 迁移脚本必须输出 EditorJS 标准 `{type, data}` 结构。

#### 4.4 角色与权限

| 角色 | `news_articles` | `news_categories` | `directus_files` | `directus_users` | Schema |
|---|---|---|---|---|---|
| Admin | 全部 | 全部 | 全部 | 全部 | 可改 |
| Editor | C/R/U/D 全部 | **仅 R**（防误删分类破坏外键） | C/R/U/D 全部 | 全部 No Access（自己改密码走顶栏菜单） | 不可改 |

> **[2026-05-05 调整为宽松版]** 原方案 "Editor 仅可改自己作者的草稿/不可硬删" 等细粒度限制全部取消。理由：运营人数少（1-3 人），团队信任度高；Custom Access 过滤器（`{user_created:{_eq:$CURRENT_USER}}`）调试成本不低；保留唯一限制是 `news_categories` 不开写权限（基础数据被多文章引用，乱删/改会破坏外键关联）。误删/误改的真实风险靠 Activity & Revisions 兜底（一键 revert）。

#### 4.5 媒体库 folder 预设

迁移前在后台先建好以下 folder（顺序：父 → 子）：

```
news/
news/_legacy/
news/2024/
news/2025/
news/2025/01 ~ 12/
news/2026/
news/2026/01 ~ 12/
```

> 后续每年 12 月底脚本/手工补一次次年的 12 个月文件夹。

#### 4.6 验收标准

- [x] `news_categories` / `news_articles` 集合按 4.1–4.4 创建完成，所有字段校验生效
- [x] **EditorJS Block Editor 9 种 toolbar block** 在后台可见并能在文章正文中插入（实测 5 种 block 全部产出真实 JSON）
- [x] Editor 角色账号实际登录验证：可发文、可上传到 news folder、不能改 schema
- [x] 媒体库 folder 树按 4.5 建好
- [x] 任意一篇新建文章：填全字段 → 上传 1 张图 → 插入图块 → 发布 → 后台 `Activity & Revisions` 中能看到一条历史
- [x] 试改一次再 Save → Revisions 中存在 v1/v2 → 一键 revert 弹窗能看到（未真 revert，避免丢测试数据）

#### 4.7 实施 Todo

- [x] 升级 Directus 至 `11.17.4`（已于 2026-05-05 完成，比原计划的 11.17.3 更新一版）
- [x] 后台建 `news_categories` 集合（按 4.1）— Required/Regex/Unique 校验 4/4 通过
- [x] 后台建 `news_articles` 集合 14 个业务字段（按 4.2，除 `content_blocks_zh/en` 外）— `cover` 用备选 B（Required + Nullable 留勾）；`category` Display Template `{{name_zh}}`；测试文章 `phase4-test-article` 已建
- [x] **4D 完成** — 在 `content_blocks_zh/en` 字段上配置 EditorJS Block Editor（4D.1/2/3/4，9 种 toolbar block，Root Folder=news，实测产出真实 JSON 样本写入 4.3）
- [x] **4D 后修完成**：`phase4-test-article` 的 slug / title_en 头部 Tab 字符清理；`_seo_desc_en` 字段重建为 `seo_desc_en`
- [x] **4E 完成**：建 `Editor` 角色 + `Editor Policy`（宽松版：news_articles 全权 / news_categories 仅读 / directus_files CRUD / 系统集合 App Access Minimum）
- [x] 建好 4.5 的 folder 树（22 个 folder：`news/_legacy` + `news/2024` + `news/2025/01-12` + `news/2026/01-05`）
- [ ] **长尾（不阻塞 Phase 5）**：在 `news_articles` 上配置上传默认目录为 `news/{当前年}/{当前月}/`（cover 字段 + Block Editor Image 字段当前 Folder = `news` 顶层，需测 Directus 是否支持动态路径模板，不支持则用 Flow 或前端 hook 兜底）
- [ ] **长尾（不阻塞 Phase 5；详见 4.8 节）**：为 Block Editor `paragraph` tool 加文本颜色高亮按钮，让运营像 Word 那样选中文字点调色盘改色，对齐工程现有 4 色（`.orange-text` / `.blue-text` / `.green-text` / `.blue-green-text`）+ 加粗 `.strong-text` 共 5 个预设
- [x] **4F+4G 完成**：`editor-test@mint-bio.cn` 测试账号 + Editor Role 绑定 + 6 case 端到端验收全过
- [x] **4H 完成**：双语策略放宽——`title_en` / `content_blocks_en` 改为可空（Nullable 留勾 + 取消 Required），前端 lang=en 走 fallback 中文（Phase 6/7 mapper 实现，见 plan 6.0）

#### 4.8 文本颜色高亮（运营友好交互，长尾决策）

**[2026-05-05 决策]** Phase 5 真迁 3 篇验收时发现：旧数据里 `<span class='orange-text'>...</span>` 等内联色彩 HTML 虽然能在 Directus Block Editor 中**保存原样不丢**（已用 API 直接 GET 验证 P1/P3 数据 `hasSpan: true`），但后台编辑器**视觉上不显示颜色**且**没有"调色盘"按钮**让运营选中文字改色（EditorJS 默认 paragraph 的内联工具栏只有 Bold/Italic/Underline/Link 四个）。运营如要新加色彩强调，必须切到 Raw HTML 块手写 `<span>`，对非技术运营不友好。

**目标**：让运营像 Word 一样，选中正文 → 浮出工具栏点"调色盘" → 选橙/蓝/绿/灰绿 4 色之一即可上色，与工程现有 `.orange-text` / `.blue-text` / `.green-text` / `.blue-green-text` CSS 类样式 100% 对齐（详见 `src/components/MiNTNews/MiNTNewsDetailSection.vue` 全局样式块）。

##### 候选方案

| 方案 | 实现难度 | 运维成本 | 与现有数据兼容性 | 备注 |
|---|---|---|---|---|
| **A. Fork `dimitrov-adrian/directus-extension-editorjs-interface` + 集成 `editorjs-text-color-plugin@^2.0.4`** | 中 | 中（自维护 fork） | ✅ 完全兼容（同一个 paragraph block，data.text 仍是 HTML） | **首选**。npm 包活跃维护，4+ 项目使用，开箱即用调色盘 UI。改 5 行 EditorJS tools 注册代码，npm pack → 装到服务器 `/data/mintbio/directus/extensions/`。 |
| B. 上游提 PR 等合并 | 低 | 极低 | 同 A | 上游响应未知，时间不可控 |
| C. 切换到 `formfcw/directus-extension-flexible-editor`（TipTap） | 高 | 高 | ❌ 不兼容（TipTap 数据模型与 EditorJS 完全不同），需重写迁移脚本 | 不推荐——会推翻 4D 已落地的 Block Editor 方案 |
| D. 写完全自定义的 inline tool（不依赖 npm 包） | 高 | 中 | 同 A | 重复造轮子 |

**选 A**。

##### 落地步骤（Phase 5 全量迁完后启动）

1. 本机 `git clone https://github.com/dimitrov-adrian/directus-extension-editorjs-interface`，切到与服务器版本一致的 tag
2. `npm i editorjs-text-color-plugin@^2.0.4` 加为依赖
3. 在源码 `src/interface.vue` 的 EditorJS tools 注册段补：
   ```js
   import ColorPlugin from 'editorjs-text-color-plugin';
   // ...
   tools: {
     // ... 已有 9 个 tool
     Color: {
       class: ColorPlugin,
       config: {
         colorCollections: ['#e75a29', '#2d5bf6', '#74d887', '#6bbea9'], // orange/blue/green/blue-green
         defaultColor: '#e75a29',
         type: 'text',
         customPicker: true,
       },
     },
     Marker: {
       class: ColorPlugin,
       config: { type: 'marker', defaultColor: '#FFBF00' }, // 可选，二级高亮
     },
   }
   ```
4. `npm run build` → 产出 `dist/` 目录
5. 服务器 `/data/mintbio/directus/extensions/` 下放 fork 版本目录，重启 Directus 容器
6. **数据兼容性验证**：开 1 篇老文章，确认现有 `<span class='orange-text'>` 仍正确渲染颜色；选中一段新文字，调色盘改橙色，保存，API GET 检查 `data.text` 是否含 `<span style="color: #e75a29">` 或 `<span class="orange-text">`（取决于插件输出策略，需测）
7. **前端样式对齐**：如果插件输出的是 inline `style="color: #..."` 而非 `class="..."`，则 `MiNTNewsDetailSection.vue` 用 `v-html` 直接渲染即可（颜色 inline 生效）；如果输出 `class`，则 class 名称需与 `.orange-text` 等对齐（可能需要调整插件配置或加映射 CSS）

##### 暂时的兼容策略（在长尾完成前）

- **历史 48 篇**：当冷数据，运营不动，前端 `v-html` 渲染颜色 100% 正常 ✅
- **新文章**：
  - 默认用 Bold（粗体）做强调，不依赖颜色 — 满足 80% 场景
  - 必须用品牌橙强调时，运营切到 Raw HTML 块手写 `<span class='orange-text'>...</span>`（README 已在 4.8 完成后会同步加运营文档）
  - 极个别场景找不到出口，请技术补单条

##### 验收标准（4.8 落地后）

- [ ] 运营在 Block Editor 中新建 paragraph，选中文字 → 工具栏出现调色盘按钮
- [ ] 4 色按钮颜色与工程 `.orange-text` / `.blue-text` / `.green-text` / `.blue-green-text` 完全一致
- [ ] 任选一篇老文章打开，原 `<span class='orange-text'>` 渲染颜色正确（视觉验证）
- [ ] 任选一篇老文章打开，选中已有彩色文字 → 改成另一色 → 保存 → API GET 检查 `data.text` HTML 仍合法
- [ ] 前端站点（Phase 7 切流后）展示对照——同一篇文章新旧两种 span 都能正确渲染颜色


---

### Phase 5 - 历史数据迁移

#### 5.1 输入资产

- 数据：`public/data/news_list.json` + `public/data/news_1.json` ~ `news_48.json`
- 媒体：`src/assets/News/**`（PNG/JPG/MP4 等）
- 文档：`doc/zh-en/`（用于补全双语字段，**严禁脚本自行翻译**，未覆盖字段保留中文原文，写入 `_zh` 字段并把 `_en` 设为待补）

#### 5.2 字段映射（旧 → 新）

> **[2026-05-05 更新]** 双语策略放宽为"中文必填 + 英文 fallback 中文"，迁移脚本对 `_en` 字段全部允许留空（`null`），不再阻塞迁移流程。原"_en 字段缺失需补"改为"非必须"。

| 旧 (news_*.json) | 新 (`news_articles`) | 说明 |
|---|---|---|
| `id` (number) | `legacy_id` | 直接搬 |
| `id` + 标题 → 派生 | `slug` | 脚本生成 `news-<legacy_id>-<title-pinyin-or-en>` 形式；冲突自动加 `-2` |
| `title` (zh) | `title_zh` | 必填，迁移必有值 |
| `doc/zh-en/` 对照 | `title_en` | **可空**：对照文件有就填，没有就 `null`，前端走 fallback；**严禁脚本自行翻译** |
| `summary` / `desc` | `summary_zh` | |
| — | `summary_en` | 可空，同 title_en 策略 |
| `cover` 路径 → 上传后 file_id | `cover` | 必填 |
| `date` | `publish_at` | ISO 化 |
| `category` | `category` (M2O) | 缺失分类先在迁移前建好 |
| 正文段落数组 | `content_blocks_zh` | 转为 EditorJS 标准结构（见 4.3），按 paragraph/image/heading/delimiter 分发 |
| — | `content_blocks_en` | **可空**：默认全部留 `null`；后续运营按需补；前端 lang=en 走 fallback 显示中文 |
| — | `status` | 全部置 `published` |

#### 5.2.1 分类映射（决策 A：扩展为 4 条 — 最终确定版）

> **[2026-05-05 v4]** Phase 4 后台预建的 `company-news` / `industry-news` 2 条占位与源数据 4 类标签不匹配。Phase 5 启动前需扩充为 4 条（旧 2 条删除或归档；后台已建好）。**v4 校正**：用户偏好"进行时 = Runtime"，工程 i18n 旧 key `updates` / 旧文案 `MiNT Updates` 整体改名为 `runtime` / `MiNT Runtime`，使 Directus slug ↔ i18n key 完全对称、无需 mapper 解耦表。改名前已确认工程 `src/` 内无任何代码引用 `categories.updates`，重命名零侵入。

| 源 `categorylabel`（含历史脏拼写） | `news_categories.slug` | `name_zh` | `name_en` | 前端 i18n key | 数量（按 news_list.json 统计） |
|---|---|---|---|---|---|
| `#MiNT 进行时` / `#Mint 进行时` | `mint-runtime` | `MiNT 进行时` | `MiNT Runtime` | `news.categories.runtime` | 32 |
| `#MiNT 产品力` | `mint-products` | `MiNT 产品力` | `MiNT Products` | `news.categories.products`（新增） | 8 |
| `#MiNT 智造力` / `#MiNT 制造力`（历史脏拼写） | `mint-biomanufacturing` | `MiNT 智造力` | `MiNT Biomanufacturing` | `news.categories.biomanufacturing` ✅ 已有 | 4 |
| `#MiNT Vision` / `#Mint Vision` | `mint-vision` | `MiNT Vision` | `MiNT Vision` | `news.categories.vision`（新增） | 4 |

**命名决策依据**：

- **slug 与 i18n key 完全对称**：`mint-<slug-suffix>` 对应 `news.categories.<slug-suffix>`（runtime / products / biomanufacturing / vision），前端无需额外 mapper 表，直接用 `slug.replace(/^mint-/, '')` 取后缀作为 i18n key。
- `MiNT Runtime` / `MiNT 进行时`：工程 i18n 旧 key 名 `updates` 与中文"进行时"语义不直对，v4 整体改名后中英文一致直译。改动范围：`src/i18n/modules/news/zh-CN.json` 和 `en-US.json` 的 `categories.updates` → `categories.runtime`，`MiNT Updates` 字面量 → `MiNT Runtime`（含 sampleNews 4 处文案）。
- `mint-biomanufacturing / MiNT Biomanufacturing`：完全复用工程现有 `categories.biomanufacturing`。**注意不用 `Manufacturing`**——工程内 `MiNT Manufacturing` 已固定指代"元素智造"工厂项目（见 `en-US.json:464-465, 555`），分类层用 `Biomanufacturing` 更精确表达"生物智造"且避免歧义。
- `mint-products / MiNT Products`：工程现有 `categories.innovation = #MiNT 创新力` 与源数据 `#MiNT 产品力` 字面量不一致，**不复用**；按 Runtime 同样的"名词复数"风格新增；Phase 7 前端 i18n 时也需要在 `src/i18n/modules/news/*.json` 里同步补 `categories.products` 这一对 key。
- `mint-vision / MiNT Vision`：源标签字面量本身即英文，`zh` 沿用 `MiNT Vision`（源数据未给中文译名）；Phase 7 同步在 `src/i18n/modules/news/*.json:categories.vision` 补 key。

**与工程 i18n 的同步动作**（v4 已部分落地）：

1. ✅ 已改：`src/i18n/modules/news/zh-CN.json` 和 `en-US.json` 的 `categories.updates` → `categories.runtime`，`MiNT Updates` 字面量 → `MiNT Runtime`（en-US.json 含 sampleNews 4 处后缀同步改）。
2. ⏳ 待做（Phase 7）：在 `categories` 节点新增 `products` / `vision` 两个 key：

```jsonc
// zh-CN.json
"categories": {
  "runtime": "#MiNT 进行时",
  "biomanufacturing": "#MiNT 智造力",
  "products": "#MiNT 产品力",      // 待新增
  "vision": "#MiNT Vision",         // 待新增
  "innovation": "#MiNT 创新力",     // 历史 key，新闻分类不用，但保留以防其他位置引用
  "all": "全部动态"
}
// en-US.json 同结构 → MiNT Runtime / MiNT Biomanufacturing / MiNT Products / MiNT Vision / MiNT Innovation / All News
```

3. ⏳ 待做（Phase 7）：前端 mapper（如 `src/api/news.js`）把 Directus 拉到的 `category.slug` 转 i18n key：

```js
// 由于 slug ↔ i18n key 完全对称，直接 strip 'mint-' 前缀即可，无需查表
function categoryLabel(slug, t) {
  const key = slug.replace(/^mint-/, '');
  return t(`news.categories.${key}`);
}
```

**历史脏拼写归一化**（迁移脚本侧 alias 表）：

| 原 categorylabel | 归一化后 slug |
|---|---|
| `#MiNT 进行时`、`#Mint 进行时` | `mint-runtime` |
| `#MiNT 产品力` | `mint-products` |
| `#MiNT 智造力`、`#MiNT 制造力` | `mint-biomanufacturing` |
| `#MiNT Vision`、`#Mint Vision` | `mint-vision` |

> 实际数量分布（脚本运行时统计为准）：mint-runtime 约 28-32 / mint-products 约 8 / mint-biomanufacturing 约 4-5（含 id 4/10/11/35）/ mint-vision 4（id 13/29/30/32），合计 48 ✅。

#### 5.2.2 旧 content 形态 → EditorJS block 类型映射（决策 B）

旧 `sections[i].contents[j]` 内可能出现的字段（**已完整覆盖 48 篇**）：`pic` / `nopaddingpic` / `desc` / `strongText` / `richHtml` / `quote[]` / `video`+`poster` / `height` / `id`。映射规则：

| 旧字段 | 新 EditorJS block | 说明 |
|---|---|---|
| `pic` | `image` | `data.file.url=/assets/<uuid>` + `stretched=false` + `caption=""`，前后默认 50px 间距 |
| `nopaddingpic` | `image` | 同上但 `stretched=true`（Phase 7 前端 mapper 识别此布尔，渲染无 padding 模式）；caption 留空 |
| `desc` | `paragraph` | `data.text=desc`（纯文本，不带 HTML 标签） |
| `strongText` | `paragraph` | `data.text=strongText`（**保留 `<span class='orange-text'>...</span>` 等内联 HTML**，前端 v-html 渲染时 CSS 类名仍生效，需在 Phase 7 渲染器全局引入这几个 class 样式）。**注意**：Directus Block Editor 后台默认不显示这些 class 的颜色（EditorJS 默认 paragraph 工具栏只支持 Bold/Italic/Underline/Link），但**数据保存原样不丢**（已 API 验证 hasSpan=true）。运营友好的颜色调色盘按钮见 4.8 长尾任务。 |
| `richHtml` | `raw` | `data.html=richHtml`，原 HTML 完整保留（仅 Admin 可二次编辑，Editor 角色禁写但前端无差别渲染） |
| `quote[]` 数组 | `quote` 1 个 + `paragraph` N 个 | 第 1 项的 desc/strongText 作为 quote.text，其余项续接为普通 paragraph，前面加 1 个 `delimiter` 视觉分割 |
| `video`+`poster` | `raw` | `data.html=<video controls poster="<cdn>/<poster_uuid>"><source src="/video/News/.../*.mov"></video>`。**视频文件不上传到 Directus**（保留 .mov 为站点静态资源 `/video/News/...`，仅 poster 静态图作为普通文件上传到 directus_files 取 uuid）；空 `video:""` 占位（如 news_45 标注待补）跳过该 block 并写入报告 `pending_videos` |
| `headPic[]` 数组 | 文章 `cover` + 正文 `image` blocks | `cover = upload(headPic[0])`；`headPic[1..n]` 作为正文最前面 N 个 image block（顺序保留） |
| `footerPic[]` 数组 | 正文末尾 `image` blocks | 顺序追加在 contents 渲染完之后 |
| `height` | （丢弃） | 旧字段为视觉占位高度，新 EditorJS image block 自带 width/height，无需手动设置 |
| `id` | （丢弃） | 旧字段为 section 内 id，新 EditorJS 每个 block 自带 `id` |

> **生成顺序**：`headPic[1..n]` → 旧 `contents[]` 顺序映射 → `footerPic[1..n]`。`headPic[0]` 单独抽出做 cover。

#### 5.3 迁移 Todo

- [x] **2026-05-05 完成**：输出冻结版字段映射表 [`.codebuddy/plans/news-migration-mapping_20260505.md`](./news-migration-mapping_20260505.md)，包含每条旧 id 的目标 slug、目标 category、双语缺失项清单 + 旧 content 形态 → EditorJS block 类型映射 + 媒体上传规则 + 验证清单
- [x] **2026-05-05 完成**：在 Directus 后台扩充 `news_categories` 至 4 条（旧 2 条占位删除/归档；按映射表 5.2.1 v4 建 `mint-runtime` / `mint-products` / `mint-biomanufacturing` / `mint-vision` 4 条，name_en 分别为 MiNT Runtime / MiNT Products / MiNT Biomanufacturing / MiNT Vision）
- [x] **2026-05-05 完成**：编写 `scripts/migrate-news-to-directus.mjs`（自包含，0 第三方依赖，Node 18+），含：(1) `.env.migration` 加载 + DirectusClient REST 封装 + dry-run 模式；(2) 媒体上传模块 MediaUploader（路径 → file_id 缓存到 `scripts/.migration-cache/file-index.json`，`news/_legacy/` folder uuid 自动查询，`assets/{News,images}/*` 跨目录路径解析）；(3) 正文转换 buildBlocks（按 5.2.2 决策实现 `pic/nopaddingpic→image stretched 区分` / `desc→paragraph` / `strongText→paragraph 保留 <span class>` / `richHtml→raw` / `quote[]→delimiter+quote+paragraphs+delimiter` / `video+poster→raw 内嵌 <video> 兼容空 video 占位写入 pending_videos` / `headPic[0]→cover` 单独抽出，`headPic[1..n]+contents+footerPic` 顺序拼装 + 无正文 14 篇空 paragraph 兜底）；(4) 文章创建模块（payload 严格按 plan 4.2/5.2 映射，slug=`news-<legacy_id>`，publish_at ISO 8601 +08:00，`_en` 字段全 null，status=published，featured=false）；(5) 幂等控制（article-index.json 命中即跳过，保护运营手工编辑）；(6) 增量报告（pending_videos / pending_no_content / pending_en_translations / category_distribution / error_log，含每次运行 ts 后缀）。CLI 支持 `--dry-run` `--limit=N` `--ids=1,11,45` 三种模式。`scripts/MIGRATE-NEWS-README.md` 含 7 节操作说明（前置条件/命令/推荐执行顺序 4 步/缓存与回滚/已知 pending/故障排查/项目铁律）。Node syntax check 通过、缺 env 友好报错验证通过。`.gitignore` 已加 `scripts/.migration-cache/`。
- [x] **2026-05-05 完成**：用户配 Static Access Token + 写入 `scripts/.env.migration`，按 README 推荐流程执行 dry-run 全量 → 真迁 3 篇（id=1,11,45）后台抽检 → cover 来源修订（v2：listItem.pic 优先）+ 删除旧 3 篇重跑 → **全量真跑 48/48 入库**（report-1777990658995.json：created=45 / skipped=3 / failed=0 / error_log=[] / failed_uploads=[] / media uploaded=344 + cacheHit=164 + failed=0）
- [ ] **【下次会话】抽检 5 篇 PC+Mobile**（id=48 富文本徽章 / id=1 视频+strongText / id=11 多视频+stretched / id=19 长摘要 / id=30 list 兜底 cover），按 README plan 5.3 验收清单
- [ ] 把 `_en` 字段缺失项整理为待办交回用户**按需**补；不补也不阻塞（前端 fallback 中文）

### Phase 6 - 官网读接口适配

> 决策：先**直连 Directus REST/GraphQL** 验证可行性；若耦合过深再加薄 BFF。MVP 阶段不强求 BFF。

#### 6.0 双语 Fallback 策略（必做）

> **[2026-05-05]** 设计基线第 1 项确定：英文字段全部可空，前端按 lang 取字段时如 `_en` 为空则回落显示 `_zh`。

实现层面：

- **路线 A（推荐）**：直连 Directus 时，前端 mapper 统一处理。例如：
  ```js
  // src/api/news.js（Phase 7 新建）
  function pickLang(item, lang) {
    return {
      ...item,
      title: lang === 'en' ? (item.title_en || item.title_zh) : item.title_zh,
      summary: lang === 'en' ? (item.summary_en || item.summary_zh) : item.summary_zh,
      content_blocks: lang === 'en'
        ? (item.content_blocks_en?.blocks?.length ? item.content_blocks_en : item.content_blocks_zh)
        : item.content_blocks_zh,
    };
  }
  ```
- **路线 B**：BFF 层做（如未来加 BFF），前端无感。
- **测试要求**：迁移完一篇纯中文文章（_en 全空），lang=en 访问详情页应正常显示中文，列表页标题不能为空。


- [ ] 确定接入方式：直连 Directus（推荐 MVP）或 在阿里云上加 Node BFF
- [ ] 输出契约文档 `.codebuddy/plans/news-api-contract_<date>.md`
- [ ] `GET /api/news/latest?lang=zh|en&limit=N` → 首页用
- [ ] `GET /api/news/list?lang=&category=&page=&pageSize=` → 列表用
- [ ] `GET /api/news/detail?lang=&key=<slug-or-legacy_id>` → 详情用，**同时支持 slug 和 legacy_id 查询**
- [ ] `GET /api/news/categories?lang=` → 分类列表
- [ ] 返回 JSON 结构与前端 `MiNTNews*` 现有 props 形状对齐，便于切流时 diff 最小
- [ ] CORS / 缓存头（`Cache-Control: s-maxage=60, stale-while-revalidate=300`）
- [ ] 联调：用 Postman / curl 跑一遍契约文档全部 case

### Phase 7 - 前端切流与验收

- [ ] 引入运行时开关 `VUE_APP_USE_DIRECTUS=true|false`（`.env` 控制），默认 false
- [ ] 改造 `src/api/news.js`（新建）：开关 true 时走 Phase 6 接口；false 走原 `public/data/*.json`
- [ ] 改造路由 `/MiNTNews/:idOrSlug`：先按 slug 查，未命中再按 legacy_id 查
- [ ] 首页 `MiNTNewsTop` 切新接口（PC + 移动端）
- [ ] 新闻列表页切新接口（PC + 移动端）
- [ ] 新闻详情页切新接口 + content_blocks 渲染器（PC + 移动端）
- [ ] 验证 CDN `/assets/*` 命中、AVIF/WebP 转换正常
- [ ] 验证 SEO：旧链接 `/MiNTNews/12` 仍可达；新链接 `/MiNTNews/<slug>` 工作
- [ ] 灰度：先开 `VUE_APP_USE_DIRECTUS=true` 部署到测试环境，48h 观察
- [ ] 正式切流到生产
- [ ] 切流稳定 2 周后清理 `public/data/news_*.json` + `src/assets/News/**`（保留 git 历史）

## Blockers / Risks
- 当前阻塞：无。
- 风险 1（已处置 2026-05-05）：`8055` 端口公网暴露问题已通过 docker-compose ports 改为 `127.0.0.1:8055:8055` 完成收敛；`ss` 仅监听 127.0.0.1，公网 `curl 101.200.45.52:8055` 超时，宝塔反代 `https://cms.mint-bio.cn/server/health` 仍 200。
- 风险 2：若后续升级 Directus（当前 `11.14.1`，上游已 `11.17.4`）或重装容器，`www:www / 755-644` 权限会保持，但要注意升级 compose 时的 env 注入方式是否仍一致。
- 风险 3：若未来 Docker 网桥网段变化，`172.18.0.%` 的 MySQL 授权可能再次失效；首启稳定后可再评估是否改为更宽但受控的 host 策略。
- 风险 4：Directus 占位页曾因浏览器对早期 917 字节的 `index.html` 生成过 ETag 缓存而回显，非服务端问题；若日后出现类似"域名首页变静态页"需先排除浏览器/CDN 缓存。

## Next Actions
1. **Phase 4 全部完成** ✅（4A-4G + 数据脏修复 + 4H 双语放宽）
2. **Phase 5 数据已全量入库** ✅（48/48，0 错误，0 上传失败）。**【下次会话第一步】**：人工抽检 5 篇 PC+Mobile（id=48/1/11/19/30），按 README plan 5.3 验收清单。抽检通过后 Phase 5 闭环。
3. **Phase 5 收尾（不阻塞 Phase 6）**：用户按 P0/P1/P2 优先级在 Directus 后台手工补 `_en` 字段（前端 lang=en 走 fallback 中文不阻塞）；id=45 视频缺占位（pending_videos[45]）后续从公众号下载 mp4 → 放到 `public/video/News/202604/news45_video1.mov` → 后台编辑 news-45 加 raw block
4. **Phase 4 收尾长尾（可选，不阻塞 Phase 6）**：
   - **4.8 文本颜色高亮**：fork `dimitrov-adrian/directus-extension-editorjs-interface` + 集成 `editorjs-text-color-plugin@^2.0.4`，给运营 Word 风格调色盘（详见 plan 4.8 节落地步骤 + 验收标准）
   - cover/Block Editor Image 字段 Folder 细化 `news/{YYYY}/{MM}/`
   - Phase 3 残项 `/assets/*` CDN 缓存策略
5. **Phase 6 启动条件**：抽检通过后即可。直连 Directus REST 验证 + 输出契约文档 `news-api-contract_<date>.md` + 实现 4 个端点（latest/list/detail/categories）。
6. **关键依赖**：4.3 节 EditorJS 真实结构 + 5.2 节字段映射表 + 冻结映射表 + 6.0 节双语 fallback 策略 + 4.8 节颜色插件契约（如落地）= Phase 6/7 的契约基线。












## Execution Log
- 2026-03-22：完成新闻系统现状分析，确认新闻后台改造方向。
- 2026-03-22：完成 CMS 选型分析，确认采用最低可行版 `Directus + 现有阿里云服务器/数据库 + 工程外媒体目录 + 现有 CDN`。
- 2026-03-22：输出详细实施蓝图 `news-cms-mvp-blueprint.md`。
- 2026-03-22：补充确认现有环境使用宝塔面板，判断宝塔对方案为利好因素，并创建长期迁移执行追踪文件与专用技能。
- 2026-03-23：根据宝塔截图与服务器命令输出，确认现网站点为 `mint-bio.cn`，站点目录 `/www/wwwroot/mint-bio.cn`，宝塔本地 MySQL 为 `5.7.40`，现有库 `cooperate`。
- 2026-03-23：确认服务器当前未安装 `Docker`、`Node.js`、`npm`、`pm2`，根分区剩余约 `27G`；判定数据库可优先走“复用现有 MySQL + 独立新库”，部署则需先补运行时。
- 2026-03-23：根据宝塔“添加站点”界面，确认宝塔侧可创建 `cms.mint-bio.cn` 站点入口；根据系统命令确认服务器为 `Alibaba Cloud Linux 3.2104 U12.2`。
- 2026-03-23：确认当前无现成站点/数据库备份，因此将下一步优先级调整为“先补最小备份，再建站并安装 Docker”。
- 2026-03-23：`cms.mint-bio.cn` 站点与独立数据库已创建，但 `docker compose up -d` 拉取 `directus/directus:11.14.1` 时访问 `registry-1.docker.io` 超时；当前将 Phase 2 阻塞收敛为“先修复镜像拉取”。
- 2026-03-23：镜像拉取问题已解除，`mintbio-directus` 容器可启动；但本机执行 `curl http://127.0.0.1:8055/server/health` 返回 `Recv failure: Connection reset by peer`，当前将 Phase 2 阻塞收敛为“确认容器内 Directus 进程状态与宿主机 MySQL 连通性”。
- 2026-03-23：已在 MySQL 中确认 `mintbio_cms` 仅有 `127.0.0.1` / `localhost` 授权，并新增 `172.18.0.%` host 记录；当前剩余问题是本轮曾使用占位符密码，需要按 `docker-compose.yml` 的真实 `DB_PASSWORD` 再次执行 `ALTER USER` 或 `GRANT`，完成密码对齐后重启 Directus 复验。
- 2026-03-23：已完成密码对齐，`mintbio-directus` 当前处于 `Up`，`/server/health` 已从连接 reset 收敛为 `HTTP 503`；日志显示 `storage:local:responseTime in ERROR state`，错误为 `EACCES: permission denied, open '/directus/uploads/directus-health-file'`。
- 2026-03-23：宿主机已对 `uploads` / `extensions` 目录执行 `chmod -R 777`，且容器内 `touch /directus/uploads/.perm-test` 返回 `ok`；当前进一步怀疑固定健康文件 `directus-health-file` 存在历史权限残留，需要删除后只观察重启后的最新日志与健康检查结果。
- 2026-03-23：等待并清理后，本机 `curl -i http://127.0.0.1:8055/server/health` 已恢复为 `HTTP/1.1 200` 与 `{"status":"ok"}`；当前确认 Directus 服务本身可用，后续进入 `PUBLIC_URL` / `SECRET` 收口以及宝塔反向代理、HTTPS 配置阶段。
- 2026-04-22：Phase 2 收官 Part 1（HTTPS）：在宝塔 `cms.mint-bio.cn` 站点申请 Let's Encrypt 证书成功（R13，`notAfter=2026-07-21`），开启强制 HTTPS；`curl -I http://cms.mint-bio.cn/` 返回 `301 -> https://cms.mint-bio.cn/`。期间订正文档事实：环境描述由"腾讯云"改为"阿里云"，SKILL 与 plan 文档同步修正。
- 2026-04-22：Phase 2 收官 Part 2（反向代理新增）：确认之前"宝塔反代已做"的记忆是错的，`https://cms.mint-bio.cn/` 当时返回的是宝塔默认占位页（917 字节）。在宝塔站点反向代理面板新建 `directus` 反代指向 `http://127.0.0.1:8055`，`发送域名=$host`；验证后 `https://cms.mint-bio.cn/` 改为返回 `HTTP/2 302 Location: ./admin`、`x-powered-by: Directus`。
- 2026-04-22：Phase 2 收官 Part 3（反代头补丁）：新建 `/www/server/panel/vhost/nginx/extension/cms.mint-bio.cn/directus-extra.conf`，追加 `proxy_set_header X-Forwarded-Proto $scheme;` / `client_max_body_size 100M` / `proxy_read_timeout 86400` / `proxy_send_timeout 86400`；利用宝塔全局 `0.websocket.conf` 已定义的 `$connection_upgrade`，原生反代块里的 `Upgrade` / `Connection` 升级头自动生效。`nginx -t` 通过、`nginx -s reload` 成功。
- 2026-04-22：Phase 2 收官 Part 4（compose 收口）：备份 `/srv/mintbio/directus/docker-compose.yml`；用 Python 脚本在 `WEBSOCKETS_ENABLED` 行之后新增 `PUBLIC_URL: "https://cms.mint-bio.cn"`，并把 `SECRET` 从 16 字节占位符替换为 `openssl rand -base64 48` 生成的 64 字节随机串；`SECRET` 明文落盘至 `/root/mintbio-backups/directus-secret.txt`（`chmod 600`，root only），不入仓库。`docker compose up -d` 重建容器后，启动日志不再出现 `"SECRET" env variable is shorter` 与 `"PUBLIC_URL" should be a full URL` 两类 WARN，`GraphQL Subscriptions` / `WebSocket Server` / `Server started` 三条关键 INFO 均正常。
- 2026-04-22：Phase 2 收官 Part 5（目录权限收紧）：确认容器内 Directus 以 `uid=1000 gid=1000 (node)` 运行；宿主机 uid 1000 对应宝塔 `www` 用户（命名巧合，不影响安全边界）。`chown -R 1000:1000 + find -type d -exec chmod 755 + -type f -exec chmod 644` 后，目录由 `root:root 777` 收紧为 `www:www 755`；容器内 `touch /directus/uploads/.perm-test-*` 与 `extensions` 写测试均通过；本机与域名健康检查均 `200`。
- 2026-04-22：Phase 2 收官 Part 6（端到端验收）：`docker ps` = `Up`；三类 WARN 计数均为 `0`；容器内 `$PUBLIC_URL=https://cms.mint-bio.cn`、`$SECRET length=64`、`$WEBSOCKETS_ENABLED=true`；`https /` → 302、`https /admin/` → 200、`https /server/health` → 200、`http /` → 301；Let's Encrypt 证书 subject=`cms.mint-bio.cn`、issuer=`Let's Encrypt R13`、至 `2026-07-21`。浏览器端登录后台上传测试图片 `.png` 成功，右侧 Open in New Window 打开的直链为 `https://cms.mint-bio.cn/assets/<uuid>`（协议 + 域名正确），图片正常显示；宿主机 `uploads/` 新生成 `<uuid>.png` 与两份变换后的 `.avif` 缩略图，owner=`www:www`、mode=`644`。Phase 2 完全收官。
- 2026-05-05：Phase 4 设计基线敲定。与用户确认 8 项默认值：(1) 双语走字段并列 `*_zh/*_en`；(2) 正文走轻量 block（8 种），其中 `raw_html` 仅 Admin 可见作为逃生舱；(3) 仅 draft/published 不做定时；(4) 旧 URL 兼容靠 `legacy_id` 字段，前端路由 `/MiNTNews/:idOrSlug` 同时支持 slug 与 legacy_id；(5) 仅 Editor + Admin 双角色，不做审核流；(6) 媒体库按 `news/{YYYY}/{MM}/` 分目录，历史进 `news/_legacy/`；(7) 启用 Directus 自带 Activity & Revisions；(8) 字段必填校验完整列出。基线已写入 plan 文件 4.0–4.7 节，Phase 5/6/7 子任务同步细化（含迁移脚本步骤、读接口契约、`VUE_APP_USE_DIRECTUS` 灰度开关）。
- 2026-05-05：Step 1 / 风险 1 收口（8055 公网暴露收敛）。`/srv/mintbio/directus/docker-compose.yml` 已备份为 `.bak.<ts>`；`ports` 由 `"8055:8055"` 改为 `"127.0.0.1:8055:8055"`，`docker compose up -d` 重建容器，`Server started at http://0.0.0.0:8055`（容器内仍 0.0.0.0 正常）。验收：`ss -tlnp` 仅 `127.0.0.1:8055` 一条（IPv6 监听同步消失）；`curl http://127.0.0.1:8055/server/health` 200；`curl https://cms.mint-bio.cn/server/health` 200；`curl --max-time 5 http://101.200.45.52:8055/server/health` 超时。日志附带提示上游版本已到 `11.17.4`，下一步升级目标版本同步更新。
- 2026-05-05：Step 2 收官（Directus 升级 11.14.1 → 11.17.4）。备份目录 `/root/mintbio-backups/pre-upgrade-20260505-121448/` 含 6 项：`mintbio_cms.sql`（46K / 999 行 / Dump completed 完整尾标）、`docker-compose.yml.before-upgrade`、`directus-secret.txt`、`uploads-snapshot.txt`、`uploads-size.txt`（uploads 共 2.1M）、`image-id.txt`（11.14.1 sha256 留底）。`sed` 替换镜像版本，`docker compose pull` 85 秒拉完 9 层，重建后启动日志包含 4 条迁移：`Add AI Provider Settings` / `Add Collaborative Editing` / `Add Deployment` / `Add Deployment Webhooks`，全部 `Done` 无 ERROR。命令行验收：版本号 `11.17.4`、容器 `Up`、本机/反代 `/server/health` 双 200、公网 `8055` 仍超时、`grep -ciE "warn|error"` 计数 `0`。浏览器实测：登录 / File Library 老图 / 图片 transformation `?width=200` / 新图上传到 `www:www 644` / Settings 各页面全过。CMS 基础设施层全部稳定，进入业务建模窗口。
- 2026-05-05：Phase 4 推进至 4A/4B/4C 完工。**4A 媒体库 folder 树**（22 个）：`news` 顶层 + `news/_legacy` + `news/2024` + `news/2025/01-12` + `news/2026/01-05`，按字典序 `_legacy` 排在数字后属预期，不影响功能。**4B `news_categories` 集合**：UUID 主键 + 系统字段（status/sort/date_*）+ 业务字段 `slug`（Advanced 模式 + Regex `^[a-z0-9-]+$` + Unique）/ `name_zh` / `name_en` / `sort`（系统字段，列表拖动排序，编辑面板自动隐藏）；Status 枚举改为 `published/archived`，默认 `published`。校验测试 4 case 全过：正常保存、必填拒绝、Regex 拒绝、Unique 拒绝；保留 `company-news / 公司新闻 / Company News` + `industry-news / 行业动态 / Industry News` 2 条数据。**4C `news_articles` 集合**：UUID 主键 + 系统字段 6 项（含 created_by/updated_by 用于 Editor 权限）+ 第 1 批 5 字段（`legacy_id` Integer Unique 可空 / `slug` Advanced+Regex+Unique / `title_zh` / `title_en` / `publish_at` Datetime）+ 第 2 批 5 字段（`summary_zh` / `summary_en` Textarea / `cover` Image / `category` M2O / `featured` Toggle）+ 第 3 批 4 字段（SEO `seo_title_zh/en` Input + `seo_desc_zh/en` Textarea）。Status 枚举改 `draft/published`，默认 `draft`。**关键踩坑与解决**：(a) `cover` 字段 Required+取消 Nullable 与外键 `ON DELETE SET NULL` 冲突（MySQL 报 `Column 'cover' cannot be NOT NULL: needed in a foreign key constraint ... SET NULL`），采用备选 B：保持 Required+Nullable 留勾（数据库不硬约束、表单层 Required 拦截足够；写权限不开放公网，无实际风险）；(b) `cover` 字段 On Delete 改为 `Prevent the deletion`，保护已发布文章不丢图；(c) `category` Display Template 在 11.17 配在集合级别（Settings → Data Model → news_categories 顶部 Display Template）填 `{{name_zh}}`，后台列表显示 `公司新闻` 而非 UUID。集成测试 4 case 全过（完整保存、必填拒绝、category 中文显示、cover 关联）。归档点：进入 4D 但尚未开始建 Repeater；下一会话从 4D.1 起步（`content_blocks_zh` Repeater + 8 种 block 模板）。
- 2026-05-05：Phase 4 完成 4D（block 编辑器）。**方案演化路径**：原计划 Repeater + Conditions（8 种 block sub-field 按 type 显隐）→ 实测发现 Directus 11 Repeater 的 sub-fields 不支持字段级 Conditions（只有 5 个 tab：Schema/Field/Interface/Display/Validation，无 Conditions tab）→ 备选方案 A'（Repeater 全字段裸露 5 种 block）→ 备选方案 B（Builder M2A，5 个独立 block 集合）→ **最终方案 C：EditorJS Block Editor**（Directus 11.17 内置 Notion 风格块编辑器）。落地详情：`content_blocks_zh / content_blocks_en` 两个字段都用 Block Editor 接口，启用 9 种 toolbar block（Header / Paragraph / Image / List / Embed / Quote / Underline / Delimiter / Raw HTML），Root Folder=`news`，Required+Nullable 留勾。**实测产出真实 JSON 样本**（已写入 plan 4.3）：EditorJS 标准 `{ time, blocks: [{id, type, data}], version: "2.31.2" }` 结构，5 种 block 全部产出真实数据。**关键发现**：(a) List 实际类型是 `nestedlist` 而非 `list`，data 结构为 `items: [{content, items: []}]` 递归（Directus 11 默认装 NestedList 插件）；(b) Image 的 file id 路径是 `block.data.file.fileId`（不是直接的 `file_id`），同时 `data.file.url = /assets/<uuid>` 可直接拼 CDN；(c) Paragraph 的加粗斜体是 HTML 标签 `<b>/<i>` 内联在 `data.text` 里。**数据脏问题**（待 4E 前修）：(1) phase4-test-article 的 `slug` / `title_en` 头部混入 `\t` Tab 字符，Directus Regex 校验未拦截前缀空白；(2) `_seo_desc_en` 字段 Key 拼写多了下划线前缀，需删除重建为 `seo_desc_en`；(3) Content Blocks En 区目前是脏中文测试数据，可保留至 Phase 5 真迁移时清理。Block Editor 数据结构是 Phase 5 迁移脚本和 Phase 6 前端 mapper 的关键契约，已固化在 4.3 节。
- 2026-05-05：**Phase 4 完工收口**（4D 后修 + 4E 角色权限 + 4F 测试账号 + 4G 端到端验收 + 4H 双语放宽）。**4D 后修**：phase4-test-article 的 slug / title_en 头部 Tab 字符清理；`_seo_desc_en` 字段删除重建为 `seo_desc_en`。**4E Editor 角色 + Editor Policy**：宽松版权限矩阵（运营人数少，不细拆 Custom Access），news_articles 5 动作全允许 / news_categories 仅 Read（防误删分类破坏外键）/ directus_files CRUD（Block Editor 上传依赖）/ directus_folders CRU / directus_users Read / 系统集合走 App Access Minimum 默认。Policy 通过 Roles → Editor 关联。**4F 测试账号**：`editor-test@mint-bio.cn` 创建并绑定 Editor Role，密码 `Editor@2026`。**4G 端到端验收**：6 个 case 全过 —— Editor 登录看不见 Settings 写权限 / 能编辑 phase4-test-article / 能上传图片到 news folder / 能新建文章自动作者归属 / Activity & Revisions 显示 Editor / 改 schema 被禁。**4H 双语策略放宽**（用户决策）：原"中文+英文均必填"改为"中文必填 + 英文可空 + 前端 fallback 中文"。具体：`news_articles.title_en` 和 `news_articles.content_blocks_en` 改为 Nullable+取消 Required；plan 4.0/4.1/4.2/4.6/5.2/6.0 同步更新；新增 6.0 节双语 Fallback 策略，给出 Phase 7 前端 mapper 的 `pickLang(item, lang)` 实现伪代码。Phase 4 全部目标达成，进入 Phase 5（历史数据迁移）窗口。
- 2026-05-05：**Phase 5 入口契约冻结**。完整扫描 `public/data/news_list.json` + `news_1.json~news_48.json` 共 48 篇 + 详情样本 4 篇（id 1/3/11/45/48），结合 `MiNTNewsDetailSection.vue` 渲染契约（覆盖 `pic / nopaddingpic / desc / strongText / richHtml / quote[] / video+poster / headPic[] / footerPic[]` 全部字段形态），决策两项关键映射规则：(A) 分类扩展：旧 `company-news / industry-news` 2 条占位与源数据 4 类标签不匹配，需扩为 `mint-runtime / mint-product / mint-manufacturing / mint-vision` 4 条（含历史脏拼写 `#Mint`/`#MiNT 制造力` 归一化）；(B) 旧 content 字段 → EditorJS block 映射：`pic/nopaddingpic→image`（用 stretched 区分）/ `desc→paragraph` / `strongText→paragraph 保留 <span class> 内联 HTML` / `richHtml→raw` / `quote[]→quote+paragraphs+delimiter` / `video+poster→raw 内嵌 <video>`（视频文件保持站点静态 /video/News/*.mov 不上传 Directus）/ `headPic[0]→cover, headPic[1..n] 与 footerPic 转 image blocks`。两项决策写入 plan 5.2.1 / 5.2.2。最终冻结版映射表 [`.codebuddy/plans/news-migration-mapping_20260505.md`](./news-migration-mapping_20260505.md) 完整列出 48 篇逐条映射（slug=`news-<legacy_id>` / category / publish_at 标准化 ISO 8601 北京时间 / cover 来源含 14 篇 headPic 空 fallback / 4 篇含视频 1 篇视频缺占位）+ 媒体上传规则（图片去重、`news/_legacy/` 目录、`assets/images/*` 跨目录兼容）+ 双语缺失项清单（48 篇 _en 全空，i18n 规则禁脚本翻译，待用户按 P0/P1/P2 优先级补）+ 验收 5 抽检 case。Phase 5 下一动作：Directus 后台扩 `news_categories` → 编写 `scripts/migrate-news-to-directus.mjs`。
- 2026-05-05：**Phase 5 分类命名 v2/v3/v4 校正**。三轮迭代敲定最终命名：v2 提议复用工程已有 i18n key（slug=`mint-updates` / name_en=`MiNT Updates`）；v3 用户偏好"进行时=runtime"，slug 改 `mint-runtime`、i18n key 仍保留 `updates`，引入 mapper 解耦表；v4 用户进一步要求 name_en 也用 `MiNT Runtime`。考虑到工程 `src/` 内**无任何代码**引用 `news.categories.updates` 这个 i18n key（`grep` 验证），重命名零侵入，最终方案改为 slug ↔ i18n key 完全对称：`mint-runtime` ↔ `runtime`，`mint-products` ↔ `products`，`mint-biomanufacturing` ↔ `biomanufacturing`，`mint-vision` ↔ `vision`，前端 mapper 直接 `slug.replace(/^mint-/, '')` 即可，无需查表。同步落地：`src/i18n/modules/news/zh-CN.json` 与 `en-US.json` 把 `categories.updates` 重命名为 `categories.runtime`，文案 `#MiNT Updates` → `#MiNT 进行时` / `#MiNT Runtime`，并把 en-US.json sampleNews 4 处后缀 `MiNT Updates` 同步改为 `MiNT Runtime`。后台 4 条 `news_categories` 用户已建好（slug+name_zh+name_en：mint-runtime/MiNT 进行时/MiNT Runtime、mint-products/MiNT 产品力/MiNT Products、mint-biomanufacturing/MiNT 智造力/MiNT Biomanufacturing、mint-vision/MiNT Vision/MiNT Vision），sort=10/20/30/40，status=published。plan 5.2.1 / Current Status / Next Actions / 5.3 Todo 同步更新到 v4 终版。下一动作：编写 `scripts/migrate-news-to-directus.mjs`。
- 2026-05-05：**Phase 5 迁移脚本交付**。产出 `scripts/migrate-news-to-directus.mjs`（自包含 0 第三方依赖，Node 18+，660+ 行）严格按 plan 5.2 / 5.2.1 v4 / 5.2.2 / 6.0 + 冻结映射表实现：(1) `.env.migration` 加载 + DirectusClient 含 dry-run 模式；(2) MediaUploader 路径→file_id 缓存到 `scripts/.migration-cache/file-index.json`，自动查询 `news/_legacy` folder uuid，跨目录 `assets/{News,images}/*` 路径解析；(3) buildBlocks 转换源 9 种字段形态到 EditorJS（`pic→image stretched=false` / `nopaddingpic→image stretched=true` / `desc→paragraph 纯文本` / `strongText→paragraph 保留 <span class>` / `richHtml→raw` / `quote[]→delimiter+quote+paragraphs+delimiter` / `video+poster→raw 内嵌 <video> 兼容空 video 占位写入 pending_videos` / `headPic[0]→cover 单独抽出` / `headPic[1..n]+contents+footerPic 顺序拼装` / 14 篇无正文塞空 paragraph 兜底）；(4) 文章 payload 严格按 plan 4.2 + 5.2 v4（slug=`news-<legacy_id>`，publish_at ISO 8601 +08:00，`_en` 全 null，status=published，featured=false）；(5) 幂等控制 article-index.json 命中即跳过；(6) 增量报告 含 pending_videos / pending_no_content / pending_en_translations / category_distribution / error_log / uploader_stats / 时间戳。CLI 支持 `--dry-run` `--limit=N` `--ids=1,11,45`。配套交付 `scripts/MIGRATE-NEWS-README.md` 7 节文档（前置条件 / 命令 / 推荐 4 步执行流程 / 缓存与回滚 / pending 项 / 故障排查 / 项目铁律）。`.gitignore` 已加 `scripts/.migration-cache/`。`node --check` syntax pass、缺 env 友好报错验证通过、本机 Node v24.12.0 ≥ 18 兼容性确认。下一动作：用户配 Static Access Token + 写入 `scripts/.env.migration`，执行 README 4 步推荐流程。
- 2026-05-05：**Phase 5 dry-run + 真迁 3 篇验证迭代**。Step 1 全量 dry-run 第一轮报告暴露 4 类 bug：(1) 6 篇分类归一化失败（`#MiNT产品力` 无空格 / `MiNT 进行时` 缺 # / `#MiNT进行时` 无空格 等脏拼写未覆盖）；(2) id=34/35/36/37 误报 80 个 video 占位（fetch.mjs 抓取产物所有 content 项都填 `video:""` 占位字段，脚本 `if (item.video !== undefined)` 误判）；(3) dry-run 假 file_id `__dry-run-file-...` 污染了 file-index.json / article-index.json 缓存，会让下次真跑误命中跳过；(4) 2 张图源数据指错路径（news_2.json 引用 `news_2.jpg` 实际是 `.png`，news_25.json 引用 `news_7_2.png` 实际是 `news_7_2png.jpeg`）。修复：(a) `categoryLabelToSlug` 升级为"去 # + 移除所有空白 + 转小写"，alias key 改为无空格规范形式；(b) video 分支拆三种情况——真有视频走 raw block / 显式 `_note` 占位写 pending / 空字符串无 `_note` 完全忽略落到下面分支；(c) dry-run 模式下 `saveJsonCache` 跳过 file/article index 缓存写盘；(d) 直接修源 JSON 把两条错路径改对；(e) 同时给 MediaUploader 加 `failedPaths` 列表，进报告 `failed_uploads` 字段方便定位。第二轮 dry-run：48/48 全过、`error_log: []`、media 上传 362/失败 0、分类分布 32/8/4/4 = 48 ✅、pending_videos 仅 [45]。Step 2 真迁 3 篇（ids=1,11,45）也 3/3 成功。**但抽检发现 cover 设计问题**：原方案 `cover = sections[0].headPic[0]` 大量取到公共橙/蓝色装饰横幅 `new_head_*.jpg`（多篇共用同一张），与现有 `MiNTNewsList.vue` / `MiNTNewsTop.vue` 用 `news_list.json` 的 `pic` 字段（每篇独立配的主图）不一致。**修订决策（写入 plan 5.2.2）**：cover 来源改为 `listItem.pic` 优先 → fallback `headPic[0]`；同时 `headPic` 全部进正文 image blocks（不再单独抽 [0]）。通过 API DELETE 已迁的 3 篇 + 清空 article-index.json + 重跑 `--ids=1,11,45` 验证：3/3 成功，新 cover URL 检验对应 `news_1.png` / `news_11.jpg` / `news45_pic_2.jpg`（每篇独立主图），与前端列表页一致 ✅。
- 2026-05-05：**Phase 4.8 文本颜色高亮归档为长尾任务**（非本次实现）。Phase 5 真迁验收时发现：旧数据 `<span class='orange-text'>` 等内联色 HTML 在 Directus Block Editor 后台**视觉上不显示颜色**且**没有调色盘按钮**让运营选中文字改色（EditorJS 默认 paragraph 内联工具栏只 Bold/Italic/Underline/Link 4 个），但**数据保存原样不丢**（已 API 验证 P1/P3 hasSpan=true）。前端 `MiNTNewsDetailSection.vue` 用 v-html 渲染时 `.orange-text` / `.blue-text` / `.green-text` / `.blue-green-text` CSS 类样式 100% 生效。**用户反馈需要 Word 风格调色盘交互**，调研后选 npm 包 `editorjs-text-color-plugin@^2.0.4`（活跃维护，4+ 项目使用），落地路径需 fork `dimitrov-adrian/directus-extension-editorjs-interface` 加 5 行 EditorJS tools 注册代码 + 改 Directus extensions 目录 + 重启容器。归档为 plan 4.8 长尾任务（含候选方案对比 / 落地步骤 / 验收标准 / 暂时兼容策略）。**暂时兼容策略**：历史 48 篇当冷数据，运营不动；新文章用 Bold 替代色彩做强调；极个别需要色彩的文章切 Raw HTML 块手写 span。Phase 5 全量迁完后启动 4.8。
- 2026-05-05：**Phase 5 全量真跑完成 ✅**。最终命令 `node scripts/migrate-news-to-directus.mjs`（不带任何参数 = 全量真跑）一次成功。报告 `report-1777990658995.json`：attempted=48 / created=45 / skipped=3（id=1/11/45 已在前一轮真迁批次入库，本轮 article-index 命中跳过）/ failed=0；error_log=[]；media uploaded=344 + cacheHit=164 + failed=0；failed_uploads=[]；分类分布 runtime:30+products:8+biomanufacturing:3+vision:4=45（本轮新建 45 + 之前批次 3 = 48 ✅，之前批次 3 篇分布 runtime:2+biomanufacturing:1）；article-index size=48 ✅。pending_videos:[] 是预期行为（id=45 早批次已记入 report-1777989921402.json）；pending_no_content:[] ✅；pending_en_translations 累计 48 篇待运营按 P0/P1/P2 优先级人工补。Phase 5 数据全部入库，状态推进到 `data_loaded`，待人工抽检验收 5 篇 PC+Mobile（id=48/1/11/19/30，README plan 5.3 验收清单）后正式闭环。**已知遗留**：(1) id=45 视频缺占位，待用户从公众号下载 mp4 后在后台手工补 raw block；(2) 全部 48 篇 `_en` 字段空，前端走 fallback 中文不阻塞访问；(3) 4.8 颜色调色盘扩展待 Phase 5 闭环后启动。下次会话从抽检验收 5 篇起步。










