# Research: Brand Name Localization for "manara / منارة"

## Research Tasks

### Task 1: Current App Name Usage Across Codebase

**Decision**: Replace all instances of "LMS Platform" and "EduPro" with locale-specific "manara" (EN) / "منارة" (AR)

**Rationale**:
- Two competing brand names exist: "LMS Platform" used in authenticated views and "EduPro" used on the public landing page
- The spec defines a single unified name per locale: "manara" for English, "منارة" for Arabic
- All user-facing references must be updated to use the new name via translation keys

**Alternatives considered**:
- Keeping both brand names for different contexts — rejected because it dilutes brand identity
- Using "manara منارة" as a single bilingual string everywhere — rejected per user clarification; each locale gets its own name

### Task 2: Existing i18n Architecture

**Decision**: Add a new `app.name` translation key to all translation files; consume via existing `t()` / `i18n.t()` functions

**Rationale**:
- Web app uses `react-i18next` with flat key-value translation files in `apps/web/src/i18n/{en,ar}.json`
- API uses `nestjs-i18n` with nested keys in `apps/api/src/i18n/{en,ar}/translation.json`
- A dedicated `app.name` key is cleaner than repurposing the existing `"LMS Platform"` key
- Admin app currently has no i18n — will add translation support

**Existing keys to replace**:
- `"LMS Platform": "LMS Platform"` → `"app.name": "manara"` (EN)
- `"LMS Platform": "منصة التعلم"` → `"app.name": "منارة"` (AR)
- All hardcoded "EduPro" references in landing components → `t('app.name')`
- Orphaned strings ("Education Platform", "Enrolled in LMS Platform") → proper keys or remove

**Alternatives considered**:
- Using environment variables for the app name — rejected because it bypasses the existing i18n system and locale switching
- Keeping the flat key `"LMS Platform"` and changing its value — rejected because the key name is misleading

### Task 3: Page Title Mechanism

**Decision**: Update Next.js `metadata` in root layouts and the client-side `I18nProvider` to use the new `app.name` translation key

**Rationale**:
- Web app uses `metadata.title` in `apps/web/src/app/layout.tsx` (SSR title) + `I18nProvider` (client-side override)
- Admin app uses only `metadata.title` in `apps/admin/src/app/layout.tsx` with no i18n
- Both must be updated to reference the locale-appropriate name

**Key change requirements**:
- Web root layout: `title: "manara"` (EN) / `title` from i18n for SSR — or use `generateMetadata` with params
- I18nProvider: Change `document.title = i18n.t('LMS Platform')` → `document.title = i18n.t('app.name')`
- Admin: Add i18n support and update metadata title

**Alternatives considered**:
- Hardcoding "manara" in metadata — rejected because it wouldn't support Arabic "منارة" title
- Using Next.js' built-in `generateMetadata` with `params.locale` — selected approach if Next.js route groups support locale params

### Task 4: Email Template Branding

**Decision**: Add a footer/header with the locale-appropriate app name to email templates via Handlebars variables

**Rationale**:
- Current email templates in `apps/api/src/modules/mail/templates/` are generic with no app name
- Templates use `.hbs` (Handlebars) format — can inject `appName` variable from `mail.service.ts`
- The mail service already resolves the recipient's locale for email content

**Key change requirements**:
- Add `appName` variable to mail template context from i18n
- Update template layouts to include `{{appName}}` in header/footer

### Task 5: PWA and Meta Tags

**Decision**: Update `manifest.json` and meta tags to use locale-appropriate names

**Rationale**:
- PWA manifest typically has a single `name` field — requires build-time generation or a manifest endpoint that respects language
- OG/Twitter card tags should use the locale-appropriate name
- Meta tags are set in root layout — can use `metadata` export with i18n

### Task 6: Admin App Localization

**Decision**: Add basic i18n support to the admin app for the app name at minimum

**Rationale**:
- Admin app currently hardcodes `lang="en"` in HTML and uses no translation system
- Sidebar hardcodes `<span>LMS Platform</span>`
- Root layout has static `title: "LMS Admin Dashboard"`
- At minimum, add a translation function and key for the app name; full i18n across admin is out of scope

## Summary of Changes Needed

| Surface | Current | Target (EN) | Target (AR) | Mechanism |
|---------|---------|-------------|-------------|-----------|
| Web page title | "LMS Platform" | "manara" | "منارة" | `metadata` + `document.title` |
| Web sidebar header | `t('LMS Platform')` | `t('app.name')` | `t('app.name')` | Translation key |
| Web auth layout | `t('LMS Platform')` | `t('app.name')` | `t('app.name')` | Translation key |
| Admin page title | "LMS Admin Dashboard" | "manara" | "منارة" | Add i18n |
| Admin sidebar | "LMS Platform" (hardcoded) | `t('app.name')` | `t('app.name')` | Add i18n |
| Landing page | "EduPro" (hardcoded) | `t('app.name')` | `t('app.name')` | Translation key |
| API Swagger title | "LMS API" | "manara API" | - | Config constant |
| Email templates | Generic/no brand | "manara" footer | "منارة" footer | Handlebars variable |
| PWA manifest | - | "manara" | "منارة" | Build/generate |
| Meta/OG tags | - | "manara" | "منارة" | `metadata` + i18n |
