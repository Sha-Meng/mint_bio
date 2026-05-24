# 文档交接体系整合计划

## name

documentation-handoff_20260524

## overview

将现有 `doc/` 文档体系整合为面向当前交接目标的正式文档：运营只看新闻编辑与英文信息维护，运维/开发只看系统实现、配置、部署、Directus、CDN/域名与凭据交接。旧的过期资料统一归档或删除，避免继续误导。

## 当前阶段

- 阶段一：整理最终目录结构、文档内容大纲、旧文件处置清单，提交人工确认。
- 阶段二：在人工确认后，再执行新建、重写、归档、删除和链接验证。

## todos

- [x] 调整计划为两阶段执行。
- [x] 产出最终目录结构和内容大纲确认稿。
- [x] 复核 Directus / 宝塔 / CDN / 英文入口边界。
- [x] 提交确认稿，等待用户确认。
- [x] 确认后执行文档重构。
- [x] 验证文档链接、过期说明、安全凭据边界和翻译规则。

---

# 阶段一确认稿

## 1. 最终目录结构

确认后，`doc/` 建议整理为以下结构：

```text
doc/
├── index.md
├── operations/
│   ├── directus-news-guide.md
│   └── english-content-update.md
├── ops-dev/
│   ├── technical-overview.md
│   ├── frontend-pages-and-i18n.md
│   ├── directus-news-integration.md
│   ├── deployment-server-cdn.md
│   └── credentials-handoff-template.md
└── archive/
    ├── README.md
    ├── update/
    ├── zh-en/
    └── legacy-docs/
```

说明：

- `doc/index.md` 是当前正式文档唯一入口。
- `doc/operations/` 面向运营，只保留新闻和英文信息维护。
- `doc/ops-dev/` 面向运维/开发，覆盖实现、配置、部署和交接。
- `doc/archive/` 只放历史资料，不作为当前操作依据。
- `doc/archive/README.md` 用于说明归档区用途，避免后续误用旧资料。

---

## 2. 正式文档内容大纲

### 2.1 `doc/index.md`

目标读者：所有接手人员。

定位：唯一总入口，替代当前分散旧导航。

计划内容：

1. 文档状态说明
   - 当前有效入口。
   - `archive/` 仅作历史参考。
2. 项目当前状态摘要
   - Vue 3 / Vue CLI / `@vue/compat`。
   - 新闻模块已固定切到 Directus。
   - 英文入口当前关闭，i18n 能力保留。
3. 运营入口
   - 新闻编辑手册。
   - 英文信息维护说明。
4. 运维/开发入口
   - 技术总览。
   - 页面与双语机制。
   - Directus 新闻集成。
   - 部署、服务器、宝塔、CDN、域名。
   - 凭据交接模板。
5. 当前关键事实
   - Directus 后台：`https://cms.mint-bio.cn`。
   - 官网默认通过 `/directus-api` 读取 Directus。
   - 新闻不再读取 `public/data/news_*.json`。
   - 英文入口开关：`src/utils/language.js` 的 `FEATURE_EN_ENABLED = false`。
6. 归档区说明。
7. 禁止继续使用的旧说法。

信息来源：`README.md`、`src/api/news.js`、`src/utils/language.js`、现有 `doc/`、Directus 迁移追踪文件。

---

### 2.2 `doc/operations/directus-news-guide.md`

目标读者：运营人员。

定位：Directus 新闻编辑器使用手册。

计划内容：

1. 适用范围
   - 仅用于官网“发展动态 / 新闻”内容维护。
2. 登录入口与角色边界
   - 后台地址：`https://cms.mint-bio.cn`。
   - 运营只维护新闻内容和媒体，不修改数据模型、权限、接口配置。
3. 新闻字段说明
   - `title_zh` / `title_en`。
   - `summary_zh` / `summary_en`。
   - `cover`。
   - `category`。
   - `publish_at`。
   - `status`: `draft` / `published`。
   - `featured`。
   - `content_blocks_zh` / `content_blocks_en`。
