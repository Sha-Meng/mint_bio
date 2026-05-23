---
name: directus-bt-migration-coach
description: >
  This skill should be used when the user is planning, executing, resuming, or troubleshooting
  the mint_bio news backend migration to a self-hosted Directus setup on Tencent Cloud with BaoTa
  (BT) panel. It covers BaoTa-based deployment, Nginx/site configuration, MySQL/database reuse,
  media directory setup, CDN integration, phased migration execution, news color shortcode handling,
  blocker handling, and long-term progress tracking across multiple sessions.
---

# Directus BT Migration Coach

## Purpose

Guide the step-by-step execution of the mint_bio news CMS migration under the confirmed MVP route. Reuse the same tracker file across sessions, keep the current phase explicit, and convert broad migration work into safe, reviewable milestones.

## When to Use

Trigger this skill when any of the following is true:

- The user wants to execute or continue the `Directus + 阿里云服务器/数据库 + 工程外媒体目录 + CDN` migration
- The user mentions `宝塔`, `BaoTa`, `BT 面板`, `Directus`, `Nginx`, `MySQL`, `CDN`, `部署`, `迁移`, `切流`, or `回滚`
- The user mentions Directus news body color handling, `[color=...]...[/color]` shortcodes, legacy `.orange-text` / `<font color>` / `span style=color` cleanup, or the paused editor color palette route
- The user asks for step-by-step deployment guidance, migration guidance, environment setup, or progress continuation
- The user wants to know what to do next in the migration or how to resume unfinished work

## Confirmed Baseline

Treat the following as the default confirmed baseline unless the user explicitly overrides it:

- Target route: `Directus` self-hosted on the existing Alibaba Cloud server
- Existing environment: BaoTa panel, existing websites, existing MySQL, existing CDN, existing domain(s)
- Media strategy: keep files outside the frontend repo, use Directus local storage on server disk, serve via CDN
- Frontend strategy: keep the current Vue site, switch runtime data source from static JSON to API
- Scope: focus on the news module MVP, not a general page builder or large content platform
- Cost constraint: avoid new subscription-based services
- Operation mode: browser-based maintenance for non-technical operators
- News color long-tail decision: keep Directus `11.17.4` native `input-block-editor`; use frontend-rendered color shortcodes for text color instead of deploying a custom editor palette Interface

## Required Files

Always use these files together:

- Tracker: `.codebuddy/plans/directus-bt-migration-execution.md`
- Blueprint: `.codebuddy/plans/news-cms-modernization_20260322.md`
- Execution reference: `references/baota-directus-playbook.md`
- Tracking reference: `references/tracker-maintenance.md`

## Workflow

Follow this workflow in order.

### Step 1: Read the Tracker First

Always read `.codebuddy/plans/directus-bt-migration-execution.md` before giving execution advice.

Extract at least:

- current phase
- completed tasks
- active blocker
- next planned action
- whether the user is asking for planning only or actual implementation

If the tracker does not exist, create it from the repository conventions and initialize the first phase.

### Step 2: Reconfirm the Current Execution Boundary

Before taking action, restate the current boundary in concrete terms:

- what phase is currently active
- what exact outcome is being targeted in this step
- what systems may be touched (`BaoTa`, `Nginx`, `MySQL`, `Directus`, `frontend`, `CDN`)
- what is explicitly out of scope for this step

Keep the step narrow. Prefer finishing one milestone at a time.

### Step 3: Prefer BaoTa-Friendly Execution Paths

When multiple deployment paths are possible, prefer the path that best fits BaoTa operations:

1. Reuse existing site/domain management in BaoTa
2. Reuse existing MySQL instance with an isolated database or schema
3. Use BaoTa-managed Nginx reverse proxy and SSL where practical
4. Use external upload directories, not paths inside the frontend project
5. Keep rollback easy by avoiding invasive changes to the current website until cutover time

### Step 4: Decompose the Work into Phases

Use the tracker’s phase model. Default phases are:

1. Environment inventory and backup
2. Directus deployment in BaoTa environment
3. Database and storage configuration
4. Content model and role configuration
5. Historical data migration
6. Read API / BFF adaptation
7. Frontend cutover
8. Acceptance, rollback verification, and handoff

If the user asks to jump ahead, allow it, but record the deviation in the tracker.

### Step 5: Execute or Guide with Concrete Checklists

For each milestone, provide concrete next actions, not abstract advice.

Examples:

- which BaoTa panel page to open
- which Nginx rule to add
- which environment variable to set
- which upload directory to create
- which collection/field to add in Directus
- which API endpoint to verify
- which frontend module to switch first

If a step cannot be completed from the repository alone, stop cleanly with a minimal operator checklist.

### Step 6: Update the Tracker Immediately

After each meaningful action, update `.codebuddy/plans/directus-bt-migration-execution.md`.

Always keep these sections current:

- current status summary
- current phase
- milestone checklist
- blockers / risks
- next actions
- execution log

Do not leave progress only in chat text.

### Step 7: Protect Rollback Safety

For any deployment or cutover step, explicitly record:

- what can break
- how to verify success quickly
- how to revert to the previous working state

Default rollback principle:

- keep old static JSON flow available until the new CMS flow is verified
- avoid deleting old data sources during the first cutover
- prefer configuration switches over destructive replacement

### Step 8: Handle News Color Shortcodes

When working on the 4.8 news body color long-tail task, use the confirmed shortcode route:

- Keep `news_articles.content_blocks_zh` and `content_blocks_en` on Directus native `input-block-editor`; do not switch them to `Editor.js Brand Palette` or another custom palette Interface.
- Treat previous custom Interface experiments as paused research only, because real `news_articles` editing showed toolbar / conversion menu floating-layer issues.
- Use `[color=<safe-color>]...[/color]` as the operator-facing syntax in normal paragraph / quote text.
- Support flexible but validated color values: HEX, controlled `rgb()/rgba()/hsl()/hsla()`, and documented brand aliases. Reject arbitrary CSS such as `url()`, `var()`, `expression`, semicolons, or extra style declarations.
- Render valid shortcodes in the frontend mapper before `desc` / `strongText` branching so colored text reaches the existing `v-html` path; leave malformed shortcodes visible as original text.
- Normalize old news content to the new shortcode form. Convert legacy `.orange-text`, `.blue-text`, `.green-text`, `.blue-green-text`, `<font color>`, and `span style=color` color semantics to `[color=...]...[/color]` instead of preserving multiple authoring formats.
- Require dry-run, backup, apply, and audit steps before writing normalized content back to Directus. The final audit must report zero legacy color authoring patterns in `news_articles.content_blocks_zh/en`, except explicitly documented manual-review exclusions.
- After data normalization and acceptance, remove frontend legacy color compatibility selectors and keep only the shortcode rendering path plus documented special Raw HTML exclusions.

## BaoTa-Specific Guidance

When BaoTa is present, assume the following adjustments:

- Use BaoTa site management for `cms` domain or subdomain setup
- Use BaoTa SSL management unless the user already has another certificate workflow
- Use BaoTa file manager only for light inspection; prefer explicit directory plans in docs
- Use BaoTa database management or existing credentials, but keep the CMS database isolated
- Use BaoTa-managed Nginx config as the main reverse proxy layer
- Record every BaoTa change in the tracker so that future sessions do not rediscover panel settings

## Communication Style for This Skill

- Keep each step small and operator-friendly
- State whether the current action is `查看`, `配置`, `验证`, `迁移`, or `切换`
- When manual BaoTa operations are required, present them as ordered steps
- When something depends on user-provided server access, stop at the exact boundary and record the blocker in the tracker

## Completion Criteria

The migration should only be treated as complete when all of the following are true:

- Directus is reachable through the planned BaoTa/Nginx path
- News content can be created and published by operators
- Media uploads no longer depend on the frontend build pipeline
- Frontend homepage/list/detail read from the new API path
- Rollback path has been tested or at least documented concretely
- Tracker file reflects the final state and remaining follow-ups
