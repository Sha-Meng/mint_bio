# BioIntelligent Base Metrics Directus Migration

## Overview

Move the numeric base metrics in the BioIntelligent base section from Vue template literals and mobile static text images to the existing Directus-backed i18n runtime.

## Todos

- [x] Replace hardcoded base metric values in `BioIntelligentPart6.vue` with `getText()` keys.
- [x] Add local zh/en fallback values for the new metric keys.
- [x] Add a Directus upsert script for `site_i18n_entries` and `site_i18n_settings.content_version`.
- [x] Validate with a dry-run script check and production build.
- [x] Replace mobile static base cards with data-driven cards that share the same label and metric keys.
- [x] Validate the mobile route after the card renderer update.
- [x] Tune the mobile data-driven card visual style to better match the pre-migration static card.

## User Requirements

- The screenshot value under `研发专利` should be `60+`.
- The hardcoded metric values should be unified under Directus where practical.
- Mobile should show `研发专利 60+` consistently with desktop.
- Mobile should preserve the old card visual weight as much as possible: darker card background, compact header and metric typography, wide image crop, and similar spacing.

## Product Overview

The BioIntelligent base section shows three site cards with labels and metrics for Muyuan Anliang, headquarters, and Jiande. Desktop labels already use `getText()` and can be overridden by Directus runtime i18n. Desktop metric values were hardcoded in the component. Mobile used pre-rendered static PNG cards with baked-in labels and values, so it did not receive the Directus metric update.

## Core Features

- Preserve existing layout, hover behavior, image assets, and labels.
- Add Directus/i18n keys for all base metric values in this component.
- Keep local fallback values so the page renders correctly if Directus is unavailable.
- Rebuild the mobile card presentation with HTML text over the original image assets so runtime text stays editable.
- Keep the data-driven card visually close to the former static card instead of introducing a new visual treatment.

## Tech Stack Selection

- Vue 3 compatibility build component.
- Existing `getText()` runtime i18n helper.
- Existing Directus collections: `site_i18n_entries` and `site_i18n_settings`.
- Node.js migration/update script using built-in `fetch`.

## Implementation Approach

Use sibling `metric` keys below each existing metric label key, for example:

- `bioIntelligent.bases.hq.patentsMetric`
- `bioIntelligent.bases.hq.teamMetric`
- `bioIntelligent.bases.hq.rdCenterMetric`

The Directus script will upsert these keys and increment `content_version` only when changes are applied.

## Architecture Design

`BioIntelligentPart6.vue` and `BioIntelligentMobile/index.vue` render labels and metric values through `getText()`. Local i18n JSON provides build-time fallback. Directus runtime i18n can override values after `loadSiteI18nRuntime()` fetches enabled entries.

## Directory Structure

- `src/components/BioIntelligent/BioIntelligentPart6.vue`
- `src/pages/BioIntelligentMobile/index.vue`
- `src/i18n/zh-CN.json`
- `src/i18n/en-US.json`
- `scripts/update-biointelligent-base-metrics.mjs`

## Key Code Structures

- `getText('bioIntelligent.bases.<base>.<metric>Metric')`
- `baseCards` in the mobile page, mapping each base card to shared label and metric keys.
- `baseMetricEntries` in the Directus update script

## Validation / Acceptance

- Component diff contains only metric value source changes.
- Fallback JSON contains all new metric keys.
- Directus update script reported 10 creates in dry-run, applied the entries, incremented `content_version` from 38 to 39, and then reported 0 creates / 0 updates on a follow-up dry-run.
- `npm.cmd run build` completes successfully.
- Temporary dev server compiled successfully and `http://127.0.0.1:8088/#/bioIntelligent` returned HTTP 200.
- Mobile card renderer uses the same Directus/i18n keys, so headquarters patents show `研发专利` and `60+`.
- Follow-up mobile update removed static `base-1.png` / `base-2.png` / `base-3.png` rendering from `BioIntelligentMobile/index.vue`, added data-driven cards, and `npm.cmd run build` completed successfully. Headless Chrome DOM/screenshot output was unavailable in this environment, so verification used source and build checks.
- Visual comparison follow-up identified that the first DOM version was too bright, too tall, and too large typographically compared with the previous mobile card screenshot. The card background was darkened, border/rounding reduced, image crop changed to a wider ratio, and header/metric typography was scaled down. `npm.cmd run build` completed successfully after the tuning.
- Second visual comparison follow-up identified that the data-driven card text still appeared too heavy. Card typography weights were reduced, and antialiasing was added on the card container. `npm.cmd run build` completed successfully after the weight tuning.
- Third visual comparison follow-up identified that the typography was still slightly large/heavy and the metric label-to-value gap was too large. Header/image-title/metric text sizes were reduced, metric label weight was lowered, label minimum height was reduced from 36px to 18px, and value margin-top was reduced from 8px to 4px. `npm.cmd run build` completed successfully after the spacing tuning.
- Fourth visual follow-up identified that four-column capacity labels wrapped `(吨)` onto a second line. Four-column metric labels now use a slightly smaller `10px` font and `white-space: nowrap`; `npm.cmd run build` completed successfully after the wrap fix.
