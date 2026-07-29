# name

contact-advisor-qr-update_20260722

# overview

更新“联系我们”和页底的产品顾问联系方式与二维码，并将顾问手机号、二维码文件 ID、页底默认顾问改为 Directus 配置。前端保留本地兜底二维码和电话，Directus 失败时仍能显示新信息。

# todos

- [x] 确认桌面/移动端联系弹窗和页底二维码入口。
- [x] 从桌面名片图片裁剪两张本地兜底二维码。
- [x] 新增前端顾问配置解析模块，读取 Directus runtime key。
- [x] 更新 Contact / ContactMobile / Footer / FooterMobile 引用配置。
- [x] 新增 Directus 更新脚本，上传二维码并写入配置 key。
- [x] 执行 Directus dry-run / apply。
- [x] 执行构建验证。

# User Requirements

- 位置：联系我们。
- 删除展示邮箱。
- 氨基酸产品顾问电话：15268103254。
- 新材料产品顾问电话：15296523218。
- 从 `C:\Users\shame\Desktop\mint-bio` 下两张顾问名片裁剪二维码。
- 页底也更新二维码。
- 手机号和二维码图片改为 Directus 配置方式。

# Implementation Approach

- 使用现有 `site_i18n_entries` / `site_i18n_settings.content_version` 运行时，不新增公开接口或 Directus 集合权限。
- 新增配置 key：
  - `contact.advisorConfig.aminoAcid.phone`
  - `contact.advisorConfig.aminoAcid.qrFileId`
  - `contact.advisorConfig.materials.phone`
  - `contact.advisorConfig.materials.qrFileId`
  - `contact.advisorConfig.footerAdvisor`
- 前端通过 `src/config/contactAdvisors.js` 统一解析配置；二维码 key 保存 Directus Files ID，前端渲染为 `/assets/{id}`。
- 联系弹窗删除 `contact.email` 展示和硬编码海外邮箱展示；保留表单邮箱字段、校验和提交载荷。
- 页底单二维码使用配置中的 `footerAdvisor`，默认氨基酸顾问。

# Directory Structure

- `src/config/contactAdvisors.js`：统一顾问配置解析。
- `src/assets/images/advisor-amino-qr.png`：氨基酸顾问二维码兜底资源。
- `src/assets/images/advisor-material-qr.png`：新材料顾问二维码兜底资源。
- `scripts/update-contact-advisor-settings.mjs`：Directus 文件上传与配置写入脚本。

# Validation / Acceptance

- Directus dry-run/apply 成功，`content_version` 从 45 递增到 46。
- Directus 已创建 5 个顾问配置 key，并禁用 `contact.email`。
- `npm.cmd run build` 通过；仅有既有资源体积、Browserslist、`::v-deep` 警告。
- 联系弹窗不再展示公司邮箱和海外邮箱。
- 桌面/移动联系弹窗展示两位顾问的新电话和二维码，数据来自 Directus 配置，接口失败时使用本地兜底。
- 页底二维码使用 `contact.advisorConfig.footerAdvisor` 指定顾问，当前为氨基酸产品顾问。
- 表单邮箱输入、校验和提交结构保持不变。

# Implementation Notes

- 当前已有脏改动 `.codebuddy/plans/join-us-recruitment-link_20260629.md` 和 `src/utils/recruitmentLink.js`，本任务不触碰。
- Directus 服务器 TLS 证书已过期，本次 dry-run/apply/核验在用户授权下临时设置 `NODE_TLS_REJECT_UNAUTHORIZED=0` 完成；建议尽快续期证书。

# 2026-07-22 follow-up

- Fixed the new materials advisor QR fallback crop with direct pixel-copy cropping at `x=760, y=1542, w=360, h=360` to avoid DrawImage offset/clipping.
- Re-uploaded advisor QR files to Directus and advanced `site_i18n_settings.content_version` from 46 to 47.
- Added spacing before the official account QR block: desktop `28px`, mobile `24px`.
- Re-ran `npm.cmd run build`; build passed with the same existing warnings.

# 2026-07-22 footer dual-advisor follow-up

## User Requirements

- Redesign the desktop and mobile footer contact area to show both product advisors permanently.
- Map the newly supplied QR images as follows: image 2 to the amino-acid advisor and image 3 to the new-materials advisor.
- Keep the existing advisor phone numbers, footer navigation, address, copyright, and ICP information.
- Continue using Directus-managed QR file IDs with updated local fallback images.

## Implementation Approach

- Render `contactAdvisors` in both footer variants instead of rendering the single `footerAdvisor` selection.
- Use a two-column desktop layout and a responsive two-column/stacked mobile layout; remove the mobile QR modal trigger and overlay.
- Replace both local fallback QR assets, upload the same files to Directus, update the existing `qrFileId` entries, and increment `site_i18n_settings.content_version`.
- Retain the existing `footerAdvisor` configuration key for backward compatibility, although the redesigned footer no longer reads it.

## Todos

- [x] Replace both local fallback QR images with the newly supplied files.
- [x] Implement the desktop footer dual-advisor layout.
- [x] Implement the responsive mobile footer dual-advisor layout and remove the single-QR modal interaction.
- [x] Upload the new QR images to Directus and refresh the runtime content version.
- [x] Build and validate the compiled desktop/mobile footer output and uploaded QR assets.

## Validation / Acceptance

- `npm.cmd run build` passed with only the existing asset-size, Browserslist, and `::v-deep` warnings.
- Desktop footer renders both advisors in a permanent horizontal group; mobile renders a responsive two-column grid that stacks below 360px.
- The mobile single-QR trigger, overlay, and modal state were removed.
- Local fallback files exactly match the supplied images by SHA-256.
- Directus uploaded file hashes exactly match the local fallback files.
- Directus QR entries now reference `adf50dd3-83fe-444d-99a9-bc50e809ca30` and `60f33abf-80e8-4f71-992b-2d7c8237dcfa`.
- `site_i18n_settings.content_version` advanced from 47 to 48.
- QR images use `object-fit: contain` and a square display box so their source pixels are not cropped or distorted.
- Directus TLS verification required the existing temporary `NODE_TLS_REJECT_UNAUTHORIZED=0` workaround because the server certificate remains expired.
# 2026-07-22 QR presentation follow-up

- Goal: remove visible QR corner rounding, slightly enlarge advisor contact text, and correct the mobile footer QR alignment.
- Changed files: desktop/mobile Contact and Footer components; no content or Directus configuration changes.
- Implementation: force square white QR canvases with zero radius, increase advisor text by 1–2px, and left-align each mobile footer QR with its advisor text column.
- Validation: `npm.cmd run build` passed with the existing asset-size, Browserslist, and `::v-deep` warnings only.