name: join-us-recruitment-link

overview: Add the Liepin recruitment link to the visible "Join Us" entry points highlighted by the user, opening the link in a new browser tab without changing copy, Directus content, or routes.

todos:
- [x] Confirm the affected components and existing click behavior.
- [x] Add a shared recruitment-link helper.
- [x] Wire the desktop and mobile header "Join Us" menu entries.
- [x] Wire the desktop contact popover and desktop/mobile footers.
- [x] Run build validation and source-level binding checks.

User Requirements:
- The highlighted "Join Us" controls should open `https://www.liepin.com/company/13100295/`.
- The target must open in a new tab.
- Do not change visible wording or translation data.

Product Overview:
- The site already has desktop and mobile navigation, a global contact popover, and footer navigation.
- This change is a behavior-only recruitment link update.

Core Features:
- Shared external-link behavior with `noopener,noreferrer`.
- Desktop header main About Us hover dropdown and menu popover include visible "Join Us" items.
- Mobile header About Us panel includes a visible "Join Us" item.
- Desktop contact popover includes a visible recruitment button.
- Desktop and mobile footer "Join Us" entries open the recruitment link.

Tech Stack Selection:
- Vue single-file components.
- Existing i18n key `nav.joinUs`.
- Plain browser `window.open` for external tab behavior.

Implementation Approach:
- Add `src/utils/recruitmentLink.js` with the recruitment URL and an `openRecruitmentLink` function.
- Import and use the helper in `Header`, `MobileHeader`, `Contact`, `Footer`, and `FooterMobile`.
- Keep styling scoped to the affected visible button/entry points; contact popover button must match the existing dark/glass page style, not the red screenshot annotation.

Implementation Notes:
- This task does not touch Directus or local i18n JSON because it does not change copy.
- `ContactMobile` is intentionally out of scope because the supplied screenshots only identify the desktop contact popover button.
- If QA finds another shared "Join Us" entry, update this plan before expanding implementation.

Architecture Design:
- External recruitment behavior is centralized in `src/utils/recruitmentLink.js`.
- Components remain responsible only for rendering and invoking the shared helper.

Directory Structure:
- `src/utils/recruitmentLink.js`
- `src/components/Header/index.vue`
- `src/components/MobileHeader/index.vue`
- `src/components/Contact/index.vue`
- `src/components/Footer/index.vue`
- `src/components/FooterMobile/index.vue`

Key Code Structures:
- `RECRUITMENT_URL`: exported URL constant.
- `openRecruitmentLink()`: safely opens a new tab and clears `opener` where possible.

Validation / Acceptance:
- `npm.cmd run build` completes successfully. Result: passed on 2026-06-29, rerun after feedback fixes, with existing Browserslist, ::v-deep, and webpack asset-size warnings.
- Source check confirms each highlighted "Join Us" entry calls `openRecruitmentLink`, including the desktop main About Us hover dropdown.
- No Directus/i18n files are modified.
