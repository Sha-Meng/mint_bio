name: news-wechat-publish-20260729
date: 2026-07-29
status: in_progress

## overview

Publish two user-supplied WeChat articles to the Directus-backed website news system. Use local media as the authoritative image source, remove WeChat-only outbound promotions, and keep English fields empty.

## todos

- [x] Confirm Directus is the only active news source.
- [x] Confirm publication dates, categories, featured behavior, and local media inventory.
- [ ] Add an idempotent dry-run/apply/public-check publishing helper.
- [ ] Prepare website-safe media variants for oversized source photos.
- [ ] Dry-run both article payloads.
- [ ] Upload/reuse media and create/update both articles.
- [ ] Verify authenticated and public readback, asset delivery, and frontend build.
- [ ] Record final acceptance results.

## User Requirements

- Publish the exhibition article dated `2026-07-24T17:30:00+08:00` in `mint-runtime`.
- Publish the cat hydration product article dated `2026-07-22T09:00:00+08:00` in `mint-products`.
- Set `featured=false` for both so normal date sorting applies.
- Use the supplied exhibition cover and five event photos.
- Use cat article slices `01` through `11`, replace slice `12` / the MiNT BiO 摇尾巴 follow area with `D:\UGit\20260729-184334.png`, and do not add a link.
- Do not preserve WeChat recommendation cards or footer “了解更多” links.
- Do not invent English translations.

## Implementation Approach

- Add `scripts/publish-wechat-news-20260729.mjs` with dry-run by default plus `--apply` and `--public-check`.
- Fetch the exhibition source only to extract its confirmed Chinese summary and textual body, then remove scripts, remote images, linked recommendation cards, and WeChat footer links.
- Store the sanitized exhibition text as a raw EditorJS block followed by five Directus image blocks in filename order.
- Store the cat article as twelve non-linked image blocks: slices `01`–`11` followed by the supplied replacement PNG.
- Upload/reuse files by stable titles in a dedicated Directus folder and create/update articles by stable slugs.

## Key Code Structures

- Article slugs:
  - `yuanshengsi-biobased-textile-materials-summit-2026`
  - `mint-products-cat-hydration-solution-2026`
- Directus collections touched: `news_articles`, `directus_files`, `directus_folders`.
- English article fields remain `null`; `site_i18n_settings.content_version` is not changed.

## Validation / Acceptance

- Dry-run reports both categories, existing-record state, media count, dates, and `featured=false`.
- Authenticated and public readback report both articles as `published`.
- Exhibition body has one text block and five image blocks.
- Cat body has twelve image blocks, with the replacement file last and no raw/link block.
- Covers and all body assets return image responses from the public Directus asset endpoint.
- `npm.cmd run build` succeeds.




## Frontend Color Wrapping Fix (2026-07-29)

- [x] Keep Directus content as one continuous paragraph with standard `[color=orange]...[/color]` markup.
- [x] Do not inject word joiners, `<wbr>`, hard line breaks, or content-specific punctuation rules.
- [x] Render `.mint-color-shortcode` as a normal inline span and allow wrapping inside it with `word-break: break-all` and `overflow-wrap: anywhere`.
- [x] Validate on the user's running `127.0.0.1:8080` page: `驱动带来《从源头重构绿色》` remains on one line at the reported layout.
- [x] Scan 500-1800px viewport widths: no break occurs specifically at the normal-text/color boundary.
- [x] Verify `npm.cmd run build` succeeds; existing asset-size and Browserslist warnings remain non-blocking.

## Font Declaration Correction (2026-07-29)

Goal: remove fallback and synthetic font metrics from news body rendering before
evaluating any explicit no-break behavior.

### Todos

- [x] Register MiSans as a variable font across weights 100-900.
- [x] Use the registered `MiSans` family consistently in the news body.
- [x] Build the frontend and verify the emitted font declaration.
- [ ] Re-check the affected paragraph in the user's browser.

### Scope and approach

- Update `src/assets/font/font.css` to declare the existing MiSans variable font
  with `font-weight: 100 900` and `font-display: swap`.
- Replace the unregistered `MiSans VF` family name in
  `MiNTNewsDetailSection.vue` with `"MiSans", sans-serif`.
- Do not add a word joiner or change line-breaking policy in this step.

### Acceptance

- Computed news body styles use the registered `MiSans` family.
- Weight 800 resolves through the declared variable-font range.
- `npm.cmd run build` succeeds.

Note: the preceding color-wrapping acceptance is superseded because the user
reproduced the boundary break after that change.
