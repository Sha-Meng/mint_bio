# BioIntelligent Base Metrics Directus Migration

## Overview

Move the numeric base metrics in the BioIntelligent desktop base section from Vue template literals to the existing Directus-backed i18n runtime.

## Todos

- [x] Replace hardcoded base metric values in `BioIntelligentPart6.vue` with `getText()` keys.
- [x] Add local zh/en fallback values for the new metric keys.
- [x] Add a Directus upsert script for `site_i18n_entries` and `site_i18n_settings.content_version`.
- [x] Validate with a dry-run script check and production build.

## User Requirements

- The screenshot value under `研发专利` should be `60+`.
- The hardcoded metric values should be unified under Directus where practical.

## Product Overview

The BioIntelligent base section shows three site cards with labels and metrics for Muyuan Anliang, headquarters, and Jiande. Labels already use `getText()` and can be overridden by Directus runtime i18n. Metric values currently remain hardcoded in the component.

## Core Features

- Preserve existing layout, hover behavior, image assets, and labels.
- Add Directus/i18n keys for all base metric values in this component.
- Keep local fallback values so the page renders correctly if Directus is unavailable.

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

`BioIntelligentPart6.vue` renders labels and metric values through `getText()`. Local i18n JSON provides build-time fallback. Directus runtime i18n can override values after `loadSiteI18nRuntime()` fetches enabled entries.

## Directory Structure

- `src/components/BioIntelligent/BioIntelligentPart6.vue`
- `src/i18n/zh-CN.json`
- `src/i18n/en-US.json`
- `scripts/update-biointelligent-base-metrics.mjs`

## Key Code Structures

- `getText('bioIntelligent.bases.<base>.<metric>Metric')`
- `baseMetricEntries` in the Directus update script

## Validation / Acceptance

- Component diff contains only metric value source changes.
- Fallback JSON contains all new metric keys.
- Directus update script reported 10 creates in dry-run, applied the entries, incremented `content_version` from 38 to 39, and then reported 0 creates / 0 updates on a follow-up dry-run.
- `npm.cmd run build` completes successfully.
- Temporary dev server compiled successfully and `http://127.0.0.1:8088/#/bioIntelligent` returned HTTP 200.
