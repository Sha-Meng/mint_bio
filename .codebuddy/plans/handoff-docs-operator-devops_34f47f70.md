---
name: handoff-docs-operator-devops
overview: 调整为两阶段文档整理：第一阶段只梳理并产出 `doc/` 最终目录结构与各文档内容大纲，供用户人工确认；第二阶段在确认后再执行归档/删除/新建/重写文档。
todos:
  - id: update-plan-scope
    content: 更新计划为两阶段文档整合流程
    status: completed
  - id: produce-structure-outline
    content: 使用 [subagent:code-explorer] 产出目录结构和内容大纲确认稿
    status: completed
    dependencies:
      - update-plan-scope
  - id: verify-directus-boundary
    content: 使用 [skill:directus-bt-migration-coach] 复核 Directus 与运维配置边界
    status: completed
    dependencies:
      - produce-structure-outline
  - id: request-manual-confirmation
    content: 提交最终目录、大纲和旧文件处置清单等待确认
    status: completed
    dependencies:
      - verify-directus-boundary
  - id: rebuild-docs-after-confirmation
    content: 确认后新建、重写、归档和删除文档文件
    status: completed
    dependencies:
      - request-manual-confirmation
  - id: validate-doc-system
    content: 验证链接、过期说明、安全凭据边界和翻译规则
    status: completed
    dependencies:
      - rebuild-docs-after-confirmation
---

## User Requirements

- 统一整理现有 `doc/` 文档体系，解决目录混乱、内容过期、重复分散的问题。
- 以本次交接目标为最终目标，先梳理清楚最终目录结构和每份文档的写作内容，提交人工确认。
- 确认后再执行正式文档的新建、修改、归档和删除。
- 最终文档需要覆盖两类读者：
- 运营人员：只关注新闻更新、新闻编辑器使用、英文信息更新。
- 运维/开发人员：关注官网功能、页面实现、双语机制、英文开关、服务器、宝塔、域名、CDN、后台系统、账号凭据交接。
- 不再作为当前依据的旧资料需要归档或删除，避免误导后续人员。

## Product Overview

- 文档体系将重构为“当前正式文档”和“历史归档资料”两部分。
- 正式文档面向日常使用，路径清晰、内容可信、只保留当前有效流程。
- 归档区只保存历史参考资料，不作为运营或技术操作入口。
- 临时脚本、空文本、拆图缓存等无维护价值资料将从正式文档体系中移除。

## Core Features

- 输出最终 `doc/` 目录结构方案。
- 输出每份文档的目标读者、内容范围、章节大纲和信息来源。
- 输出旧文件处置清单：合并、归档、删除。
- 人工确认后再执行文档重构。
- 文档中不得写入真实密码、Token、Secret，只提供凭据交接模板和安全保管规则。
- 英文内容维护说明必须遵守翻译规则：仅使用已有中英对照资料或用户确认稿，不自行补译。

## Tech Stack Selection

- 文档格式：沿用仓库现有 Markdown 文档体系。
- 文档根目录：`doc/`。
- 计划记录：按项目 OpenSpec 规则，在 `.codebuddy/plans/` 下维护本次文档整合计划。
- 信息来源：
- 当前代码实现：`src/api/news.js`、`src/utils/language.js`、`vue.config.js`、`README.md`。
- 当前文档目录：`doc/`。
- Directus 迁移追踪：`.codebuddy/plans/directus-bt-migration-execution.md`。
- 历史翻译资料：`doc/zh-en/`。
- 交付方式分两阶段：
- 阶段一：只产出“最终目录结构和内容大纲确认稿”。
- 阶段二：在用户确认后，再执行文件新建、修改、移动、删除。

## Implementation Approach

- 采用“先审计、再设计、再确认、再落地”的方式，避免直接改写文档造成二次混乱。
- 阶段一重点产出一个可确认的文档重构方案，内容包括：
- 最终目录树。
- 每个正式文档的章节计划。
- 每个旧文档的处置方式。
- 风险边界与禁止项。
- 阶段二才执行实际文件操作：
- 新建正式文档目录。
- 归档历史资料。
- 删除临时产物。
- 重写总入口 `doc/index.md`。
- 写运营与运维开发文档。
- 旧的静态 JSON 新闻文档不再作为正式文档保留，应改为 Directus 新闻后台说明。
- 历史中英对照 docx 不删除，移动到归档区，作为后续英文翻译依据。
- 真实账号密码不进入仓库，技术文档只写凭据交接模板和安全管理规则。

## Implementation Notes