4. 新增新闻流程
   - 创建文章。
   - 填中文必填字段。
   - 选分类。
   - 上传封面。
   - 编辑正文。
   - 保存草稿。
   - 发布。
   - 官网验证。
5. 编辑已有新闻流程
   - 修改字段。
   - 保存。
   - 等待前端短缓存过期或强刷验证。
6. 下线新闻流程
   - 优先改 `draft`。
   - 不建议随意硬删除。
   - 误改优先查 Activity / Revisions。
7. 正文 Block Editor 使用规则
   - Paragraph。
   - Header。
   - Image。
   - Quote。
   - NestedList。
   - Delimiter。
   - Embed。
   - Raw HTML 的使用边界。
8. 图片和媒体维护规则
   - 上传到合适 folder。
   - 当前不做自动默认目录，运营需人工选择。
   - `news/_legacy` 只作为历史迁移媒体目录。
9. 图片组和正文排版规则。
10. 颜色短代码
    - 推荐：`[color=#e75a29]重点文字[/color]`。
    - 可使用确认过的安全色值或品牌别名。
    - 禁止写任意 CSS、`url()`、`var()`、复杂内联样式。
11. 视频和 Raw HTML 说明
    - 一般运营不主动维护复杂 Raw HTML。
    - 视频仍涉及 `/video/News/...` 静态路径时需开发协助确认。
12. 发布后检查清单
    - 首页新闻。
    - 新闻列表。
    - 新闻详情。
    - PC / Mobile。
    - 封面、正文图片、视频、颜色短代码。
13. 常见问题。
14. 禁止事项。

信息来源：Directus 迁移追踪文件、`src/api/news.js`、历史迁移 README。

---

### 2.3 `doc/operations/english-content-update.md`

目标读者：运营人员、内容负责人。

定位：英文内容维护说明。

计划内容：

1. 当前英文状态
   - 英文入口当前关闭。
   - 英文能力和资源仍保留。
2. 两类英文内容的区别
   - 新闻英文内容：Directus 后台维护。
   - 官网固定英文文案：代码里的 `src/i18n/en-US.json` 维护，需要开发发布。
3. 新闻英文信息维护
   - `title_en`。
   - `summary_en`。
   - `content_blocks_en`。
4. fallback 规则
   - 英文字段为空时，英文模式回退显示中文。
   - 不补英文不阻塞中文站发布。
5. 翻译来源规则
   - 只能使用 `doc/archive/zh-en/` 的历史中英对照资料或用户确认稿。
   - 禁止根据上下文自行翻译。
6. 英文新闻发布前检查清单。
7. 英文入口恢复前的内容检查清单。
8. 常见问题。

信息来源：`src/utils/language.js`、`src/api/news.js`、`README.md`、项目 i18n 规则。

---

### 2.4 `doc/ops-dev/technical-overview.md`

目标读者：开发、运维、后续接手工程师。

定位：系统总览。

计划内容：

1. 项目概述。
2. 技术栈
   - Vue 3。
   - Vue CLI。
   - Vue Router。
   - Element Plus。
   - `@vue/compat`。
   - Axios。
3. 运行时结构
   - PC / Mobile 双版本。
   - Hash 路由。
   - Header / Footer / Contact。
4. 主要目录说明
   - `src/pages/`。
   - `src/components/`。
   - `src/api/`。
   - `src/i18n/`。
   - `src/utils/`。
   - `public/`。
5. 核心业务功能
   - 首页。
   - 生物智造。
   - 产品页面。
   - 企业介绍。
   - 愿景与责任。
   - 发展动态。
6. 新闻系统现状
   - Directus 单一数据源。
   - 旧静态 JSON 流程已废弃。
7. 构建与部署概览。
8. 交接注意事项。

信息来源：`doc/pages/`、`doc/architecture/`、`package.json`、`src/router/index.js`。

---

### 2.5 `doc/ops-dev/frontend-pages-and-i18n.md`

