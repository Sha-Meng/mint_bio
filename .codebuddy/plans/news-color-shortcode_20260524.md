---
name: news-color-shortcode
status: archived
archived_at: 2026-05-24
overview: 新闻正文颜色能力最终采用短代码方案，保持 Directus 11.17.4 原生 input-block-editor，不再使用自定义调色盘 Interface；旧新闻颜色作者写法已统一迁移并验收通过。
todos:
  - id: implement-shortcode-parser
    content: 新增 src/utils/colorShortcode.js 解析工具
    status: completed
  - id: wire-news-mapper
    content: 接入 src/api/news.js paragraph / quote 映射
    status: completed
  - id: normalize-legacy-colors
    content: 旧新闻颜色写法 dry-run / apply / audit
    status: completed
  - id: cleanup-legacy-compat
    content: 清理旧 class / font / inline style 前端兼容样式
    status: completed
  - id: archive-docs
    content: 更新 tracker、说明文档、skill 与验收结论
    status: completed
---

## User Requirements

- 放弃自定义 Directus 调色盘 Interface，改用短代码表达正文颜色。
- 短代码支持灵活安全色值，不限制为 4 个品牌色。
- 旧新闻中已有颜色 class、`<font color>`、`span style=color` 写法统一改造为短代码。
- `legacy_id=48` 的 3 个特殊 Raw HTML 视觉块保留原内联样式，不纳入本次改造。
- 改造完成后要有快速回退措施、专项审计和官网验收。

## Final Decision

正式路线：

```text
[color=<safe-color>]文字[/color]
```

示例：

```text
[color=#e75a29]重点文字[/color]
[color=#AABBCC]任意 HEX 颜色[/color]
[color=rgb(255,0,0)]RGB 红色[/color]
[color=rgba(255,0,0,0.8)]半透明红色[/color]
[color=hsl(210,80%,50%)]HSL 色值[/color]
[color=orange]品牌橙别名[/color]
```

不再作为正式路线：

- `Editor.js Brand Palette`
- `editorjs-text-color-plugin` 正式字段切换
- 基于 Directus 原生 `input-block-editor` 源码派生自定义 Interface
- 旧 `.orange-text` / `<font color>` / `span style=color` 作者写法

## Implementation Summary

- `src/utils/colorShortcode.js`
  - 负责短代码解析、色值白名单、HTML 转义、非法短代码原样回退。
- `src/api/news.js`
  - 在 paragraph / quote 映射阶段、`hasHtml()` / `desc` 分流前执行短代码转换。
- `src/components/MiNTNews/MiNTNewsDetailSection.vue`
  - 保留 `.mint-color-shortcode` 字重样式。
  - 已清理旧 `.orange-text/.blue-text/.green-text/.blue-green-text` 与 `font[color]` / `span[style*=color]` 兼容样式。
- `scripts/normalize-news-color-shortcodes.mjs`
  - 支持 `dry-run` / `--apply` / `--audit-only` / `--restore=<backup.json>`。
  - 内置 `legacy_id=48` 三个特殊 Raw HTML 排除项。
- `scripts/DIRECTUS-COLOR-PALETTE-README.md`
  - 记录最终方案、写回命令、审计命令和回退命令。

## Data Migration Result

Directus 写回：

```text
node scripts/normalize-news-color-shortcodes.mjs --apply
```

结果：

```text
articles=51
changed=29
manual=0
residues=0
```

报告：

```text
scripts/.migration-cache/color-shortcode-report-1779557864027.json
```

自动备份：

```text
scripts/.migration-cache/color-shortcode-backup-1779557861238.json
```

审计：

```text
node scripts/normalize-news-color-shortcodes.mjs --audit-only
```

结果：

```text
articles=51
changed=0
manual=0
residues=0
```

报告：

```text
scripts/.migration-cache/color-shortcode-report-1779557896436.json
```

再次 dry-run：

```text
changed=0 / manual=0 / residues=0
```

## Exclusions

保留以下特殊设计 Raw HTML：

```text
legacy_id=48
content_blocks_zh.blocks[18].data.html
content_blocks_zh.blocks[21].data.html
content_blocks_zh.blocks[24].data.html
```

这些块包含复杂内联布局与颜色，是文章视觉设计的一部分，不属于正文局部颜色作者写法。

## Rollback

如线上发现异常，可快速恢复本次被脚本改过的 29 篇正文 JSON：

```bash
node scripts/normalize-news-color-shortcodes.mjs --restore=scripts/.migration-cache/color-shortcode-backup-1779557861238.json
```

回退范围仅限：

- `news_articles.content_blocks_zh`
- `news_articles.content_blocks_en`

不会修改：

- schema / field / Interface
- 标题 / 摘要 / 分类 / 封面 / 发布时间 / slug
- 媒体文件

## Validation / Acceptance

- 短代码渲染验收通过。
- 旧新闻统一迁移验收通过。
- `legacy_id=48` 特殊 Raw HTML 保留验收通过。
- 官网新闻详情页验收通过（2026-05-24 用户确认）。
- 正式字段仍为 Directus `11.17.4` 原生 `input-block-editor`。
- 本地 `npm run build` 通过，仅有既有 warning。
- 新增 JS 定向 ESLint 通过。