- 当前新闻模块已经固定使用 Directus 单一数据源，旧 `public/data/news_*.json` 流程必须标记为废弃或移出正式文档。
- 当前英文入口由 `src/utils/language.js` 中 `FEATURE_EN_ENABLED = false` 关闭，文档需明确“英文能力保留，但入口关闭”。
- 新闻英文内容和官网固定英文文案要区分：
- 新闻英文内容由 Directus `news_articles` 的 `_en` 字段维护。
- 官网固定英文文案由 `src/i18n/en-US.json` 和组件 `getText()` 维护。
- `doc/archive/` 是历史资料区，不作为当前操作入口。
- 删除对象仅限临时产物，不删除有历史价值的 PDF、docx 和旧技术资料。
- 执行阶段需避免覆盖当前已有未暂存变更，尤其是 `.codebuddy/plans/directus-bt-migration-execution.md`。

## Architecture Design

最终文档体系建议分为三层：

1. 文档总入口：

- `doc/index.md`
- 只保留当前有效导航。
- 明确正式文档、归档资料和废弃旧流程。

2. 正式文档：

- `doc/operations/`
- 面向运营人员，聚焦新闻和英文信息维护。
- `doc/ops-dev/`
- 面向运维开发人员，聚焦系统实现、部署配置和交接。

3. 历史归档：

- `doc/archive/update/`
- 历史更新需求资料。
- `doc/archive/zh-en/`
- 历史中英对照资料。
- `doc/archive/legacy-docs/`
- 旧版页面、架构、新闻、CDN 文档。

## Directory Structure

阶段一先产出确认稿，建议确认后的目标结构为：

```text
d:/UGit/mint_bio/
├── .codebuddy/
│   └── plans/
│       └── documentation-handoff_20260524.md
│           # [NEW] 本次文档整合计划与确认记录。
├── doc/
│   ├── index.md
│   │   # [MODIFY] 当前文档唯一总入口。
│   ├── operations/
│   │   ├── directus-news-guide.md
│   │   │   # [NEW] 运营新闻编辑器使用手册。
│   │   └── english-content-update.md
│   │       # [NEW] 运营英文信息更新说明。
│   ├── ops-dev/
│   │   ├── technical-overview.md
│   │   │   # [NEW] 运维开发技术总览。
│   │   ├── frontend-pages-and-i18n.md
│   │   │   # [NEW] 页面、路由、布局和双语机制说明。
│   │   ├── directus-news-integration.md
│   │   │   # [NEW] Directus 新闻前端集成说明。
│   │   ├── deployment-server-cdn.md
│   │   │   # [NEW] 部署、服务器、宝塔、Nginx、CDN、域名说明。
│   │   └── credentials-handoff-template.md
│   │       # [NEW] 凭据安全交接模板，不包含真实密码。
│   └── archive/
│       ├── update/
│       │   # [NEW] 历史官网更新需求资料。
│       ├── zh-en/
│       │   # [NEW] 历史中英对照资料。
│       └── legacy-docs/
│           # [NEW] 旧版正式文档归档。
└── README.md
    # [MODIFY OPTIONAL] 可选补充文档入口链接。
```

旧文件预期处置：

```text
归档：
- doc/aliyun-cdn-guide.md
- doc/update/updatedetail.pdf
- doc/zh-en/*.docx
- doc/architecture/
- doc/pages/
- doc/modules/news/

删除：
- doc/update/_updatedetail.txt
- doc/update/_extract_pdf.py
- doc/update/_render_pdf.py
- doc/update/_pages/*.png
```

## Key Code Structures

本任务不新增业务代码接口，但文档需要准确引用以下现有结构：

- `src/utils/language.js`
- `FEATURE_EN_ENABLED`
- `currentLanguage`
- `getText()`
- `switchLanguage()`
- `src/api/news.js`
- `/directus-api`
- `VUE_APP_DIRECTUS_URL`
- `VUE_APP_DIRECTUS_ASSET_URL`
- `news_articles`
- `news_categories`
- 英文字段 fallback
- `vue.config.js`
- `/api`
- `/directus-api`
- `/video`

## Agent Extensions

### Skill

- **directus-bt-migration-coach**
- Purpose: 复核 Directus、宝塔、Nginx、CDN、迁移追踪文件中的已确认配置与边界。
- Expected outcome: 文档大纲和后续技术文档中的 Directus 与运维配置说明和当前生产状态一致。

### SubAgent

- **code-explorer**
- Purpose: 核对现有 `doc/`、页面、路由、双语实现、新闻 API 和旧文档过期内容。
- Expected outcome: 最终目录结构、文件处置清单和文档大纲基于真实仓库内容，不臆造路径或实现。