目标读者：前端开发、运维开发。

定位：页面、路由、布局和双语机制。

计划内容：

1. 路由机制
   - `createWebHashHistory()`。
   - PC / Mobile 路由分流。
2. 页面清单
   - `/`、`/home`。
   - `/bioIntelligent`。
   - `/corporate`。
   - `/vision`。
   - `/material`。
   - `/aminoAcid`。
   - `/knotWeed`。
   - `/mintNews`。
   - `/mintNews/detail/:configId`。
3. 页面与组件映射。
4. 全局布局
   - Header。
   - MobileHeader。
   - Footer。
   - Contact。
5. i18n 实现
   - `src/utils/language.js`。
   - `currentLanguage`。
   - `getText()`。
   - `switchLanguage()`。
   - `src/i18n/zh-CN.json`。
   - `src/i18n/en-US.json`。
6. 英文入口开关
   - 当前：`FEATURE_EN_ENABLED = false`。
   - 开启：改为 `true`，重新构建部署。
   - 影响：Header / MobileHeader 语言入口、`?lang=en`、`localStorage.language`。
7. 英文翻译维护规则。
8. 页面内容修改边界。

信息来源：`src/utils/language.js`、`src/components/Header/index.vue`、`src/components/MobileHeader/index.vue`、`src/router/index.js`、旧页面文档。

---

### 2.6 `doc/ops-dev/directus-news-integration.md`

目标读者：前端开发、后端/Directus 维护人员。

定位：Directus 新闻前端集成说明。

计划内容：

1. 当前状态
   - 新闻模块固定 Directus 单一数据源。
   - `isDirectusNewsEnabled()` 永远返回 `true`。
   - 旧 `VUE_APP_USE_DIRECTUS` 双轨开关已删除。
2. API 基础配置
   - 默认 `DIRECTUS_URL = /directus-api`。
   - `VUE_APP_DIRECTUS_URL`。
   - `VUE_APP_DIRECTUS_ASSET_URL`。
3. Directus 集合
   - `news_articles`。
   - `news_categories`。
   - `directus_files`。
4. `news_articles` 字段映射
   - `legacy_id`。
   - `slug`。
   - `title_zh/en`。
   - `summary_zh/en`。
   - `cover`。
   - `category`。
   - `publish_at`。
   - `featured`。
   - `content_blocks_zh/en`。
5. 分类映射
   - `mint-runtime`。
   - `mint-products`。
   - `mint-biomanufacturing`。
   - `mint-vision`。
6. 列表读取
   - `/items/news_articles`。
   - `status=published`。
   - `sort=-featured,-publish_at`。
7. 详情读取
   - 数字参数走 `legacy_id`。
   - 字符串参数走 `slug`。
8. Block Editor 到旧前端结构的 mapper
   - `image`。
   - `paragraph`。
   - `quote`。
   - `raw`。
9. Directus assets 和图片 transform。
10. 30 秒 `sessionStorage` 短缓存。
11. 英文 fallback。
12. 颜色短代码渲染。
13. 已废弃内容
   - 静态 JSON 新闻。
   - 旧新闻图片仓库资源。
   - `VUE_APP_USE_DIRECTUS`。
   - Editor.js Brand Palette 正式路线。
14. 排障。

信息来源：`src/api/news.js`、Directus 迁移追踪文件、颜色短代码计划。

---

### 2.7 `doc/ops-dev/deployment-server-cdn.md`

目标读者：运维、开发、后续部署人员。

定位：部署、服务器、宝塔、Nginx、CDN、域名配置说明。

计划内容：

1. 当前生产链路
   - 用户访问官网。
   - CDN / DNS。
   - 宝塔 Nginx。
   - Vue 静态站。
   - `/directus-api` 代理到 Directus。
2. 关键域名
   - 官网域名。
   - `https://cms.mint-bio.cn`。
3. Directus 运行入口
   - `cms.mint-bio.cn`。
   - `127.0.0.1:8055`。
   - Directus `11.17.4`。
