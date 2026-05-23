name: Directus 宝塔迁移执行追踪

overview:
- 目标：在现有阿里云 + 宝塔 + MySQL + CDN 环境中，分阶段完成 mint_bio 新闻模块向 Directus 后台的最低可行版迁移。
- 工作方式：长期维护本文件，每次执行前先读取，每次执行后更新当前阶段、进展、阻塞与下一步。
- 当前确认方案：`Directus + 现有阿里云服务器/数据库 + 工程外媒体目录 + 现有 CDN`。

todos:
- [x] 完成环境盘点与备份方案确认
- [x] 完成宝塔站点与 Directus 部署
- [x] 完成数据库与媒体目录配置（本地卷完成，`/directus-api/assets/*` CDN 缓存已生效）
- [x] 完成内容模型与权限配置
- [x] 完成历史数据迁移
- [x] 完成官网读接口适配
- [x] 完成前端切流与验收
- [x] 完成最终全站回归验证与切流后清理（2026-05-23 收官）


## Current Status
- **Phase 1 / Phase 2 / Phase 3 / Phase 4 / Phase 5 已收官**；**Phase 6 官网读接口适配已完成**；**Phase 7 生产切流已完成**；**Phase 8 最终回归与交接已收官**。官网新闻模块已固定为 Directus 单一数据源，旧静态 JSON / 旧新闻图片资源 / 旧 `VUE_APP_USE_DIRECTUS` 双轨开关与 fallback 逻辑已清理。
- **当前入口**：生产域名 `https://cms.mint-bio.cn`（DNS → 101.200.45.52 → 宝塔 Nginx → `127.0.0.1:8055` Directus `11.17.4` 容器）。
- **Phase 4 完工状态（2026-05-05）**：
  - 4A 媒体库 folder 树（22 个）✅
  - 4B `news_categories` 集合 ✅
  - 4C `news_articles` 集合（含 _seo_desc_en 字段命名修正）✅
  - 4D Block Editor（`content_blocks_zh/en` 两个 EditorJS 字段，9 种 toolbar block，实测产出真实 JSON 样本固化在 4.3）✅
  - 4E Editor 角色 + Editor Policy（宽松版权限：news_articles 全权 / news_categories 仅读 / directus_files CRUD / 系统集合 App Access Minimum）✅
  - 4F 测试 Editor 账号 + 4G 端到端验收 ✅
  - **4H 双语策略放宽**：`title_en` / `content_blocks_en` 改为可空，前端 lang=en 走 fallback 中文（plan 4.0/4.1/4.2/4.6/5.2/6.0 同步更新）✅
- **Phase 5 状态（2026-05-10）**：
  - 5.1 冻结版字段映射表 ✅（[`news-migration-mapping_20260505.md`](./news-migration-mapping_20260505.md)，48 篇逐条；2026-05-10 同步 cover v2 / id=30 校正）
  - 5.2.1 分类扩展 v4 终版（4 条 mint-runtime / mint-products / mint-biomanufacturing / mint-vision）✅，后台用户已建好
  - 5.2.2 EditorJS block 映射规则 ✅（含 cover v2 修订：listItem.pic 优先）
  - 5.3 迁移脚本 `scripts/migrate-news-to-directus.mjs` + README ✅；2026-05-10 修正 `summary_zh` 优先级，补 `listItem.overviewcontent`
  - **5.4 全量真跑完成**（report-1777990658995.json）：attempted=48 / created=45 / skipped=3 / failed=0；error_log=[]；media uploaded=344 + cacheHit=164 + failed=0；分布 runtime:32 / products:8 / biomanufacturing:4 / vision:4 = 48；article-index size=48 ✅
  - **5.5 全量结构审计完成** ✅：新增并执行 `scripts/audit-news-migration.mjs`，逐篇比对旧 JSON 与 Directus 48 篇的 slug/title/summary/category/cover/block 类型序列/image fileId/stretched/raw/html class；先发现唯一差异 id=19 `summary_zh` 未取 `news_list.overviewcontent`，已 PATCH 修正；最终报告 `scripts/.migration-cache/audit-report-1778387635035.json`：source=48 / directus=48 / errors=0 / warnings=0。
  - 5.6 抽检结论：id=48 的 `richHtml` 已作为 3 个 `raw` block 入库，后台 Block Editor 不一定视觉渲染 inline style / class，前端需在 Phase 7 渲染器用 `v-html` 保真；id=11 的 `nopaddingpic` 已审计为 14 个 `image.stretched=true`；id=30 不是“无正文 list 兜底”，源文件 `news_30.json` 实际存在完整正文与 15 张图，原抽检说明已校正。
  - 5.7 _en 字段缺失清单（48 篇全空，前端 fallback 中文不阻塞）⏳ 待运营按 P0/P1/P2 优先级人工补
- **Phase 4 收尾长尾**（不阻塞）：4.8 文本颜色高亮调色盘扩展（已归档候选方案 + 落地步骤）；上传默认目录动态路径模板。
- **当前运行方式**：`src/api/news.js` 已统一默认 Directus API/Asset 前缀为 `/directus-api`，并固定走 Directus REST；生产不显式配置 `VUE_APP_DIRECTUS_URL` 时也不会直连 `cms.mint-bio.cn`；旧静态 JSON fallback 已移除。





