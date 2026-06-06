# Vision Policy Card Alignment

## Overview

Adjust the desktop Vision page policy cards so each card's text block aligns vertically with the document icon, sits slightly closer to the icon, and keeps a consistent left edge between cards in the same column.

## Todos

- [x] Confirm the affected card component and current spacing source.
- [x] Adjust desktop policy card spacing in `src/pages/Vision/index.vue`.
- [x] Normalize the policy card text column so different copy lengths do not shift the visual left edge.
- [x] Validate the project build and summarize acceptance.

## User Requirements

- Fix the visual misalignment shown in the policy card grid.
- Move each card's overall text block slightly closer to the icon.
- Align top-row and bottom-row card text starts consistently, especially in the right column.
- Preserve existing copy, data source, hover behavior, card sizing, and mobile behavior unless needed.

## Implementation Approach

The desktop policy cards are rendered in `src/pages/Vision/index.vue` under `.vision-module4-bottom-card`. The icon currently starts at `36px` from the card top, while the title starts at `48px`, causing the text block to sit lower. The content column also has a `33px` left margin from the icon.

Update only desktop card CSS:

- Set the first title margin top to `36px` so the text column begins on the same top rhythm as the icon.
- Reduce the content left margin from `33px` to `24px` so the text is slightly closer to the icon.
- Give the content column `flex: 1`, explicit `text-align: left`, and unified right padding, then remove per-line right margins so title, tags, and body share one stable left edge.

## Validation / Acceptance

- `npm.cmd run build` completed successfully with existing webpack asset-size, Browserslist, and `::v-deep` warnings.
- `npm.cmd run serve -- --port 8090 --host 127.0.0.1` compiled successfully and reported `http://127.0.0.1:8090/`; the foreground dev server was then stopped by command timeout.
- After the follow-up text-column normalization, `npm.cmd run build` completed successfully again with the same existing warning categories.
- The desktop Vision policy cards now have icon/text top alignment, a tighter icon-to-text gap, and a consistent left-aligned text column in CSS.
