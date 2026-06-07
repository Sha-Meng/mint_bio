# 品牌手册下载按钮恢复指引

> 当前官网没有可下载的品牌手册文件，因此 `/mintNews` 的 PC 与移动端品牌手册按钮都保持隐藏。

## 当前状态

- PC 入口：`src/components/MiNTNews/MiNTNewsTop.vue` 中的 `news.downloadBrochure` 按钮由 `SHOW_BRAND_BROCHURE_DOWNLOAD` 开关隐藏。
- 移动端入口：`src/pages/MiNTNewsMobile/MiNTNewsMobile.vue` 中的 `news.downloadBrochure` 按钮复用同一个 `SHOW_BRAND_BROCHURE_DOWNLOAD` 开关隐藏。
- 文案 key `news.downloadBrochure` 保留，未来恢复按钮时可继续复用。

## 恢复前准备

1. 确认已有最终版品牌手册文件，建议使用 PDF。
2. 将文件放到 `public/downloads/`，例如：

```text
public/downloads/mint-bio-brand-brochure.pdf
```

3. 文件名使用英文小写和连字符，避免空格、中文文件名和特殊符号。

## 恢复按钮

> 2026-06-07 更新：PC 与移动端现在共用 `src/config/brandBrochure.js` 中的 `SHOW_BRAND_BROCHURE_DOWNLOAD` 开关。恢复入口时先把该值改为 `true`，再配置真实下载链接；不要分别改 PC / Mobile 两处显隐逻辑。

1. 将 `src/config/brandBrochure.js` 中的 `SHOW_BRAND_BROCHURE_DOWNLOAD` 改为 `true`。
2. 将 PC 与移动端按钮改为下载链接，推荐结构如下：

```vue
<a class="button-btn" href="/downloads/mint-bio-brand-brochure.pdf" download>
  <span>{{ getText('news.downloadBrochure') }}</span>
  <img src="@/assets/images/download.png" alt="download" />
</a>
```

PC 端如果保留当前内部结构，也可以在点击事件中执行：

```js
window.open('/downloads/mint-bio-brand-brochure.pdf', '_blank', 'noopener')
```

但优先使用 `<a download>`，浏览器语义更清晰。

## 文案与缓存

- 如只恢复按钮且继续使用“下载品牌手册”，不需要改 Directus 文案。
- 如需要改按钮文案，先更新 Directus `site_i18n_entries` 的 `news.downloadBrochure`，再递增 `site_i18n_settings.content_version`。
- 本地 `src/i18n/*.json` 仅作为 fallback，同步更新即可，不作为日常运营入口。

## 验证

1. 运行 `npm run build`，确认构建通过。
2. 本地打开 PC 与移动端 `/mintNews`，确认按钮位置和样式正常。
3. 点击按钮，确认浏览器能下载或打开 `/downloads/mint-bio-brand-brochure.pdf`。
4. 部署后访问线上同一路径，确认文件返回 200。