## Current Phase
- `phase_2_directus_deployment` = `done`
- `phase_3_database_and_storage` = `done`（本地卷已打通，`/directus-api/assets/*` CDN 长缓存与二次命中已验证）
- `phase_4_content_model_and_permissions` = `done` ✅（2026-05-05 完工，4A-4H 全部通过）
- `phase_5_data_migration` = `audited_passed`（48/48 入库；全量结构审计 errors=0 / warnings=0；id=19 摘要已修正）
- `phase_6_read_api_adaptation` = `done`（契约文档 + `src/api/news.js` + 首页/列表/详情读取适配已完成；Public 只读已生效；默认 API/Asset 前缀统一为 `/directus-api`；主站同源代理与 Directus 图片 CDN 缓存已验证；当前固定 Directus 单一数据源）
- `phase_7_frontend_cutover` = `production_cutover_done`（Directus 灰度、路由、视觉、后台发布流程验收已通过；用户已完成服务器备份与外网生产部署，生产站点已切到 Directus 版本）
- `phase_8_acceptance_handoff` = `done`（最终审计通过；旧静态数据 / fallback / 旧开关 / 冗余新闻资源已清理；迁移主线收官）






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
- [x] 记录现网回滚入口（2026-05-18 用户已完成服务器备份，保留上一版站点目录/上一版 dist 作为短期应急回滚入口）


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
- [x] 配置 `/directus-api/assets/*` 访问与 CDN 缓存（2026-05-10 已验证 transform 图片二次请求 CDN 命中）
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
- [x] **2026-05-10 完成：全量结构自测**。新增 `scripts/audit-news-migration.mjs`，比对 48 篇 Directus 数据与旧 JSON：文章数、legacy_id、slug、title、summary、category、status、publish date、cover file_id、block type 序列、image file_id 序列、`stretched` flags、raw 数量、inline class 保留。最新 `audit-report-1778395347338.json`：errors=0 / warnings=0。
- [x] **2026-05-10 完成：抽检问题修正**。id=19 `summary_zh` 已从错误的标题修正为 `news_list.overviewcontent` 长摘要；迁移脚本同步修复优先级：`detail.overviewcontent || listItem.overviewcontent || overviewtitle || title`。
- [x] **2026-05-10 完成：抽检说明校正**。id=48 的 `richHtml` 已入库为 3 个 raw block（含 inline style，非 `.orange-text`，后台视觉不代表前端最终效果）；id=11 的 `nopaddingpic` 由审计脚本确认 14 个 `image.stretched=true`；id=30 源文件实际有完整详情，不再作为“无正文 list 兜底”样例。
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


- [x] 确定接入方式：先直连 Directus REST（MVP），失败时回退旧静态 JSON；若 Public 只读权限不开放再补 Node BFF
- [x] 输出契约文档 `.codebuddy/plans/news-api-contract_20260510.md`
- [x] `fetchLatestNews(limit)` → 首页用；Directus mode 映射 `GET /items/news_articles?sort=-featured,-publish_at&limit=N`
- [x] `fetchNewsList({category, limit})` → 列表用；返回旧 `news_list.json` 兼容结构
- [x] `fetchNewsDetail(key)` → 详情用，支持 `legacy_id` 与 `slug`，并把 EditorJS blocks 转回旧组件可渲染的 `sections[].contents[]`
- [x] `fetchNewsCategories()` → 分类列表候选；当前页面仍保留旧固定分类，避免扩大改动面
- [x] 返回 JSON 结构与前端 `MiNTNews*` 现有 props 形状对齐；`VUE_APP_USE_DIRECTUS=false` 默认旧数据源
- [x] CORS / 缓存头：本地开发通过 `vue.config.js` 的 `/directus-api` 代理；生产主站 `/directus-api` 同源反代与 Directus 图片 CDN 缓存已验证；`src/api/news.js` 默认 API/Asset 前缀已统一为 `/directus-api`

- [x] 本地验证：`npm run build` 通过；`node scripts/audit-news-migration.mjs` 通过（audit-report-1778401120845.json，errors=0 / warnings=0）
- [x] 性能首轮优化：Directus 列表缩略图使用 `width=800&height=500&fit=cover&format=webp&quality=80`（典型封面从 711KB 降到约 33KB）；详情图片使用 `width=1200&format=webp&quality=85`；视频 poster 使用 `width=960&format=webp&quality=80`；详情页“更多动态”由全量 48 条降为最新 6 条；新闻卡片与详情图启用 `loading="lazy"`




### Phase 7 - 前端切流与验收

- [x] 引入运行时开关 `VUE_APP_USE_DIRECTUS=true|false`（`.env` 控制），默认 false
- [x] 改造 `src/api/news.js`：开关 true 时走 Phase 6 接口；false 走原 `public/data/*.json`；默认 Directus URL 统一为 `/directus-api`
- [x] 改造路由 `/MiNTNews/:idOrSlug`：支持 legacy_id 与 slug 查询
- [x] 首页 `MiNTNewsTop` 切新接口（PC + 移动端）
- [x] 新闻列表页切新接口（PC + 移动端）
- [x] 新闻详情页切新接口 + content_blocks 渲染器（PC + 移动端）
- [x] 验证 CDN `/directus-api/assets/*` 命中、WebP 转换正常
- [x] 验证 SEO：旧链接 `/MiNTNews/12` 仍可达；新链接 `/MiNTNews/<slug>` 工作（2026-05-17 路由回归通过）
- [x] 灰度：先开 `VUE_APP_USE_DIRECTUS=true` 部署到测试环境，48h 观察（2026-05-17 灰度复测通过）
- [x] 正式切流到生产（2026-05-18 用户确认服务器备份与外网部署完成）
- [x] 切流稳定后清理 `public/data/news_*.json` / `public/data/news_list.json` / `public/data/news_1.data` + `src/assets/News/**` 旧新闻资源（保留仍被详情页引用的 `Grid.png`，历史可从 git 恢复）