4. 宝塔关注点
   - 站点配置。
   - Nginx 反代。
   - SSL。
   - MySQL。
   - 目录权限。
5. 推荐目录边界
   - Directus 服务目录。
   - 上传目录。
   - 备份目录。
   - 前端站点目录。
6. 前端构建部署
   - `yarn install`。
   - `yarn build`。
   - 部署 `dist/`。
7. 本地开发代理
   - `/api`。
   - `/directus-api`。
   - `/video`。
8. CDN / DNS 关注点
   - 静态资源缓存。
   - Directus assets 缓存。
   - HTML 短缓存。
   - 发布后缓存刷新。
9. 视频资源路径。
10. 备份与回滚
    - 前端 dist。
    - Directus 数据库。
    - Directus uploads。
    - 宝塔站点配置。
11. 常见故障排查
    - 官网新闻不更新。
    - Directus 访问失败。
    - 图片不显示。
    - CDN 缓存未刷新。
    - 联系表单异常。

信息来源：`vue.config.js`、Directus 迁移追踪文件、宝塔执行参考、`doc/aliyun-cdn-guide.md` 的可用历史信息。

---

### 2.8 `doc/ops-dev/credentials-handoff-template.md`

目标读者：项目负责人、运维、开发。

定位：凭据安全交接模板。

计划内容：

1. 安全原则
   - 仓库不保存真实密码。
   - 文档只保存凭据类型和交接规则。
   - 真实凭据使用密码管理器或线下加密方式交接。
2. 凭据清单模板
   - 服务器 SSH。
   - 宝塔面板。
   - Directus Admin。
   - Directus Editor。
   - MySQL。
   - 阿里云主账号 / RAM 子账号。
   - DNS / CDN。
   - 部署账号。
3. 每类凭据字段
   - 用途。
   - 登录入口。
   - 权限范围。
   - 保管人。
   - 保管位置。
   - 轮换频率。
   - 最近轮换时间。
   - 应急联系人。
4. 交接流程。
5. 离职 / 外包结束 / 权限回收流程。
6. Token / 私钥 / 静态访问令牌处理规则。
7. 禁止事项。

信息来源：安全边界要求、Directus 迁移过程中的账号类型。

---

### 2.9 `doc/archive/README.md`

目标读者：所有接手人员。

定位：归档区说明。

计划内容：

1. `archive/` 是什么。
2. `archive/update/` 放什么。
3. `archive/zh-en/` 放什么。
4. `archive/legacy-docs/` 放什么。
5. 归档资料不代表当前有效流程。
6. 如需恢复旧资料，必须先与当前代码和正式文档核对。

---

## 3. 旧文件处置清单

### 3.1 合并到新文档后归档

| 当前路径 | 处置 | 目标位置 |
|---|---|---|
| `doc/architecture/stack.md` | 合并有效内容后归档 | `doc/archive/legacy-docs/architecture/stack.md` |
| `doc/architecture/build-and-config.md` | 合并有效内容后归档 | `doc/archive/legacy-docs/architecture/build-and-config.md` |
| `doc/architecture/resource-management.md` | 合并有效内容后归档 | `doc/archive/legacy-docs/architecture/resource-management.md` |
| `doc/pages/*.md` | 合并页面结构后归档 | `doc/archive/legacy-docs/pages/` |
| `doc/modules/news/*.md` | 旧静态 JSON 新闻流程废弃，归档留痕 | `doc/archive/legacy-docs/modules/news/` |
| `doc/aliyun-cdn-guide.md` | 提炼可用 CDN/DNS 信息后归档 | `doc/archive/legacy-docs/aliyun-cdn-guide.md` |

### 3.2 直接归档

| 当前路径 | 处置 | 目标位置 |
|---|---|---|
| `doc/update/updatedetail.pdf` | 归档历史需求资料 | `doc/archive/update/updatedetail.pdf` |
| `doc/zh-en/*.docx` | 归档历史翻译资料 | `doc/archive/zh-en/` |

