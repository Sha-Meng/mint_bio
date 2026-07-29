name: join-us-recruitment-link

overview: Update all visible "Join Us" recruitment entry points from the previous Liepin external URL to the internal MiNT News detail article `join-us-2026-recruitment`, preserving the shared new-tab behavior and leaving visible copy/i18n unchanged.

todos:
- [x] Confirm the affected components still use the shared `openRecruitmentLink` helper.
- [x] Replace the centralized recruitment target with the internal news detail route.
- [x] Keep the helper generating an absolute URL from the current site origin/path so hash routing works across deployment paths.
- [x] Run source-level binding checks for all "Join Us" entry points.
- [x] Run build validation after implementation.

User Requirements:
- All "Join Us" controls that call `openRecruitmentLink` should open the `join-us-2026-recruitment` news article.
- The target must continue to open in a new browser tab.
- Do not change visible wording, translation data, Directus content, or news article content.

Product Overview:
- The site has desktop and mobile navigation, global contact popovers, and footer navigation.
- Recruitment click behavior is centralized in a shared helper, so the behavior update is intentionally single-source.

Core Features:
- Shared recruitment behavior with `noopener,noreferrer`.
- Desktop header main About Us dropdown and menu popover "Join Us" entries use the helper.
- Mobile header About Us panel uses the helper.
- Desktop and mobile contact popovers use the helper.
- Desktop and mobile footer "Join Us" entries use the helper.

Tech Stack Selection:
- Vue single-file components.
- Existing i18n key `nav.joinUs`.
- Browser `window.open` for new-tab behavior.
- Vue Router hash route `/mintNews/detail/:configId` for the news detail page.

Implementation Approach:
- Update `src/utils/recruitmentLink.js` only for runtime behavior.
- Export the recruitment news slug and route for clarity.
- Build the final URL as `${window.location.origin}${window.location.pathname}#/mintNews/detail/join-us-2026-recruitment` so it stays on the same deployed app base.
- Keep component imports/click handlers unchanged because they already call the shared helper.

Implementation Notes:
- This task does not touch Directus or local i18n JSON because it does not change copy.
- `join-us-2026-recruitment` is assumed to be a valid Directus news article slug.
- If QA finds another shared "Join Us" entry, update this plan before expanding implementation.

Architecture Design:
- Recruitment behavior remains centralized in `src/utils/recruitmentLink.js`.
- Components remain responsible only for rendering and invoking `openRecruitmentLink`.

Directory Structure:
- `src/utils/recruitmentLink.js`
- `src/components/Header/index.vue`
- `src/components/MobileHeader/index.vue`
- `src/components/Contact/index.vue`
- `src/components/Footer/index.vue`
- `src/components/FooterMobile/index.vue`
- `src/components/ContactMobile/index.vue`

Key Code Structures:
- `RECRUITMENT_NEWS_SLUG`: `join-us-2026-recruitment`.
- `RECRUITMENT_ROUTE`: `/mintNews/detail/join-us-2026-recruitment`.
- `getRecruitmentUrl()`: converts the hash route into a same-site absolute URL.
- `openRecruitmentLink()`: opens the recruitment news URL in a new tab and clears `opener` where possible.

Validation / Acceptance:
- Source check confirms each known "Join Us" entry calls `openRecruitmentLink`.
- Source check confirms the old Liepin URL is no longer used in `src`.
- `npm.cmd run build` passed on 2026-07-09 with existing Browserslist, ::v-deep, and webpack asset-size warnings.
- Manual QA target: PC/mobile Header, Footer, and Contact entries open `#/mintNews/detail/join-us-2026-recruitment`.
