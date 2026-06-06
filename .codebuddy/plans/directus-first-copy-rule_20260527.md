# name
Directus First Copy Rule

# overview
Codify the operational lesson that website copy changes should be made in Directus runtime i18n first, with local JSON treated only as fallback.

# todos
- [x] Review existing project instructions and i18n documentation.
- [x] Update project-level agent instructions.
- [x] Update project i18n rule file.
- [x] Validate the updated wording is present.

# User Requirements
- Future copy changes should modify Directus, not only local source JSON.
- The rule should be part of the project baseline settings for future agents.

# Implementation Approach
- Add a Directus-first copy rule to `AGENTS.md`.
- Add detailed enforcement notes to `.codebuddy/rules/i18n-translation-policy.mdc`.
- Keep existing translation constraints intact.

# Validation / Acceptance
- `AGENTS.md` explicitly says fixed website copy lives in Directus `site_i18n_entries` and requires incrementing `site_i18n_settings.content_version`.
- `.codebuddy/rules/i18n-translation-policy.mdc` explicitly says local JSON is fallback only and desktop/mobile key paths must be checked together.
