# Contracts: App Name Branding Interface

## Overview

This feature touches the contract between the i18n system and every component that renders the app name. The contracts define how the brand name is accessed, the expected input/output across application boundaries, and the migration from legacy keys.

## Contract 1: i18n Translation Key `app.name`

**Purpose**: Provide locale-appropriate app name to all consumers.

**Interface**:

```
Input:
  locale: 'en' | 'ar'          // resolved by the i18n framework
  key: 'app.name'              // translation key (constant)

Output:
  string: 'manara' | 'منارة'   // localized app name

Resolution order:
  1. User preference (JWT `user.lang`)
  2. Accept-Language HTTP header (browser)
  3. Cookie / querystring / localStorage / navigator (frontend)
  4. Fallback: 'ar'
```

**Consumers**:
- Web: `<h1>{t('app.name')}</h1>` via `react-i18next`
- Admin: `t('app.name')` via `react-i18next` (new)
- API: `i18n.t('app.name')` via `nestjs-i18n`

**Migration**:
- Old key `"LMS Platform"` → deprecated but kept during transition
- New key `"app.name"` → consumed everywhere
- All `t('LMS Platform')` calls replaced with `t('app.name')`

---

## Contract 2: Next.js Page Metadata

**Purpose**: Set the browser tab title with locale-appropriate app name.

**Interface** (Web):

```
metadata.title = "manara"          // SSR / static export
document.title = t('app.title', { pageName })  // client-side override
```

**Interface** (Admin):

```
metadata.title = "manara"          // SSR / static export (requires i18n)
```

**Title format**:
- EN: `"manara | {Page Name}"`
- AR: `"{Page Name} | منارة"`

---

## Contract 3: Email Template Variable `appName`

**Purpose**: Provide localized app name to Handlebars email templates.

**Interface**:

```
Input:
  template: string              // template filename
  context: {
    appName: string             // resolved i18n value
    locale: 'en' | 'ar'        // recipient's locale
    [other template vars]
  }

Output:
  rendered email HTML/text with {{appName}} replaced
```

**Consumer**: `apps/api/src/modules/mail/mail.service.ts`

---

## Contract 4: API Health Check / System Name

**Purpose**: Return the app name in API system responses.

**Interface**:

```
GET /api/health
Response:
{
  "status": "ok",
  "app": "manara",
  ...
}
```

**Consumer**: `apps/api/src/app.controller.ts`

---

## Contract 5: Open Graph / Meta Tags

**Purpose**: Set social share preview metadata with app name.

**Interface** (in root layout metadata):

```
og:site_name → "manara"         // EN
og:site_name → "منارة"          // AR
twitter:title → "manara | {Page}" // EN
twitter:title → "{Page} | منارة"  // AR
```