### Phase 8 - 最终回归验证与交接

> 目标：在正式切流前后，用可重复的全量数据审计 + PC/Mobile 视觉回归 + 回滚演练，证明新 Directus 数据源不会破坏旧页面展示效果。

#### 8.1 数据一致性回归

- [x] 每次 Phase 6/7 关键改动后运行 `node scripts/audit-news-migration.mjs`，要求 `errors=0 / warnings=0`（2026-05-17 最新 `audit-report-1779009545375.json` 通过）
- [x] 校验 48 篇：legacy_id / slug / title / summary / category / cover / block type 序列 / image fileId 序列 / `stretched` flags / raw HTML / inline class 保留（id=5/id=32 cover 已登记为人工优化 override）
- [x] 校验 Directus `/assets/<uuid>` 可访问，抽样图片 transformation（如 `?width=800&format=webp`）正常
- [x] 校验 Directus 图片 CDN 缓存：生产资源 URL 走 `www.mint-bio.cn/directus-api/assets/*`，图片 transform 响应为长缓存并可命中 CDN/浏览器缓存

- [ ] 校验 `_en` 字段为空时英文站点走中文 fallback，标题和正文不空白

#### 8.2 页面视觉回归（切流前）

- [x] 在 `VUE_APP_USE_DIRECTUS=false` 与 `true` 两套数据源下，对比首页新闻区、新闻列表页、新闻详情页 PC + Mobile（2026-05-17 用户复测通过）
- [x] 重点样例：id=48 richHtml 徽章 / id=1 视频 + `.orange-text` / id=11 多视频 + `stretched=true` 图片 / id=19 长摘要 / id=30 完整详情图文（2026-05-17 用户复测通过）
- [x] 验证 `paragraph` 的 `.orange-text/.blue-text/.green-text/.blue-green-text/.strong-text` 样式在前端 `v-html` 中生效（2026-05-17 用户复测通过）
- [x] 验证 `raw` block（视频、富 HTML）在前端渲染，不以 Directus 后台编辑器的视觉预览作为最终依据（2026-05-17 用户复测通过）

#### 8.3 路由、缓存与回滚

- [x] 旧链接 `/MiNTNews/<legacy_id>` 全部可达；新链接 `/MiNTNews/<slug>` 可达；不存在时有安全兜底（2026-05-17 用户确认路由回归通过）
- [x] 验证正式切流后不再依赖 `VUE_APP_USE_DIRECTUS=false` 旧包；旧静态 JSON fallback、旧构建开关、旧静态资源清理已列入切流后清理任务（2026-05-18 外网已切 Directus 版本）
- [x] 记录生产切流、回滚、CDN 刷新和 Directus 后台操作交接步骤（详见 `news-production-cutover_20260510.md`）
- [ ] 切流后 48h 观察无异常，再进入“稳定 2 周后清理旧静态数据 / fallback 逻辑 / 旧构建开关 / 冗余资源”的后续动作

#### 8.4 Directus 后台发布流程验收

- [x] 使用 Editor/Admin 账号测试新闻新增、编辑、删除/归档、草稿保存、发布流程（2026-05-17 用户确认验收通过）
- [x] 验证新建新闻的列表页、详情页、首页最新动态读取结果与发布状态一致（2026-05-17 用户确认验收通过）
- [x] 验证已发布新闻改为 draft/archived 后前端不再展示，恢复 published 后重新展示（2026-05-17 用户确认验收通过）
- [x] 验证上传图片、视频 raw block、图片封面、category、publish_at、featured 等字段在前端渲染符合预期（2026-05-17 用户确认验收通过）
- [x] 验证误删/误改的回滚路径：Directus Revisions、前端 `VUE_APP_USE_DIRECTUS=false` 回滚包、CDN 刷新步骤（2026-05-17 用户确认验收通过）

#### 8.5 全量客观 Review（2026-05-10 新增）

- [x] 基于旧静态数据源与 Directus 数据源完成 48 篇 PC/Mobile 实际效果对比与抽检问题修复（详见 2026-05-17 记录）
- [x] 对 `src/api/news.js`、新闻页面/组件、`vue.config.js`、迁移/审计脚本、切流文档做深度代码 review（P0/P1 已处理）
- [x] 修复或显式接受 review 中 P0/P1 项后完成正式生产切流；2026-05-23 补充最终审计与旧静态源清理

## Blockers / Risks



