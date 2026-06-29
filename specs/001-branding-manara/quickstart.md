# Quickstart: Brand Name Verification Guide

## Prerequisites

- Project bootstrapped and running (`pnpm install` completed, dev servers up)
- Translation files updated with `app.name` key (see [data-model.md](data-model.md) and [contracts/](contracts/))

## Validation Scenarios

### Scenario 1: Page Title Displays Correct Name

**Setup**: Start the web app dev server.

```
pnpm --filter web dev
```

**Steps**:

1. Open `http://localhost:3000` in a browser
2. Check the browser tab title — should display "manara" (EN default)
3. Switch language to Arabic via the LanguageSwitcher
4. Check the browser tab title — should display "منارة"

**Expected Outcome**: Tab title shows locale-appropriate name for all pages.

**Links**: [Contract 1](contracts/README.md#contract-1-i18n-translation-key-appname), [Contract 2](contracts/README.md#contract-2-nextjs-page-metadata)

---

### Scenario 2: Navigation Header Shows Correct Name

**Setup**: Web app running, logged in as any user.

**Steps**:

1. Navigate to any authenticated page (Dashboard, Courses, etc.)
2. Check the sidebar header — should display "manara" (EN)
3. Switch to Arabic and refresh — should display "منارة"

**Expected Outcome**: Sidebar/navbar app name matches the active locale.

**Links**: [Contract 1](contracts/README.md#contract-1-i18n-translation-key-appname)

---

### Scenario 3: Admin App Shows Correct Name

**Setup**: Admin app running at `http://localhost:3001`

**Steps**:

1. Open admin dashboard
2. Check browser tab title — should display "manara"
3. Check sidebar — should display "manara"

**Expected Outcome**: Admin app uses the same brand name key.

**Links**: [Contract 1](contracts/README.md#contract-1-i18n-translation-key-appname), [Contract 2](contracts/README.md#contract-2-nextjs-page-metadata)

---

### Scenario 4: Landing Page Shows Correct Name

**Setup**: Web app running, visit landing page.

**Steps**:

1. Open `http://localhost:3000` (landing page)
2. Check header navbar — should display "manara" instead of "EduPro"
3. Check footer — should display "manara"

**Expected Outcome**: No remaining "EduPro" references in landing page UI.

**Links**: [research.md](research.md#summary-of-changes-needed)

---

### Scenario 5: Email Contains App Name

**Setup**: API running, send a test email.

**Steps**:

1. Trigger a password reset email
2. Check the rendered email for app name in header/footer
3. Repeat with Arabic-locale user

**Expected Outcome**: Email footer shows locale-appropriate brand name.

**Links**: [Contract 3](contracts/README.md#contract-3-email-template-variable-appname)

---

### Scenario 6: API Health Check Returns Name

**Setup**: API running.

**Steps**:

1. `curl http://localhost:3333/api/health`
2. Check JSON response for `"app": "manara"`

**Expected Outcome**: API system responses use the app name.

**Links**: [Contract 4](contracts/README.md#contract-4-api-health-check--system-name)

---

### Scenario 7: Full-Text Sweep (No Placeholder Names)

**Setup**: Any machine with the codebase.

**Steps**:

1. Search codebase for "LMS Platform", "EduPro", "LMS API", "LMS Admin" in user-facing files
2. Only allowable occurrences are in translation file key names (not values) or non-user-facing config
3. Verify no hardcoded app names remain outside translation files

**Expected Outcome**: Zero remaining placeholder or legacy brand names visible to users.

**Links**: [spec.md Success Criteria SC-005](../spec.md#measurable-outcomes)
