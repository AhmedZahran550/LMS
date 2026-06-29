# Feature Specification: Branding - App Name "manara / منارة"

**Feature Branch**: `001-branding-manara`

**Created**: 2026-06-29

**Status**: Draft

**Input**: User description: "our app name will be manara منارة need to use the name all over the app and the page titles in every where we need to use the app name"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browser Tab Shows App Name (Priority: P1)

As a visitor or user, I want to see the app name in my browser tab title so that I can identify the application easily among my open tabs.

**Why this priority**: Page titles are the most visible and universal touchpoint — every page load, every browser tab displays the title. This is the highest-impact change for brand recognition.

**Independent Test**: Can be fully tested by navigating to any page in the app and checking the browser tab / `<title>` element displays the locale-appropriate app name followed by the page name.

**Acceptance Scenarios**:

1. **Given** a user has the UI set to English, **When** they navigate to any application page, **Then** the browser tab title displays "manara | [Page Name]"
2. **Given** a user has the UI set to Arabic, **When** they navigate to any application page, **Then** the browser tab title displays "[Page Name] | منارة"

---

### User Story 2 - App Name in Headers and Navigation (Priority: P1)

As a user, I want to see the app name displayed prominently in the app header/navigation bar so that I always know which application I am using.

**Why this priority**: The header/navbar is visible on every screen and is the primary brand anchor for users. This is equally critical as page titles for brand consistency.

**Independent Test**: Can be fully tested by loading any page in each locale and checking the header/navbar area for the locale-appropriate branding.

**Acceptance Scenarios**:

1. **Given** a user is on any page in English mode, **When** they look at the top navigation area, **Then** they see "manara" displayed as the app name
2. **Given** a user views the page in Arabic language mode, **When** they look at the header, **Then** they see "منارة" displayed as the app name

---

### User Story 3 - Consistent Branding in System Communications (Priority: P2)

As a user receiving system emails and notifications, I want to see the locale-appropriate app name so that I trust the communication's authenticity.

**Why this priority**: Email communications are critical for user trust and engagement, but occur less frequently than in-app branding. Priority P2 because it impacts fewer touchpoints.

**Independent Test**: Can be fully tested by triggering a system email (e.g., password reset, welcome email) in each locale and verifying the sender name and body reference the correct localized name.

**Acceptance Scenarios**:

1. **Given** a system-generated email is sent to a user with English locale, **When** the email is opened, **Then** the sender name and body reference "manara"
2. **Given** a system-generated email is sent to a user with Arabic locale, **When** the email is opened, **Then** the sender name and body reference "منارة"

---

### User Story 4 - Branded Error and System Pages (Priority: P3)

As a user encountering an error or system page, I want to see locale-appropriate branding so that I have continuity even outside normal app flows.

**Why this priority**: Error and system pages are seen less frequently but are important for brand professionalism. Priority P3 due to lower visibility.

**Independent Test**: Can be fully tested by navigating to a 404 page in each locale and verifying the correct localized name appears.

**Acceptance Scenarios**:

1. **Given** an English-locale user lands on a 404 error page, **When** the page loads, **Then** the page displays "manara" and a friendly error message
2. **Given** an Arabic-locale user lands on a 404 error page, **When** the page loads, **Then** the page displays "منارة" and a friendly error message

---

### Edge Cases

- What happens when JavaScript fails to load — does the HTML `<title>` still show the correct locale's name?
- How does the app name display in search engine results / social share previews (OG tags) for each locale?
- Does the app name render correctly in both LTR (English "manara") and RTL (Arabic "منارة") text directions?
- How is the app name handled in API responses that reference the system name internally?
- What about loading screens, splash screens, and PWA manifest names for each locale?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every HTML page MUST have a `<title>` tag that includes the locale-appropriate app name — "manara" for English, "منارة" for Arabic — formatted as "manara | [Page Name]" and "[Page Name] | منارة" respectively
- **FR-002**: The application header/navigation bar MUST display "manara" when the locale is English and "منارة" when the locale is Arabic
- **FR-003**: All system-generated email sender names and templates MUST reference "manara" for English recipients and "منارة" for Arabic recipients
- **FR-004**: Error pages (404, 500, maintenance) MUST include the locale-appropriate name in their title and body content
- **FR-005**: Open Graph and Twitter Card meta tags MUST include the locale-appropriate app name as the site name
- **FR-006**: The PWA manifest file MUST support locale-specific app names — "manara" for English, "منارة" for Arabic
- **FR-007**: Loading screens, splash screens, and preloader states MUST display the locale-appropriate name
- **FR-008**: API responses that include system name references MUST use the locale-appropriate name based on the requesting user's language preference
- **FR-009**: The app name MUST render correctly in its respective script — Latin for "manara" (LTR), Arabic for "منارة" (RTL)
- **FR-010**: All in-app notifications and toasts that reference the application MUST use the locale-appropriate name
- **FR-011**: Login, registration, and password reset pages MUST display the locale-appropriate name in titles and headers
- **FR-012**: The admin dashboard pages MUST consistently use the locale-appropriate name in titles, headers, and all brand references
- **FR-013**: The app name MUST be stored in a centralized configuration with separate values for each locale, enabling single-source-of-truth and easy future updates
- **FR-014**: Translation entries for the app name MUST be defined in both `en` and `ar` translation files as the authoritative source for locale-specific branding

### Key Entities *(include if feature involves data)*

- **App Name Configuration**: Centralized configuration entry holding the app name for each supported locale (e.g., `{ en: "manara", ar: "منارة" }`)
- **Translation Entries**: Localization keys (`app.name`) in `en.json` and `ar.json` translation files that return the locale-appropriate name
- **HTML Meta Configuration**: Page-level metadata (title, OG tags, Twitter cards) that reference the locale-appropriate app name via translation keys

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every page in the application displays the correct locale-appropriate name in the browser tab title — verified by automated check of all routes (minimum 10 routes) in both locales
- **SC-002**: The app name appears consistently on all 5 major surfaces (browser tabs, navigation headers, system emails, error pages, social previews) in both locales — verified by a brand consistency audit
- **SC-003**: The app name renders correctly in its respective script and direction — Latin LTR for "manara", Arabic RTL for "منارة" — verified by visual inspection in both language modes
- **SC-004**: Changing the app name in the centralized configuration or translation files updates all surfaces without individual page edits — verified by a single-config-change test in both locales
- **SC-005**: Zero instances of hardcoded or incorrect app names remain visible to any user — verified by a full-text search across user-facing templates and translation files

## Assumptions

- The existing application already has a config/settings system that can store locale-specific values centrally
- The project uses translation files for both English and Arabic (`en.json`/`ar.json`) as per the existing localization setup
- Page titles are currently set per-route and will be updated to read from translation keys
- System emails are generated via a templating system that can reference translation values
- The PWA manifest supports locale-specific names or is generated dynamically
- Existing placeholder names (e.g., "LMS") are currently used in some locations and will need to be replaced
- The app name does not require translation — "manara" is the English name, "منارة" is the Arabic name, each used in its respective locale context
