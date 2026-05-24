---
name: handoff-docs-operator-devops
overview: 产出两份交接文档：一份面向运营，聚焦 Directus 新闻编辑器使用与英文版信息维护；一份面向运维/开发，系统说明官网功能、页面实现、双语机制、配置开关、服务器/宝塔/域名/CDN/Directus 配置与安全交接方式。
todos:
  - id: create-doc-plan
    content: 创建 `.codebuddy/plans/documentation-handoff_20260524.md` 记录文档方案
    status: pending
  - id: audit-current-docs
    content: 使用 [subagent:code-explorer] 核对页面、双语、新闻和现有文档
    status: pending
    dependencies:
      - create-doc-plan
  - id: verify-directus-ops
    content: 使用 [skill:directus-bt-migration-coach] 复核 Directus、宝塔、CDN 配置边界
    status: pending
    dependencies:
      - audit-current-docs
  - id: write-operator-guide
    content: 编写运营新闻编辑与英文信息更新文档
    status: pending
    dependencies:
      - verify-directus-ops
  - id: write-technical-guide
    content: 编写运维开发技术交接与配置文档
    status: pending
    dependencies:
      - verify-directus-ops
  - id: update-doc-indexes
    content: 更新 `doc/index.md` 和新闻模块旧文档导航
    status: pending
    dependencies:
      - write-operator-guide
      - write-technical-guide
  - id: validate-docs
    content: 检查文档准确性、安全凭据边界和过期说明清理
    status: pending
    dependencies:
      - update-doc-indexes
---

## User Requirements

- 产出两份面向不同读者的项目交接文档。
- 第一份为运营使用的更新文档，仅聚焦：
- 如何在 Directus 后台更新新闻相关信息，可作为新闻编辑器使用手册。
- 如何更新英文版信息，包括新闻英文标题、摘要、正文等内容维护方式。
- 第二份为运维/开发人员使用的技术文档，需详细说明：
- 官网总体功能、页面范围、各页面功能实现方式。
- 中英文版本实现方式，以及如何开启、关闭、配置英文版。
- 后台服务器、宝塔、域名、CDN、Directus 等部署与配置关注点。
- 服务器、宝塔、Directus、MySQL、CDN/DNS 等账号凭据的交接方式。

## Product Overview

- 文档服务于 mint_bio 官网 Directus 新闻后台上线后的运营交接与技术交接。
- 运营文档强调可操作、少技术术语、按步骤完成新闻维护和英文内容维护。
- 技术文档强调系统全貌、实现链路、配置边界、部署维护、安全交接和故障排查。

## Core Features

- 运营文档包含登录入口、新闻新增/编辑/发布、字段填写、图片上传、正文块编辑、颜色短代码、英文新闻字段维护、发布后验收清单。
- 技术文档包含项目页面地图、前端架构、新闻 Directus 数据流、双语机制、英文开关、构建部署、Nginx/宝塔/CDN/域名/Directus 配置、备份回滚、账号凭据安全交接模板。
- 文档不得写入真实密码、Token、Secret，只记录账号类型、权限、保管位置、交接流程和占位符。
- 翻译相关说明必须遵守项目 i18n 规则：只使用 `doc/zh-en/` 或用户确认提供的翻译内容，不自行补译。

## Tech Stack Selection

- 文档格式：优先采用 Markdown，沿用当前 `doc/` 目录的项目文档体系，便于版本管理、审阅和后续维护。
- 计划记录：按项目 OpenSpec 规则新增或更新 `.codebuddy/plans/` 下的文档产出计划。
- 信息来源：以已验证代码与现有文档为准，包括 `src/api/news.js`、`src/utils/language.js`、`vue.config.js`、`README.md`、`doc/`、`.codebuddy/plans/directus-bt-migration-execution.md`。
- 安全策略：技术文档只放凭据清单与保管规则，不落库真实账号密码或访问令牌。

## Implementation Approach

- 采用“先梳理事实源，再重写文档导航，再产出两份主文档”的方式完成。
- 运营文档以 Directus 后台实际操作流程组织，弱化代码细节，只保留新闻和英文信息维护所需步骤。
- 技术文档以系统链路组织：页面与路由、前端实现、Directus 数据模型、双语机制、部署配置、运维交接、安全边界、排障。
- 对现有过期静态 JSON 新闻文档进行更新或明确标记历史说明，避免运营继续按旧流程修改 `public/data/news_*.json`。
- 不新增复杂工具链，不改变业务代码；本任务主要是文档整理与已有文档导航修正。

## Implementation Notes

