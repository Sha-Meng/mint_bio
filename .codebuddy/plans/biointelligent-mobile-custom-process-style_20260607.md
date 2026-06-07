# Shared Mobile Custom Process Style

## Overview

Adjust the shared mobile custom solution and custom process area used by Vision and BioIntelligent to match the provided mobile design reference.

## Todos

- [x] Confirm the target component and affected route.
- [x] Replace the page-specific mode with a shared component fix.
- [x] Tune the shared mobile card and process styles to match the reference.
- [x] Rebuild the shared four-card mobile grid so the top, middle, and bottom cards align.
- [x] Validate with build and local preview/screenshot where available.

## User Requirements

- On the BioIntelligent and Vision mobile pages, the custom process section should follow the provided design reference.
- The custom solution card should be compact and centered within the mobile viewport.
- The process steps should render as two compact rows instead of the current oversized wrapped layout.
- The two pages reuse this component, so the fix should be shared instead of BioIntelligent-only.
- The product/custom solution area should be a four-card design: one full-width card, two aligned half-width cards, and one full-width card.
- The middle-right amino acid card must remain fully visible and must not be clipped by the viewport or its container.

## Product Overview

`BioIntelligentMobile/index.vue` and `VisionMobile/index.vue` both reuse `VisionMobile/VisionModule5.vue` for the product/custom solution area. The visible issue is the whole four-card shared layout: the top card, middle two cards, and bottom card need a common aligned container, and the middle-right card currently risks clipping.

## Core Features

- Fix the existing shared component so both mobile routes receive the same visual correction.
- Use a single centered card container with a 370px maximum width and no inner padding that can misalign card edges.
- Render the two middle cards as a two-column grid with `minmax(0, 1fr)` so both cards fit the available width.
- Preserve current interaction for the match advisor button.
- Keep this as layout work only unless Directus text changes are explicitly required.

## Tech Stack Selection

- Vue single-file components.
- Existing scoped Less styles.
- Existing `getText()` i18n helper.

## Implementation Approach

Apply the correction inside `VisionModule5` itself. Keep the shared component in the normal mobile scaling path and add the compact card/process overrides after the default rules, so both Vision and BioIntelligent match the previously accepted BioIntelligent visual proportion.

The implementation replaces the old width/padding-driven card sizing with a single shared content container: `width: calc(100% - 50px)`, `max-width: 370px`, `margin: 0 auto`, `padding: 0`, and `box-sizing: border-box`. The middle row uses CSS grid with `repeat(2, minmax(0, 1fr))` and the child cards use `width: 100%`, `min-width: 0`, and `box-sizing: border-box`.

## Implementation Notes

- This task is style-focused; Directus/i18n content is not changed.
- If the final rendered text must also change to the reference wording, that should follow the repo Directus-first content workflow.

## Architecture Design

`VisionModule5` remains the shared renderer. The compact overrides apply to the reused component, so both mobile routes inherit the same card and process layout.

## Directory Structure

- `src/pages/BioIntelligentMobile/index.vue`
- `src/pages/VisionMobile/VisionModule5.vue`
- `.codebuddy/plans/biointelligent-mobile-custom-process-style_20260607.md`

## Key Code Structures

- `<div class="vision-module5">`
- `.vision-module5-content`
- `.vision-module5-content-img2`
- `.vision-module5-content-img3`
- `.vision-module5-step`

## Validation / Acceptance

- BioIntelligent mobile route continues to use the shared `VisionModule5`.
- Vision mobile route uses the same shared `VisionModule5` fix.
- `npm.cmd run build` completed successfully.
- `git diff --check` completed successfully for the touched files.
- Follow-up correction removed the `fixedPx` pxtorem blacklist class because it made the shared block visibly too small in the user's Vision screenshot. The shared compact styles now stay in the normal mobile scaling path, matching the previously accepted BioIntelligent result.
- Built CSS confirms `vision-module5.fixedPx` is absent and the shared compact `max-width: 370px` plus `last-box` button margin overrides are present.
- `http://127.0.0.1:8080/#/vision` returned HTTP 200 from this shell session. Browser screenshot automation is still unavailable in this tool context.
- Current four-card grid implementation aligns the top, middle, and bottom cards with the same shared container and prevents the middle-right card from exceeding its grid column.
- Final build verification confirmed the generated CSS contains the shared content container width, two-column `minmax(0, 1fr)` grid, `min-width: 0`, and `max-width: 370px` rules.
- `http://127.0.0.1:8080/#/vision` and `http://127.0.0.1:8080/#/bioIntelligent` both returned HTTP 200 after the four-card grid update.
- Follow-up screenshot review showed the two middle cards were using an undesirable center crop after the grid change. The material and amino-acid card backgrounds now use card-specific `background-size` and `background-position` values to reveal the intended source-image regions.
- Follow-up screenshot review also showed the process numbers became too small. The `.vision-module5-step .number` rule now explicitly restores `font-size: 24px` and `font-weight: 330`.
- Final proportion follow-up only increases the two middle card heights from `150px` to `168px`, keeping the rest of the shared layout unchanged.
