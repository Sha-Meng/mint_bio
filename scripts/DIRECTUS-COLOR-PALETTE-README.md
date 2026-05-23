# Directus 新闻正文颜色方案说明

## 当前结论（2026-05-24）

正式技术选型已从“后台调色盘 / 自定义 Interface”调整为“短代码 + 前端渲染”。

- `news_articles.content_blocks_zh` / `content_blocks_en` 继续使用 Directus `11.17.4` 原生 `input-block-editor`。
- 不再把 `Editor.js Brand Palette` 或其他自定义调色盘 Interface 切到正式新闻字段。
- 运营在普通段落或引用文本中输入颜色短代码，由官网前端渲染为彩色文字。
- 旧新闻中已有颜色写法需要统一迁移为短代码，最终不保留多套作者写法。

## 为什么放弃调色盘 Interface

此前 `Editor.js Brand Palette` 已完成本地构建、服务器部署和测试字段验证；`palette_test.block` 中可以输入、选中文字、套用品牌色并保存刷新。

但在 `news_articles` 真实旧文章 / 测试文章场景中，编辑界面出现工具栏、转换菜单浮层错乱和选项不消失等 UI 兼容问题。因此当前结论是：

- **不要把 `news_articles.content_blocks_zh` / `content_blocks_en` 切到 `Editor.js Brand Palette`。**
- 正式新闻字段继续使用 Directus 原生 `input-block-editor`。
- 该扩展仅保留为历史研究材料，不作为运营正式编辑器。
- 如已临时切换正式字段，应回滚为 `input-block-editor`。

回滚 SQL：

```sql
UPDATE directus_fields
SET interface='input-block-editor'
WHERE collection='news_articles'
  AND field IN ('content_blocks_zh','content_blocks_en');
```

## 短代码写法

运营在 Directus Block Editor 的普通正文中输入：

```text
[color=#e75a29]重点文字[/color]
[color=#AABBCC]任意 HEX 颜色[/color]
[color=rgb(255,0,0)]RGB 红色[/color]
[color=rgba(255,0,0,0.8)]半透明红色[/color]
[color=hsl(210,80%,50%)]HSL 色值[/color]
[color=orange]品牌橙别名[/color]
```

推荐优先使用品牌色或 HEX 色值；自由色值必须通过前端白名单校验后才会渲染。

## 色值安全规则

允许：

- HEX：`#RGB`、`#RRGGBB`，如后续确认需要可扩展 `#RRGGBBAA`
- 受控函数色值：`rgb()`、`rgba()`、`hsl()`、`hsla()`
- 文档化品牌别名：`orange`、`blue`、`green`、`blue-green`

拒绝：

- `url()`
- `var()`
- `expression`
- 分号 `;`
- 额外 CSS 声明
- 未闭合、嵌套异常或非法色值短代码

非法短代码应按原文显示，不应生成破碎 HTML。

## 旧新闻统一迁移规则

旧新闻中的颜色作者写法需要统一转换为短代码：

| 旧写法 | 新写法 |
|---|---|
| `<span class="orange-text">text</span>` | `[color=#e75a29]text[/color]` |
| `<span class="blue-text">text</span>` | `[color=#2d5bf6]text[/color]` |
| `<span class="green-text">text</span>` | `[color=#74d887]text[/color]` |
| `<span class="blue-green-text">text</span>` | `[color=#6bbea9]text[/color]` |
| `<font color="#xxxxxx">text</font>` | `[color=#xxxxxx]text[/color]` |
| `<span style="color: ...">text</span>` | `[color=<规范化色值>]text[/color]` |

复杂 Raw HTML 或嵌套结构如果无法安全自动转换，应进入人工复核清单，不应由脚本猜测。

已确认排除项：`legacy_id=48` 的 `content_blocks_zh.blocks[18/21/24].data.html` 是特殊视觉设计 Raw HTML，保留原内联样式，不纳入本次短代码改造和零残留阻塞。

## 实施步骤

1. 前端新增短代码解析与渲染能力。
2. 在 `src/api/news.js` 的 paragraph / quote 映射阶段接入，必须在 `hasHtml()` / `desc` 分流前处理。
3. 使用 `scripts/normalize-news-color-shortcodes.mjs` 做 Directus 内容规范化：

   ```bash
   node scripts/normalize-news-color-shortcodes.mjs
   node scripts/normalize-news-color-shortcodes.mjs --ids=1,19
   node scripts/normalize-news-color-shortcodes.mjs --apply
   node scripts/normalize-news-color-shortcodes.mjs --audit-only
   node scripts/normalize-news-color-shortcodes.mjs --restore=scripts/.migration-cache/color-shortcode-backup-xxxx.json
   ```

   - 默认 dry-run：只统计可转换项、不可转换项、影响文章列表。
   - `--apply`：在脚本自动导出备份后写回 Directus。
   - `--audit-only`：仅检查当前 Directus 内容是否还残留旧颜色作者写法。
   - `--restore=<backup.json>`：用脚本自动备份 JSON 快速恢复被改文章的 `content_blocks_zh/en`。
   - 如存在复杂 Raw HTML / 嵌套结构，脚本会阻止 apply；除非明确传入 `--force-with-manual-review`，否则不会部分写入。

4. apply 前仍建议额外备份 Directus 数据库或至少确认脚本输出的备份 JSON。2026-05-24 本次写回备份：`scripts/.migration-cache/color-shortcode-backup-1779557861238.json`。
5. apply 后执行专项审计，要求 `news_articles.content_blocks_zh/en` 中不再残留：
   - `.orange-text/.blue-text/.green-text/.blue-green-text`
   - `<font color=`
   - `style=color` 颜色作者写法
   - 例外：`legacy_id=48` 三个特殊 Raw HTML 视觉块按用户确认保留。
6. 验证官网新闻详情页：短代码新内容、旧新闻改造结果、普通无颜色段落均正常。

## 验收清单

- [x] 短代码 `[color=...]...[/color]` 可在 paragraph / quote 中渲染为彩色文字。
- [x] 支持灵活安全色值，不接受任意 CSS 注入。
- [x] 非法、未闭合、嵌套异常短代码原样显示。
- [x] 旧新闻颜色 class / `<font color>` / `span style=color` 已统一转换为短代码。
- [x] 审计报告确认 Directus 新闻正文零残留旧颜色作者写法（排除 `legacy_id=48` 三个已确认特殊 Raw HTML 视觉块）。
- [x] 正式字段仍为原生 `input-block-editor`。
- [x] 官网新闻详情页验收通过（2026-05-24 用户确认）。
- [x] 旧 class / `<font color>` / 固定 `span style=color` 前端兼容样式已清理，仅保留 `.mint-color-shortcode`。

## 相关文件

- 迁移追踪：`.codebuddy/plans/directus-bt-migration-execution.md`
- 技能规则：`.codebuddy/skills/directus-bt-migration-coach/SKILL.md`
- 前端短代码工具：`src/utils/colorShortcode.js`
- 前端映射入口：`src/api/news.js`
- 前端详情渲染：`src/components/MiNTNews/MiNTNewsDetailSection.vue`
- 旧新闻规范化脚本：`scripts/normalize-news-color-shortcodes.mjs`