- 需特别修正旧文档中“新闻通过静态 JSON 维护、图片放入 `src/assets/News` 后重新构建”的过期描述。
- 文档中的 Directus 信息应以迁移追踪文件当前状态为准：生产入口 `https://cms.mint-bio.cn`，官网经 `/directus-api` 读取 Directus REST。
- 英文版说明需区分两类内容：
- 官网固定文案：由 `src/i18n/zh-CN.json`、`src/i18n/en-US.json` 与组件 `getText()` 维护。
- 新闻内容：由 Directus `news_articles` 的 `_en` 字段维护，空值时前端回退中文。
- 英文入口当前由 `src/utils/language.js` 中 `FEATURE_EN_ENABLED = false` 关闭；开启需改为 `true` 后重新构建部署。
- 凭据章节只能提供“账号类型、用途、权限范围、保管人、保管位置、轮换频率、应急联系人”等模板，禁止提交真实密码、Token、私钥。
- 计划执行前需注意当前工作区已有 `.codebuddy/plans/directus-bt-migration-execution.md` 未暂存修改，不应覆盖无关内容。

## Architecture Design

- 文档体系分层：
- `doc/index.md`：总入口，补充运营文档与技术交接文档导航。
- 运营文档：面向非技术运营，按后台操作任务编排。
- 技术文档：面向开发/运维，按系统模块和部署链路编排。
- 现有模块文档：新闻模块旧文档需要同步到 Directus 现状，或作为历史迁移资料降级引用。
- 技术文档中的核心链路：
- 用户访问官网页面。
- Vue 前端通过 `/directus-api/items/news_articles` 和 `/directus-api/items/news_categories` 读取数据。
- 宝塔 Nginx 将 `/directus-api` 代理到 Directus。
- Directus 使用 `news_articles`、`news_categories`、`directus_files` 承载新闻和媒体。
- CDN 对主站静态资源与 Directus 图片访问进行缓存加速。

## Directory Structure

```
d:/UGit/mint_bio/
├── .codebuddy/
│   └── plans/
│       └── documentation-handoff_20260524.md
│           # [NEW] 本次两份交接文档的 OpenSpec 计划文件。
│           # 记录需求、范围、任务拆解、验收标准、安全边界与最终验证结果。
├── doc/
│   ├── index.md
│   │   # [MODIFY] 更新文档导航。
│   │   # 增加运营更新文档、技术交接文档入口，并修正新闻数据源已切换 Directus 的过期说明。
│   ├── operations/
│   │   └── news-editor-and-english-update.md
│   │       # [NEW] 运营更新文档。
│   │       # 覆盖 Directus 新闻编辑、发布、媒体上传、正文块、颜色短代码、英文新闻字段维护和验收步骤。
│   ├── handoff/
│   │   └── technical-operations-guide.md
│   │       # [NEW] 运维/开发技术文档。
│   │       # 覆盖功能页面、实现架构、双语机制、英文开关、构建部署、宝塔/Nginx/CDN/Directus/账号安全交接。
│   └── modules/
│       └── news/
│           ├── overview.md
│           │   # [MODIFY] 将新闻模块总览从静态 JSON 流程更新为 Directus REST 流程。
│           ├── data-schema.md
│           │   # [MODIFY] 将数据结构更新为 Directus `news_articles`、`news_categories`、EditorJS blocks 字段说明。
│           └── how-to-add.md
│               # [MODIFY] 将新增新闻说明替换为 Directus 后台流程，或指向运营文档。
└── README.md
    # [MODIFY] 可选补充文档入口，保留英文入口恢复指引并链接到技术文档。
```

## Key Code Structures

- 本任务不新增业务代码接口。
- 文档需准确引用现有关键结构：
- `src/utils/language.js`：`FEATURE_EN_ENABLED`、`currentLanguage`、`getText()`、`switchLanguage()`。
- `src/api/news.js`：`VUE_APP_DIRECTUS_URL`、`VUE_APP_DIRECTUS_ASSET_URL`、`/directus-api`、Directus 字段映射、英文 fallback。
- `vue.config.js`：开发代理 `/directus-api`、`/video`。

## Agent Extensions

### Skill

- **directus-bt-migration-coach**
- Purpose: 复核 Directus、宝塔、Nginx、CDN、迁移追踪文件中的已确认配置与交接边界。
- Expected outcome: 技术文档中的 Directus 与运维配置说明和当前生产状态一致。

### SubAgent

- **code-explorer**
- Purpose: 系统核对项目页面、路由、双语实现、新闻 API、现有文档中的过期描述。
- Expected outcome: 文档中的路径、文件、配置、功能说明均基于真实代码和文档，不臆造。