### 3.3 删除

| 当前路径 | 删除原因 |
|---|---|
| `doc/update/_updatedetail.txt` | PDF 临时文本抽取产物，内容无维护价值 |
| `doc/update/_extract_pdf.py` | 临时抽取脚本 |
| `doc/update/_render_pdf.py` | 临时渲染脚本 |
| `doc/update/_pages/*.png` | PDF 拆图缓存，不作为正式资料 |

---

## 4. 必须避免的过期说法

正式文档中禁止继续写：

- 新闻通过 `public/data/news_list.json` 和 `news_{id}.json` 更新。
- 新增新闻图片要放入 `src/assets/News/**` 后重新构建。
- 官网新闻仍有静态 JSON fallback。
- 仍通过 `VUE_APP_USE_DIRECTUS` 控制新旧数据源。
- 英文入口当前对外开放。
- 运营可自行翻译英文内容。
- Directus 正文字体颜色通过自定义调色盘 Interface 维护。
- 真实服务器/宝塔/数据库/Directus/CDN 密码可以写入仓库。

---

## 5. 已复核的当前事实

- Directus 后台入口：`https://cms.mint-bio.cn`。
- CMS 链路：DNS → `101.200.45.52` → 宝塔 Nginx → `127.0.0.1:8055` Directus `11.17.4`。
- 官网新闻固定通过 `/directus-api` 读取 Directus REST。
- `src/api/news.js` 默认 `DIRECTUS_URL = /directus-api`。
- 可选环境变量：`VUE_APP_DIRECTUS_URL`、`VUE_APP_DIRECTUS_ASSET_URL`。
- 新闻集合：`news_articles`。
- 分类集合：`news_categories`。
- 新闻详情支持 `slug` 和历史 `legacy_id`。
- 英文字段为空时 fallback 中文。
- 英文入口当前关闭：`FEATURE_EN_ENABLED = false`。
- 开启英文入口需要修改开关并重新 `yarn build` 部署。
- 本地开发代理：`/api`、`/directus-api`、`/video`。
- 真实凭据不得进入文档。

---

## 6. 阶段二执行结果

用户已确认执行完整整理，阶段二已完成：

1. 新建正式文档：
   - `doc/operations/directus-news-guide.md`
   - `doc/operations/english-content-update.md`
   - `doc/ops-dev/technical-overview.md`
   - `doc/ops-dev/frontend-pages-and-i18n.md`
   - `doc/ops-dev/directus-news-integration.md`
   - `doc/ops-dev/deployment-server-cdn.md`
   - `doc/ops-dev/credentials-handoff-template.md`
   - `doc/archive/README.md`
2. 重写入口：
   - `doc/index.md`
   - `README.md` 增加当前文档入口。
3. 归档旧资料：
   - `doc/architecture/` → `doc/archive/legacy-docs/architecture/`
   - `doc/pages/` → `doc/archive/legacy-docs/pages/`
   - `doc/modules/` → `doc/archive/legacy-docs/modules/`
   - `doc/aliyun-cdn-guide.md` → `doc/archive/legacy-docs/aliyun-cdn-guide.md`
   - `doc/update/updatedetail.pdf` → `doc/archive/update/updatedetail.pdf`
   - `doc/zh-en/*.docx` → `doc/archive/zh-en/`
4. 删除临时产物：
   - `doc/update/_updatedetail.txt`
   - `doc/update/_extract_pdf.py`
   - `doc/update/_render_pdf.py`
   - `doc/update/_extract.log`
   - `doc/update/_render.log`
   - `doc/update/_pages/*.png`
5. 验证：
   - 已确认正式文档和归档文件存在。
   - 正式入口为 `doc/index.md`。
   - 旧静态 JSON 新闻流程仅作为“废弃/禁止继续使用”说明出现，或保留在 `archive/legacy-docs/`。
   - 未写入真实密码、Token、Secret、私钥。
