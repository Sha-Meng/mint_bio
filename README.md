# mint_bio

元素驱动官网前端项目。

## 文档入口

当前有效交接文档见：

- [doc/index.md](./doc/index.md)

其中包含：

- 运营新闻编辑手册
- 英文信息更新说明
- 运维/开发技术文档
- Directus、部署、CDN、凭据交接说明

历史资料已归档到 `doc/archive/`，不作为当前操作依据。

## Project setup

```bash
yarn install
```

## Compiles and hot-reloads for development

```bash
yarn serve
```

## Compiles and minifies for production

```bash
yarn build
```

## Lints and fixes files

```bash
yarn lint
```

## 英文入口控制

英文入口通过 Directus 后台控制。

开启英文入口：

```text
feature_en_enabled = true
content_version = 当前版本号 + 1，例如从 1 改为 2
```

关闭英文入口：

```text
feature_en_enabled = false
content_version = 当前版本号 + 1
```

用户重新打开或强制刷新页面后：

1. Header / MobileHeader 的语言切换按钮按后台配置显示或隐藏。
2. 地址栏 `?lang=en` 参数在英文入口开启时生效。
3. `localStorage.language` 保存用户语言偏好。
4. 固定文案优先读取 Directus `site_i18n_entries`，缺失时回退本地 JSON。

开启英文前请确认英文翻译内容已按需更新，且翻译来源符合项目规则。

固定文案日常维护见：[Directus 固定文案配置指南](./doc/operations/directus-i18n-guide.md)。

