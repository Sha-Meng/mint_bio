# 英文信息更新说明

> 面向运营和内容负责人。本文说明新闻英文内容、官网固定英文文案、英文入口开关和翻译来源规则。

## 1. 当前英文入口状态

英文入口改为通过 Directus 后台配置控制：

```text
site_i18n_settings.feature_en_enabled
```

关闭时：

- Header / MobileHeader 不显示语言切换入口。
- `?lang=en` 不会切换到英文。
- 如果浏览器本地曾保存英文偏好，会被重置为中文。

开启时：

- PC Header 显示语言切换。
- MobileHeader 显示 CN / EN 切换。
- `?lang=en` 生效。
- 用户语言偏好写入 `localStorage.language`。

## 2. 英文内容分两类

| 类型 | 维护位置 | 谁维护 | 是否需要重新构建前端 |
|---|---|---|---|
| 新闻英文内容 | Directus `news_articles` 的 `_en` 字段 | 运营可维护 | 不需要 |
| 官网固定英文文案 | Directus `site_i18n_entries.value_en` | 运营可维护 | 不需要；修改后更新 `content_version` |

本地 `src/i18n/zh-CN.json` 和 `src/i18n/en-US.json` 仍保留，但仅作为前端紧急 fallback，不作为日常运营入口。

## 3. 新闻英文内容怎么更新

进入 Directus 后台：`https://cms.mint-bio.cn`。

在 `News Articles` 中维护：

| 字段 | 说明 |
|---|---|
| `title_en` | 英文标题。 |
| `summary_en` | 英文摘要。 |
| `content_blocks_en` | 英文正文，使用和中文正文相同的 Block Editor。 |

操作建议：

1. 先确认已有正式英文稿。
2. 找到对应新闻。
3. 填写 `title_en`、`summary_en`。
4. 在 `content_blocks_en` 中录入英文正文。
5. 保存。
6. 如英文入口已开启，到 `?lang=en` 页面验证。

## 4. 新闻 fallback 规则

如果当前语言为英文：

- `title_en` 为空时显示 `title_zh`。
- `summary_en` 为空时显示 `summary_zh`。
- `content_blocks_en` 为空时显示 `content_blocks_zh`。

因此：

- 只发布中文新闻是允许的。
- 英文内容可以按优先级逐步补。
- 不补英文不会阻塞中文官网更新。

## 5. 官网固定英文文案怎么更新

官网固定文案包括：

- 导航菜单
- 首页固定标题/说明
- 页面模块标题
- 按钮文字
- 表单提示
- Footer / Contact 文案

维护位置：Directus `site_i18n_entries`。

常用字段：

| 字段 | 说明 |
|---|---|
| `group` | 分组，例如 `nav`、`home`、`footer`。 |
| `label` | 中文说明，方便运营搜索。 |
| `key_path` | 技术 key，例如 `nav.news`。 |
| `value_zh` | 中文文案。 |
| `value_en` | 英文文案；为空时前端回退中文。 |
| `enabled` | 是否启用。 |

操作流程：

1. 在 `site_i18n_entries` 中搜索 `group`、`label` 或 `key_path`。
2. 修改 `value_zh` 或已确认的 `value_en`。
3. 保存。
4. 打开 `site_i18n_settings`。
5. 更新 `content_version`，把整数版本号加 `1`，例如从 `1` 改为 `2`。
6. 用户刷新页面后，前端会检查新版本并加载新文案。

如果内容改错，直接改回文案并再次更新 `content_version`。

详细操作见：[Directus 固定文案配置指南](./directus-i18n-guide.md)。

## 6. 翻译来源规则

项目规则：**禁止自行翻译**。

英文内容只能来自：

1. 用户提供并确认的英文稿。
2. `doc/archive/zh-en/` 中已有的中英对照资料。
3. 其他经负责人明确确认的翻译资料。

如果某段中文没有对应英文稿：

- `value_en` 保持空值。
- 前端英文模式回退中文。
- 或等待用户提供英文。
- 不要根据上下文自行翻译。

## 7. 开启英文入口前检查

开启英文入口前，建议检查：

- `site_i18n_entries.value_en` 是否覆盖主要页面。
- Header / Footer / Contact 英文是否正确。
- 首页、产品页、关于我们、新闻页是否都有可接受的英文展示。
- Directus 新闻是否至少补齐重点新闻的 `title_en`、`summary_en`、`content_blocks_en`。
- 没有英文稿的内容是否允许回退中文。

## 8. 开启英文入口方式

在 Directus `site_i18n_settings` 中修改：

```text
feature_en_enabled = true
```

然后更新：

```text
content_version = 当前版本号 + 1
```

前端不需要重新构建。用户刷新页面后，PC / Mobile 语言入口会按后台配置显示。

如需临时关闭英文入口：

```text
feature_en_enabled = false
content_version = 当前版本号 + 1
```

## 9. 常见问题

### 英文入口关闭时还需要补英文吗？

不是必须。可以按内容优先级逐步补齐。

### Directus 英文字段为空会报错吗？

不会。新闻和固定文案都会回退中文。

### 运营还需要改 `src/i18n/en-US.json` 吗？

不需要。该文件只作为前端紧急 fallback，日常运营在 Directus 中维护。

### 可以用机器翻译先填吗？

不可以，除非用户明确确认该译文可用。

### 改了文案但刷新页面没变怎么办？

检查是否更新了 `site_i18n_settings.content_version`。只改 `site_i18n_entries` 但不更新版本号，前端可能继续使用旧缓存。

### 新增官网固定文案应该先改哪里？

先在 Directus `site_i18n_entries` 新增或修改对应 `key_path`。Directus 是固定文案唯一的日常维护入口。只有需要前端随包保底时，开发再把同 key 同步到本地 `src/i18n/zh-CN.json` 和 `src/i18n/en-US.json`。不要只改本地 JSON 后上线。
