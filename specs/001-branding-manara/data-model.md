# Data Model: App Name Branding

## Overview

The app name is a localized string resolved through the existing i18n system. There is no database persistence required — the name lives in translation JSON files and is consumed via the respective i18n framework in each application layer.

## Entities

### Translation Key: `app.name`

| Attribute | Value | Notes |
|-----------|-------|-------|
| Key | `app.name` | Consistent across all translation files |
| EN value | `"manara"` | Latin script, LTR |
| AR value | `"منارة"` | Arabic script, RTL |
| Type | `string` | Single localized string per locale |
| Scope | Global | Used across all surfaces |

**Relationships**:
- Referenced by: root layouts, navigation components, I18nProvider, mail templates, meta tags
- Source of truth: translation JSON files in each app

### Translation Key: `app.title`

For page titles that need a combined format:

| Attribute | EN Value | AR Value |
|-----------|----------|----------|
| Key | `app.title` | `app.title` |
| Format | `"manara | {pageName}"` | `"{pageName} | منارة"` |
| Type | `string` with interpolation | `string` with interpolation |

**Relationships**:
- Referenced by: I18nProvider `document.title` assignment
- Depends on: page name being passed as interpolation variable

### Source Files

| File | App | Format | Contains |
|------|-----|--------|----------|
| `apps/web/src/i18n/en.json` | Web | Flat key-value | `app.name`, `app.title` |
| `apps/web/src/i18n/ar.json` | Web | Flat key-value | `app.name`, `app.title` |
| `apps/api/src/i18n/en/translation.json` | API | Nested JSON | `app.name` |
| `apps/api/src/i18n/ar/translation.json` | API | Nested JSON | `app.name` |
| `apps/admin/src/i18n/en.json` | Admin | Flat key-value (new) | `app.name` |
| `apps/admin/src/i18n/ar.json` | Admin | Flat key-value (new) | `app.name` |

## Validation Rules

| Rule | Description |
|------|-------------|
| Key uniqueness | `app.name` must not conflict with existing keys in any translation file |
| Non-empty | Translation values must be non-empty strings |
| No trailing whitespace | Translation values must not have leading/trailing whitespace |
| Cross-file consistency | All translation files must define the `app.name` key |
| No HTML | Translation values must not contain HTML markup |
| Single source | No file should contain hardcoded app name strings outside of translation JSON |
