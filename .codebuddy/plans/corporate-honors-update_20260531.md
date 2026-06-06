# 荣誉墙文案与排序更新

## name
corporate-honors-update

## overview
更新企业概况页荣誉墙 12 项文案与展示顺序。固定文案遵循 Directus-first：先维护 `site_i18n_entries`，有实际变化时递增 `site_i18n_settings.content_version`，并同步本地 `src/i18n/*.json` 作为接口异常时的 fallback。

## todos
- [x] 确认荣誉墙 PC / Mobile 均读取 `corporate.honors` 数组
- [x] 明确最终排序、分行方式与年份标点
- [x] 新增 Directus dry-run/apply 脚本
- [x] 同步本地 i18n fallback
- [x] 运行 Directus dry-run
- [x] 执行 Directus apply 并复查 dry-run
- [x] 完成 JSON / i18n 验证
- [x] 2026-06-06：将“杭州市准独角兽榜单企业（2023–2026）”年份拆到第三行显示

## User Requirements
- 将“西湖区英才A类项目”替换为“国家高新技术企业”。
- 将“杭州市准独角兽榜单企业”替换为“杭州市准独角兽榜单企业（2023–2026）”。
- 将“杭州市准独角兽榜单”替换为“浙江省未来独角兽企业”。
- 按用户提供顺序重排 12 项荣誉。
- 第一项严格存为 `line1: ""`、`line2: "国家高新技术企业"`；其它项按地域前缀与荣誉名分行。
- 2026-06-06：荣誉墙中“杭州市准独角兽榜单企业（2023–2026）”卡片内容过长，要求年份单起一行。

## Product Overview
荣誉墙位于企业概况页，PC 组件 `CorporateVision` 与移动端组件 `CorporateVisionMobile` 都通过 `getText('corporate.honors')` 读取数组，并用 `HonorCard` 渲染 `line1` / `line2`；2026-06-06 起，`HonorCard` 支持可选 `line3`，用于个别长标题的第三行展示。

## Implementation Approach
- 新增 `scripts/update-corporate-honors.mjs`，沿用现有 Directus 脚本模式：
  - 默认 dry-run，只输出待创建、待更新的 key。
  - `--apply` 时写入 `site_i18n_entries`。
  - 仅在存在 create/update 时递增 `site_i18n_settings.content_version`。
- 更新 `src/i18n/zh-CN.json` 和 `src/i18n/en-US.json` 的 `corporate.honors` fallback；英文不自行翻译，继续使用中文占位。
- 2026-06-06：扩展 `HonorCard` 为可选三行渲染；PC / Mobile 的 `corpList` 透传 `line3`；Directus 脚本仅为存在 `line3` 的荣誉项写入第三行 key。

## Key Code Structures
目标 Directus keys 原为 `corporate.honors.0.line1` 到 `corporate.honors.11.line2`，共 24 个 leaf entries；2026-06-06 后增加 `corporate.honors.5.line3`，共 25 个 leaf entries。

最终数组：

```js
[
  { line1: "", line2: "国家高新技术企业" },
  { line1: "浙江省", line2: "“科技新小龙”" },
  { line1: "浙江省", line2: "企业研究院" },
  { line1: "浙江省", line2: "专精特新中小企业" },
  { line1: "浙江省", line2: "未来独角兽企业" },
  { line1: "杭州市", line2: "准独角兽榜单企业", line3: "（2023–2026）" },
  { line1: "浙江省", line2: "创新型中小企业" },
  { line1: "浙江省", line2: "科技型中小企业" },
  { line1: "杭州市高新技术", line2: "企业研发中心" },
  { line1: "杭州市", line2: "新雏鹰企业" },
  { line1: "杭州市西湖区", line2: "高校经济新锐企业" },
  { line1: "西湖区", line2: "高校经济标杆项目" },
]
```

## Validation / Acceptance
- [x] Directus dry-run 只涉及 `corporate.honors.*` 24 个 keys：`creates: 0`、`updates: 24`。
- [x] Directus apply 已更新 24 个 keys，并将 `site_i18n_settings.content_version` 从 `33` 递增到 `34`。
- [x] Directus apply 后再次 dry-run 显示 `creates: 0`、`updates: 0`。
- [x] 本地 `src/i18n/zh-CN.json` 与 `src/i18n/en-US.json` 解析通过，`corporate.honors` 均为 12 项。
- [x] `node scripts/audit-i18n-simple.mjs` 执行通过；输出仍包含项目既有的未确认英文值与可能硬编码中文提示，非本次新增阻塞。
- [ ] 浏览器人工验收 PC / Mobile 荣誉墙视觉显示。
- [x] 2026-06-06：Directus dry-run / apply / 复查完成，`corporate.honors.5.line3` 生效。
- [x] 2026-06-06：本地 JSON 解析与生产构建通过。
