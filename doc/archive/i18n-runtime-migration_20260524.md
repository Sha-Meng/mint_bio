# 固定文案 Directus 运行时配置迁移记录（2026-05-24）

> 本文为历史追溯资料，不作为当前操作入口。当前有效流程见 `doc/operations/directus-i18n-guide.md` 和 `doc/operations/english-content-update.md`。

## 背景

固定文案原先主要来自前端本地 `src/i18n/zh-CN.json` / `src/i18n/en-US.json`，修改后需要重新构建部署；英文入口曾由源码常量控制。为方便运营搜索和修改，2026-05-24 将固定文案改为 Directus 运行时配置。

## 最终模型

### `site_i18n_entries`

字段：

- `key_path`
- `group`
- `label`
- `value_zh`
- `value_en`
- `enabled`

已确认不保留：

- `sort`
- `note`
- 复杂审核 / 审计 / 发布快照字段

### `site_i18n_settings`

字段：

- `feature_en_enabled`
- `content_version`

已确认不保留：

- `default_language`，默认语言固定为中文
- `cache_ttl_seconds`
- `site_i18n_releases`
- `site_i18n_audit_reports`

## 迁移执行结果

- 已创建 `site_i18n_entries`。
- 已创建 `site_i18n_settings`。
- 已配置 Public 只读权限。
- 已通过 `scripts/flatten-i18n.mjs` 从本地 i18n JSON 生成初始导入数据。
- 已导入初始固定文案。
- 已完成本地 `yarn serve` 验证：
  - `site_i18n_settings` 请求成功。
  - `site_i18n_entries` 请求成功。
  - 中文文案修改 + `content_version` 递增生效。
  - 英文入口开关生效。
- 已完成生产部署和复验：
  - 中文正常，无 `key_path` 裸露。
  - 文案修改 + `content_version` 递增生效。
  - 英文入口开关生效，验证后已按需恢复关闭。

## 当前有效规则

- 日常固定文案维护只在 Directus `site_i18n_entries` 中进行。
- 修改固定文案或英文入口后，必须将 `site_i18n_settings.content_version` 加 `1`。
- 英文入口由 `site_i18n_settings.feature_en_enabled` 控制。
- `value_en` 为空时回退中文。
- 新闻分类中英文切换不属于本次固定文案运行时配置范围。