- 当前阻塞：无；Directus 迁移主线已收官。生产新闻模块已固定为 Directus 单一数据源；旧静态 JSON、旧新闻图片资源、`VUE_APP_USE_DIRECTUS` 双轨开关与失败 fallback 已移除。后续风险主要是 Directus/API/同源反代成为新闻模块运行必需依赖；短期回滚仍依赖服务器备份或 Git 历史恢复旧包。
- P0-1（已修复并灰度确认 2026-05-17）：新建 Directus 文章 `legacy_id=null` 时，首页/列表已可用 slug 进入详情。
- P0-2（已修复并灰度确认 2026-05-17）：历史文章改为 draft 后，Directus 模式详情页已确认不再 fallback 显示旧静态 JSON。
- 性能风险 0.9（已灰度复测，暂时接受 2026-05-17）：灰度站刷新后再次打开新闻仍感觉图片重新刷新。已替换 2 张超大 cover：id=5 从 `6240x4160` / 8.72MB 换为 `1440x960` / 51.1KB；id=32 从 `6732x4432` / 7.11MB 换为 `1945x1280` / 113.6KB。新 cover 的 transform WebP 分别约 18KB / 34KB，连续请求 `HIT TCP_MEM_HIT`；本地临时压缩图 `news-5.jpg` / `news-14.jpg` 已删除。进一步代码优化：详情正文图片统一加 `loading="lazy" decoding="async"`，详情封面加 `loading="eager" decoding="async" fetchpriority="high"`，视频加 `preload="metadata"`；`src/api/news.js` 增加浏览器 sessionStorage 30 秒短缓存（仅 Directus GET 成功响应，key 按 path+params 区分），减少刷新/跳转时重复拉新闻 JSON。用户已上传灰度包复测，暂时接受当前体感；服务端/CDN API 短缓存与前端 SWR 均暂不做，作为未来可选项。
- 风险 0（已收敛 2026-05-10）：Directus 后台 Block Editor 不等于最终前端渲染器；`raw` block / inline style / `.orange-text` 等在后台可能不显示最终视觉，但 API 数据完整。Phase 7 必须以前端 `v-html` 渲染和视觉回归为准。
- 风险 0.5（已收敛 2026-05-17）：匿名 Directus REST 已从 403 修复为 200；本地与生产均走 `/directus-api` 同源代理；`src/api/news.js` 默认 Directus API/Asset 前缀已统一为 `/directus-api`。
- 风险 0.6（已收敛 2026-05-10）：Directus assets CDN 缓存规则已配置，`/directus-api/assets/*` transform 图片响应头已变为 `Cache-Control: max-age=2592000`，二次请求出现 `X-Cache: HIT TCP_MEM_HIT`、`X-Swift-CacheTime: 2592000`，图片 CDN 缓存生效。
- 风险 0.7（已收敛 2026-05-10）：CDN 边缘 HTTPS 证书已部署，公网 `https://www.mint-bio.cn` / `https://mint-bio.cn` 首页、新闻 API、分类 API、图片 transform 均返回 200；`www` 与裸域的 `/directus-api/assets/*` 缩略图二次请求均可命中 CDN。
- 风险 0.8（已收敛 2026-05-10）：Directus raw video 中 poster 原始值为 `poster="/assets/<uuid>"`，前端旧归一化会把 transform query 拼到 `/assets/` 与 uuid 之间导致封面缺失；已改为按 uuid 正则重写为 `/directus-api/assets/<uuid>?width=960&format=webp&quality=80`。


- 风险 1（已处置 2026-05-05）：`8055` 端口公网暴露问题已通过 docker-compose ports 改为 `127.0.0.1:8055:8055` 完成收敛；`ss` 仅监听 127.0.0.1，公网 `curl 101.200.45.52:8055` 超时，宝塔反代 `https://cms.mint-bio.cn/server/health` 仍 200。



- 风险 2：若后续升级 Directus（当前 `11.17.4`）或重装容器，`www:www / 755-644` 权限会保持，但要注意升级 compose 时的 env 注入方式是否仍一致。
- 风险 3：若未来 Docker 网桥网段变化，`172.18.0.%` 的 MySQL 授权可能再次失效；首启稳定后可再评估是否改为更宽但受控的 host 策略。
- 风险 4：Directus 占位页曾因浏览器对早期 917 字节的 `index.html` 生成过 ETag 缓存而回显，非服务端问题；若日后出现类似"域名首页变静态页"需先排除浏览器/CDN 缓存。

