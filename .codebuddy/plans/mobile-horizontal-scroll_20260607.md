# mobile-horizontal-scroll-20260607

## Overview

Enable Home-style manual drag for the mobile corporate timeline and the VisionMobile crisis image card list while preserving the existing visual style.

## User Requirements

- The two screenshot areas must support manual left/right dragging on mobile, matching the Home mobile card interaction.
- Keep the current appearance unchanged.
- Do not change copy, Directus data, i18n entries, images, or card ordering.

## Implementation Approach

- Treat this as a layout-only interaction fix, so Directus and i18n files stay untouched.
- Cleanly revert the mistaken New Material case-card changes while preserving unrelated pre-existing edits in that file.
- Keep the Corporate timeline markup and style, but switch its drag behavior to the same mouse/touch `scrollLeft` model used by the Home mobile card track.
- Keep the VisionMobile crisis image card list markup and style, but add the same mouse/touch `scrollLeft` drag behavior to `.vision-module2`.

## Todos

- [x] Locate the two affected mobile render paths.
- [x] Compare the target areas against the Home mobile drag implementation.
- [x] Revert the mistaken New Material case-card implementation changes.
- [x] Replace the Corporate timeline touch-only logic with Home-style mouse/touch dragging.
- [x] Add Home-style mouse/touch dragging to the VisionMobile crisis image card list.
- [x] Validate with build and source inspection.

## Affected Modules

- `src/pages/CorporateVisionMobile/index.vue`
- `src/pages/VisionMobile/index.vue`

## Validation / Acceptance

- `npm.cmd run build` passes with existing asset-size, Browserslist, and `::v-deep` warnings.
- Mobile timeline keeps the same typography, spacing, divider, and hidden scrollbar while allowing manual mouse/touch drag.
- VisionMobile crisis image cards keep their card size and style while allowing manual mouse/touch drag.
- Mistaken New Material case-card `Swiper` changes are removed.