## Next Actions
1. **Phase 1-5 基础设施 / 建模 / 历史数据迁移完成** ✅：48/48 入库；2026-05-23 最终审计 `audit-report-1779523427685.json` 为 errors=0 / warnings=0；期间发现 id=1 后台编辑导致缺 1 段 paragraph 且 `.orange-text` class 被剥离，已按源 JSON 恢复。
2. **Phase 6-7 官网读接口适配与生产切流完成** ✅：前端统一通过 `/directus-api` 同源代理读取 Directus REST；Public 只读、图片 transform、视频 poster 重写、CDN assets 缓存均已验证；生产外网已切到 Directus 版本。
3. **Phase 8 最终回归与切流后清理完成** ✅：`src/api/news.js` 已移除 `VUE_APP_USE_DIRECTUS` 旧双轨开关、静态 JSON 读取函数和 Directus 失败 fallback；新闻模块固定 Directus 单一数据源。
4. **旧资源清理完成** ✅：删除 `public/data/news_*.json` / `public/data/news_list.json` / `public/data/news_1.data`；删除 `src/assets/News/**` 中已迁移新闻图片，仅保留仍被详情页背景引用的 `Grid.png`；历史可从 Git 恢复。
5. **验证结论** ✅：`npm run build` 通过；`src/` 内已无 `/data/news_*`、`news_list.json`、`VUE_APP_USE_DIRECTUS` 或旧新闻资源运行时引用（除 `Grid.png`）。
6. **后续长尾（不阻塞主线）**：运营按需补 `_en` 字段；id=45 缺视频确认不再补；Directus 历史媒体目录 `news/_legacy` 保留；4.8 颜色调色盘、上传默认目录动态模板作为后续优化任务。

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
- 2026-05-10：**Phase 5 全量自测与抽检问题收口**。根据用户抽检反馈，确认：(1) id=48 `richHtml` 已在 Directus 中作为 3 个 `raw` block 保存，且包含 inline style；正文强调色 class 为 `blue-text`，非 `.orange-text`；后台 Block Editor 视觉预览不作为最终渲染依据，Phase 7 前端 `v-html` 回归验证为准；(2) id=11 `nopaddingpic` 已迁移为 14 个 `image.stretched=true`，通过 API/审计脚本核对，不要求运营在后台人工看 JSON；(3) id=19 `summary_zh` 确实错误取了标题，原因是迁移脚本只检查 `detail.overviewcontent`，漏了 `news_list.overviewcontent`。已修复 `scripts/migrate-news-to-directus.mjs` 优先级并 PATCH 线上 Directus id=19 摘要；(4) 新增 `scripts/audit-news-migration.mjs` 全量审计脚本，最终报告 `audit-report-1778387863746.json` 显示 48/48、errors=0、warnings=0；(5) 在 plan 增补 Phase 8 最终回归验证，要求页面切流前做数据审计 + PC/Mobile 新旧视觉对比 + 回滚验证。
- 2026-05-10：**Phase 6 官网读接口适配完成（默认关闭）**。新增契约文档 `.codebuddy/plans/news-api-contract_20260510.md`；新增 `src/api/news.js` 统一新闻读取层，支持 `fetchLatestNews` / `fetchNewsList` / `fetchNewsDetail` / `fetchNewsCategories`，用 `VUE_APP_USE_DIRECTUS=true` 切 Directus，默认 false 走旧静态 JSON；Directus 请求失败会 fallback 静态 JSON。已接入 PC/Mobile 首页、PC/Mobile 新闻列表、PC/Mobile 新闻详情；`getImageUrl/getVideoUrl` 增加绝对 URL 兼容。验证：匿名 REST 当前 403（需 Public Role 只读或 BFF 后才能灰度）、`npm run build` 通过、`node scripts/audit-news-migration.mjs` 最新报告 `audit-report-1778395347338.json` 为 errors=0 / warnings=0。
- 2026-05-10：**Phase 6 本地灰度问题修复**。用户本地开启 `VUE_APP_USE_DIRECTUS=true` 后出现 localhost → cms CORS，导致自动 fallback 静态 JSON；id=1 视频随后访问本地 `/video/News/...` 404。处理：`vue.config.js` 新增 `/directus-api` → `https://cms.mint-bio.cn` 开发代理、`/video` → `http://www.mint-bio.cn` 视频代理；`src/api/news.js` 开发环境默认 Directus URL 改 `/directus-api`，并把 Directus raw HTML 中 `https://www.mint-bio.cn/video/...` 规范化为同源 `/video/...`。验证：生产视频 HTTP 路径存在（`news1_video1.mov` 200，约 124.6MB）；`npm run build` 通过；最新数据审计 `audit-report-1778399670921.json` errors=0 / warnings=0。用户需重启 `npm run serve` 让代理生效。
- 2026-05-10：**Phase 7 本地回归性能首轮优化**。用户反馈 Directus 模式列表缩略图刷新慢、详情页打开慢。定位：列表卡片直接加载 Directus 原图（典型 cover `news_1.png` 约 711KB），详情页同时拉全量“更多动态”48 条并触发大量缩略图加载。处理：`src/api/news.js` 为列表/详情/poster 分别添加 Directus transform（列表缩略图典型降至约 33KB WebP）；`NewsCardPreview.vue`、`MiNTNewsDetailSection.vue`、`MiNTNewsDetailCom.vue` 图片增加 `loading="lazy"`。曾短暂把详情页“更多动态”限制为 6 条，用户指出不能改变逻辑和表现，已恢复为全量 `fetchNewsList()`。验证：`npm run build` 通过；最新数据审计 `audit-report-1778401120845.json` errors=0 / warnings=0。
- 2026-05-10：**今日归档停止点**。已将“Directus 图片支持 CDN”写入 Phase 7/8 与 `news-api-contract_20260510.md` 后续规划：生产建议 `www.mint-bio.cn/directus-api/assets/*` 同源代理到 `cms.mint-bio.cn/assets/*`，CDN 对带 query 的 transform 图片做长缓存，去除 `no-cache` 冲突并验证 CDN 命中。当前代码默认 `VUE_APP_USE_DIRECTUS=false`，不影响生产；本地 Directus 灰度仍需继续做 PC/Mobile 视觉回归。
- 2026-05-10：**继续推进：生产切流方案文档与默认同源代理收口**。用户确认本地 Directus 重点页面已通过。新增 `.codebuddy/plans/news-production-cutover_20260510.md`，记录生产 `/directus-api` 同源代理、Directus 图片 CDN、灰度构建变量、回滚和验收清单；`src/api/news.js` 默认 Directus URL 从环境区分改为统一 `/directus-api`，使本地与生产最终拓扑一致。验证：`npm run build` 通过；最新数据审计 `audit-report-1778419577520.json` errors=0 / warnings=0。用户已在宝塔主站配置 `/directus-api` 反代并在阿里云 CDN 部署 HTTPS 证书；公网验证 `https://www.mint-bio.cn`、新闻 API、分类 API、图片 transform 均 200。随后用户配置 `/directus-api/assets/*` CDN 缓存规则；二次验证缩略图/详情图均 `X-Cache: HIT TCP_MEM_HIT`、`X-Swift-CacheTime: 2592000`，Directus 图片 CDN 缓存生效。下一步进入 `VUE_APP_USE_DIRECTUS=true` 灰度构建与 Phase 8 最终回归。
- 2026-05-10：**灰度站缩略图缺失修复**。用户反馈部分新闻缩略图坏图，定位到 id=5（`news_5.jpg`，6240x4160，约 9.1MB）和 id=32（6732x4432）cover 原图过大，Directus 对其 `width/height` transform 返回 `400 ILLEGAL_ASSET_TRANSFORMATION`。修复：`src/api/news.js` 的列表/详情字段展开 `cover.id,width,height,filesize,type`，超过 `MAX_TRANSFORM_PIXELS=24000000` 的图片跳过 transform 直接用原图 URL，避免坏图；详情 image block 也改为携带 file 元信息判断。验证：模拟 48 篇 cover，id=5/id=32 fallback original，bad=0；`npm run build` 通过；最新审计 `audit-report-1778425643809.json` errors=0 / warnings=0。后续优化建议：在 Directus 后台把这两张超大 cover 替换为压缩版，以恢复 CDN transform 优化。
- 2026-05-10：**detail/1 视频封面缺失修复**。用户反馈 `detail/1` 视频缺少缩略图。定位：Directus 中 raw video 保存为 `poster="/assets/9d9e8575-a80c-436e-bdc0-ec91e591bc77"`，而 `normalizeRichHtml()` 旧实现通过 placeholder 拼前缀，实际会生成 `/directus-api/assets/?width=960&format=webp&quality=80<uuid>` 这类错误 URL。修复：`src/api/news.js` 改为按 quoted `/assets/<uuid>` 正则重写，输出 `/directus-api/assets/<uuid>?width=960&format=webp&quality=80`；视频源仍从 `https://www.mint-bio.cn/video/...` 规范化为同源 `/video/...`。验证：poster transform 资源 `https://www.mint-bio.cn/directus-api/assets/9d9e8575-a80c-436e-bdc0-ec91e591bc77?width=960&format=webp&quality=80` 返回 `200 image/webp`；`src/api/news.js` lints=0；Directus 灰度变量下 `npm run build` 通过。
- 2026-05-10：**id=32 详情页重复标题行修复**。用户反馈灰度站 id=32 标题下方多出一行同标题文案。定位：旧静态 `news_32.json` 的 `overviewcontent` 为空，迁移脚本曾把空摘要 fallback 为 `overviewtitle/title` 写入 `summary_zh`，Directus mode 前端再把 `summary_zh` 渲染到详情页 abstract，导致旧站没有的重复行。修复：`src/api/news.js` 增加 `normalizeSummary()`，当摘要为空或与标题完全相同时视为空摘要；`overviewtitle` 仍回退标题，`overviewcontent` 为空，保持旧站表现。同步修正 `scripts/migrate-news-to-directus.mjs`，未来迁移不再把标题写入空摘要字段。验证：`src/api/news.js` lints=0；`node --check scripts/migrate-news-to-directus.mjs` 通过；Directus 灰度变量下 `npm run build` 通过。
- 2026-05-11：**今日最终归档 / 默认构建验证 / 全量 review 入口**。用户确认抽检结束但尚未全量检查，要求补充新闻新增、编辑、删除/归档、草稿、发布流程测试项，并启动 subagent 做客观全量 review。已在 Phase 8 新增 8.4 Directus 后台发布流程验收、8.5 全量客观 Review；subagent 只读 review 结论：可进入最终全量回归，但不建议直接切生产，P0 为新文章 `legacy_id` 为空导致详情链接风险、旧 48 篇 draft/delete 后静态 fallback 仍可能展示；P1/P2 详见会话摘要。默认构建验证：清除 `VUE_APP_USE_DIRECTUS` / `VUE_APP_DIRECTUS_URL` / `VUE_APP_DIRECTUS_ASSET_URL` 后执行 `npm run build` 通过；代码层 `USE_DIRECTUS = process.env.VUE_APP_USE_DIRECTUS === "true"`，未设置环境变量时生产包仍走旧静态 JSON 数据源。
- 2026-05-17：**同源代理默认值与追踪状态修正**。按用户要求修正 2 项：(1) `src/api/news.js` 的 `DEFAULT_DIRECTUS_URL` 从生产直连 `https://cms.mint-bio.cn` 改为统一 `/directus-api`，使本地/生产默认拓扑与切流文档一致；(2) 同步本追踪文件：Phase 3 Directus 图片 CDN 缓存标记为完成，Phase 6 读接口适配与 CORS/CDN 收敛标记为完成，Phase 7 更新为灰度回归中。新增 review P0 处理方案：新文章链接改为 slug 优先；Directus 模式区分网络异常与业务未命中，业务 404/未发布不再 fallback 静态 JSON。
- 2026-05-17：**review P0 代码修复完成并灰度确认**。P0-1 新文章 `legacy_id=null`：`src/api/news.js` 为列表项补 `detailKey = slug || legacy_id`，静态列表补 `detailKey = slug || id`；`NewsCardPreview.vue`、PC/Mobile 首页新闻入口、列表 key 均改为 `detailKey/slug/id` 优先级，移动端详情页补 route param watch。用户已确认新建 `legacy_id=null` Directus 文章后，首页/列表可用 slug 进入详情。P0-2 draft/delete 后误 fallback：新增 `NewsNotFoundError` 与 `shouldFallbackToStatic()`，Directus 详情未命中、非 `published` 或 4xx 不再 fallback 静态 JSON，只有网络无响应或 5xx 才 fallback；PC/Mobile 详情页加载失败时清空旧 `configData`，避免继续展示上一条新闻。用户已确认把历史文章改为 draft 后，Directus 模式详情页不再 fallback 显示旧静态 JSON。当前新发现：刷新后再次打开新闻仍有图片/页面慢感，初步指向 API no-cache 与 id=5/id=32 超大 cover 原图回退。
- 2026-05-17：**超大 cover 替换完成**。用户提供压缩图 `D:\UGit\mint_bio\news-5.jpg`（1440x960 / 52,291B）与 `D:\UGit\mint_bio\news-14.jpg`（1945x1280 / 116,366B；对应旧数据 id=32 的 `assets/News/news_14.jpg`，不是 legacy_id=14）。已上传到 Directus 并替换 `news-5`、`news-32` 的 `cover`：新 file id 分别为 `b5215e42-9573-45a4-a56a-f3b626e26ea2`、`4a4b8dc5-806a-41d1-a888-296be91d683b`。生产同源 API 验证 cover 已更新；transform WebP `width=800&height=500&fit=cover&format=webp&quality=80` 返回 200，大小约 18KB / 34KB，连续请求 CDN 命中 `HIT TCP_MEM_HIT`。临时替换脚本与本地压缩图已删除。
- 2026-05-17：**详情刷新慢感优化包生成 / 本段归档**。按用户要求同时做两项优化：(1) 详情页图片加载优化：`MiNTNewsDetailSection.vue` 的 head/content/nopadding/quote/footer 图片统一 `loading="lazy" decoding="async"`；视频 `preload="metadata"`；`MiNTNewsDetailCom.vue` 的详情 cover 改 `loading="eager" decoding="async" fetchpriority="high"`。(2) `src/api/news.js` 增加 Directus GET 30 秒 sessionStorage 短缓存（path+params 维度，成功响应写入，过期自动清理），减少详情刷新/跳转时重复等待 no-cache API。相关文件 lints=0；`VUE_APP_USE_DIRECTUS=true npm run build` 通过；新灰度包 `dist-directus-gray-20260517-1643.zip`（112.43MB）已生成。注意：后台发布/draft/delete 最多可能有 30 秒前端缓存延迟。用户确认暂时只使用浏览器端短缓存，服务端/CDN `/directus-api/items/*` 短缓存作为未来可选项归档，当前不做；`gray.mint-bio.cn` 不在当前 CDN 账号中，灰度站发布后无需做 CDN 刷新，浏览器强刷/无痕验证即可。用户已上传灰度包复测，暂时接受当前状态，继续下一阶段。
- 2026-05-17：**Phase 8.1 数据一致性回归启动并通过**。执行 `node scripts/audit-news-migration.mjs` 初次发现 3 项：id=5/id=32 cover 与旧 `file-index` 不一致（为人工压缩替换，属预期），id=1 `orange-text` class 缺失（Directus 后台编辑后 paragraph class 被剥离）。已用定向脚本恢复 id=1 两处 `<span class='orange-text'>`，并在 `scripts/audit-news-migration.mjs` 增加 `ACCEPTED_COVER_OVERRIDES`（id=5 / id=32 新 cover file id），避免人工优化图被误报。复跑审计通过：`audit-report-1779009545375.json`，source=48 / directus=48 / errors=0 / warnings=0。生产同源接口抽检：新闻/分类 200；两张新 cover transform 200，WebP 18KB/34KB，长缓存可用。下一步进入 Phase 8.2/8.3 PC/Mobile 视觉、路由和回滚验收。
- 2026-05-17：**Phase 8.2 抽检问题归因、规则确认与修复完成**。用户抽检发现 4 类视觉问题：quote 左竖线仅第一段生效、详情页标题下方多出重复摘要块、head/footer 连续图片出现间隙、id=44 正文图片 transform 400。已生成全量扫描报告 `scripts/.migration-cache/phase8-issue-scan-1779011701101.json`：重复摘要候选 47 篇；多段 quote 受影响 3 篇（id=48/41/39）；head/footer 连续图间隙候选 41 篇；详情图片 transform 400 仅 1 处（id=44 block=2 file=`38955303-920a-41e7-94cf-b133cd58b902`）。图片组分隔最终规则已与用户确认：连续 Image block 视为一个图片组、组内无间隙；任意非 Image block 打断图片组；空/换行 Paragraph 不显示但作为图片组边界；旧 48 篇通过脚本在 head/content/footer 边界补空/换行 Paragraph；新文章运营如需分开图片组就插空段落/分隔，如需贴合就连续插 Image。Directus 测试文章 `test-null-legacy-article` 验证：纯空 text 会被清理，但 paragraph 文本为 `<br>...` 可持久化，因此脚本边界可用 `<br>` paragraph。已完成修复：批量清理无真实摘要的 `summary_zh`（仅 id=19 保留真实长摘要）；合并 id=48/41/39 的多段 quote 到单个 Quote block；为旧 48 篇按 head/content/footer 边界插入 `<br>` paragraph；为所有 image block 补齐 width/height/filesize/type 元信息；前端按连续图片组取消相邻 margin，`<br>` paragraph 仅作边界不显示；超大/超长图按像素与长宽比自动跳过 Directus transform；迁移脚本与审计脚本同步新规则。复跑审计 `audit-report-1779016311625.json`：source=48 / directus=48 / errors=0 / warnings=0。新灰度包 `dist-directus-gray-20260517-1901.zip`（112.43MB）已生成并上传复测；用户确认审查无问题，Phase 8.2 通过。
- 2026-05-17：**当前版本归档准备提交**。用户确认：id=45 缺视频不再补，保持当前无视频状态；历史媒体目录 `news/_legacy` 不移动、不整理，继续作为历史迁移资产；正式 Directus 源稳定后清理旧静态 JSON、旧资源、`VUE_APP_USE_DIRECTUS=false` 开关和 fallback 逻辑，保持新闻模块单一 Directus 数据源。
- 2026-05-17：**Phase 8.3 生产切流清单固化**。用户确认路由回归通过；`news-production-cutover_20260510.md` 更新为 ready-for-production-cutover-checklist，记录切流前备份、上线包 `dist-directus-gray-20260517-1901.zip`、生产同源代理/API/图片验证、CDN/浏览器刷新、15 分钟快速业务验收、48h 观察窗口、短期应急回滚策略。回滚不再以长期 `VUE_APP_USE_DIRECTUS=false` 双轨为目标，而是正式切流当天保留上一版站点目录/上一版 dist 作为应急恢复；切流稳定后进入旧静态 JSON/fallback/旧资源/旧开关清理。
- 2026-05-17：**Phase 8.4 Directus 后台发布流程验收通过**。用户确认新闻新增、编辑、删除/归档、草稿保存、发布后前端展示/隐藏链路均已验收；`news-production-cutover_20260510.md` 的验收清单同步标记完成。正式切流前剩余关键动作收敛为：保留上一版站点目录/上一版 dist 的短期应急回滚包，执行生产覆盖上线，并进入 48h 观察窗口。
- 2026-05-18：**切流前备份策略收敛**。用户确认服务器已完成现网站点目录备份，且 Git 已保留历史版本；本地临时备份目录不再作为长期归档、不提交到仓库，最终归档以服务器备份 + 本次 Git 提交版本为准。
- 2026-05-18：**生产切流完成并归档**。用户确认已完成服务器备份和网站部署，外网已切换到 Directus 版本。当前主线进入切流后 48h 观察窗口：重点观察首页/新闻列表/详情、`/directus-api` 4xx/5xx、图片 CDN 命中、Directus 后台发布/编辑/下线链路。短期回滚入口为切流当天保留的上一版站点目录/上一版 dist；稳定后进入旧静态 JSON、旧资源、fallback 逻辑和 `VUE_APP_USE_DIRECTUS=false` 开关清理；对应 Git 版本以本次归档提交为准。
- 2026-05-23：**Phase 8 收官 / Directus 单源化清理完成**。继续迁移时先跑最终审计，发现 id=1 因后台二次编辑导致 1 段 paragraph 缺失且 `.orange-text` class 被剥离；已用源 `public/data/news_1.json` 恢复该段与两处 orange 高亮，复跑 `node scripts/audit-news-migration.mjs` 通过：`audit-report-1779523427685.json`，source=48 / directus=48 / errors=0 / warnings=0。随后将 `src/api/news.js` 固定为 Directus 单一数据源，移除 `VUE_APP_USE_DIRECTUS` 旧双轨开关、静态 JSON 读取函数与 Directus 失败 fallback；删除 `public/data/news_*.json` / `news_list.json` / `news_1.data`，删除 `src/assets/News/**` 旧新闻资源并保留 `Grid.png`；清理 `MiNTNewsList.vue` 中旧静态图片注释。验证：生产同源新闻/分类 API 与 assets transform 返回 200；`npm run build` 通过；`src/` 内无旧静态新闻运行时引用。**清理后说明**：`scripts/audit-news-migration.mjs` 依赖已删除的旧 `public/data/news_list.json` 与 `news_*.json`，因此清理后再次运行出现 ENOENT 属预期；最终客观审计以清理前报告 `audit-report-1779523427685.json` 为准。用户确认旧链接兼容不再作为验收要求，其他线上验证均已通过。Directus 迁移主线收官，后续仅剩 `_en` 补文、4.8 颜色调色盘、上传默认目录动态模板等长尾优化。



