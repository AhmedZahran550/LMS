# Tasks: Branding - App Name "manara / منارة"

**Input**: Design documents from `specs/001-branding-manara/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested in spec — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Web app: `apps/web/`, Admin app: `apps/admin/`, API: `apps/api/`
- Paths reflect the existing monorepo structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure — no new dependencies or project setup needed. All change is in existing translation files and components.

No tasks required — project is already bootstrapped with the monorepo structure.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add `app.name` and `app.title` translation keys to ALL translation files. This MUST be complete before any user story can begin.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T001 Add `app.name: "manara"` and `app.title: "manara | {{pageName}}"` keys to `apps/web/src/i18n/en.json`
- [x] T002 Add `app.name: "منارة"` and `app.title: "{{pageName}} | منارة"` keys to `apps/web/src/i18n/ar.json`
- [x] T003 Add `app.name: "manara"` key to `apps/api/src/i18n/en/translation.json`
- [x] T004 Add `app.name: "منارة"` key to `apps/api/src/i18n/ar/translation.json`
- [x] T005 [P] Create `apps/admin/src/i18n/en.json` with `app.name: "manara"` key and i18n config
- [x] T006 [P] Create `apps/admin/src/i18n/ar.json` with `app.name: "منارة"` key

**Checkpoint**: Foundation ready — all translation keys exist, user story implementation can begin.

---

## Phase 3: User Story 1 — Browser Tab Shows App Name (Priority: P1) 🎯 MVP

**Goal**: Every page displays the locale-appropriate app name in the browser tab title — "manara" for EN, "منارة" for AR — formatted with page name.

**Independent Test**: Navigate to any 3+ pages in English, verify tab shows "manara | [Page Name]". Switch to Arabic, verify "[Page Name] | منارة".

### Implementation

- [x] T007 [P] [US1] Update root layout `metadata.title` to "manara" in `apps/web/src/app/layout.tsx`
- [x] T008 [P] [US1] Update client-side title override to use `t('app.name')` in `apps/web/src/components/providers/I18nProvider.tsx`
- [x] T009 [P] [US1] Update root layout `metadata.title` to use locale-appropriate name in `apps/admin/src/app/layout.tsx` and add i18n provider setup
- [x] T010 [P] [US1] Add OG/Twitter meta tags referencing locale-appropriate name in web root layout metadata in `apps/web/src/app/layout.tsx`

**Checkpoint**: Page titles display correct localized name. User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 — App Name in Headers and Navigation (Priority: P1) 🎯 MVP

**Goal**: The app name appears prominently in navigation headers, sidebars, auth pages, and landing page for both locales.

**Independent Test**: Load authenticated Web page — sidebar shows "manara" (EN) / "منارة" (AR). Load landing page — nav shows name instead of "EduPro". Load auth pages — name appears in header.

### Implementation

- [x] T011 [P] [US2] Replace `t('LMS Platform')` with `t('app.name')` in `apps/web/src/components/layout/Sidebar.tsx`
- [x] T012 [P] [US2] Replace `t('LMS Platform')` with `t('app.name')` in `apps/web/src/app/(auth)/layout.tsx` (header brand, footer brand, copyright)
- [x] T013 [P] [US2] Replace `<span>LMS Platform</span>` with `t('app.name')` in `apps/web/src/app/(auth)/login/LoginFormUI.tsx`
- [x] T014 [P] [US2] Replace `<span>LMS Platform</span>` with `t('app.name')` in `apps/web/src/app/(auth)/register/RegisterFormUI.tsx`
- [x] T015 [P] [US2] Replace hardcoded `<span>LMS Platform</span>` with `t('app.name')` in `apps/admin/src/components/layout/Sidebar.tsx`
- [x] T016 [P] [US2] Replace hardcoded `<Link>EduPro</Link>` with `t('app.name')` in `apps/web/src/components/landing/Navbar.tsx`
- [x] T017 [P] [US2] Replace hardcoded "EduPro" references with `t('app.name')` in `apps/web/src/components/landing/Footer.tsx`
- [x] T018 [P] [US2] Replace hardcoded "EduPro" with `t('app.name')` in `apps/web/src/components/landing/Hero.tsx`
- [x] T019 [P] [US2] Replace hardcoded "EduPro" with `t('app.name')` in `apps/web/src/components/landing/Features.tsx`
- [x] T020 [US2] Fix orphaned strings: replace `t('Education Platform')` with `t('app.name')` in sidebar; fix `t('Enrolled in LMS Platform')` → `t('Enrolled')` in `apps/web/src/app/(learner)/my-courses/page.tsx`

**Checkpoint**: All navigation surfaces show localized app name. User Story 2 is fully functional and testable independently.

---

## Phase 5: User Story 3 — Consistent Branding in System Communications (Priority: P2)

**Goal**: System emails and notifications reference the locale-appropriate app name.

**Independent Test**: Trigger a password reset email (EN) — verify sender/body references "manara". Trigger with AR locale — verify "منارة".

### Implementation

- [x] T021 [US3] Add `appName` resolution from i18n and inject into template context in `apps/api/src/modules/mail/mail.service.ts`
- [x] T022 [P] [US3] Add `{{appName}}` footer branding to `apps/api/src/modules/mail/templates/email-verification.hbs`
- [x] T023 [P] [US3] Add `{{appName}}` footer branding to `apps/api/src/modules/mail/templates/reset-password.hbs`
- [x] T024 [P] [US3] Add `{{appName}}` footer branding to `apps/api/src/modules/mail/templates/payment-confirmation.hbs`
- [x] T025 [P] [US3] Add `{{appName}}` footer branding to `apps/api/src/modules/mail/templates/subscription-expiring.hbs`
- [x] T026 [P] [US3] Add `{{appName}}` footer branding to `apps/api/src/modules/mail/templates/subscription-renewed.hbs`

**Checkpoint**: All communications use locale-appropriate branding. User Story 3 is fully functional and testable independently.

---

## Phase 6: User Story 4 — Branded Error and System Pages (Priority: P3)

**Goal**: Error pages (404, 500, maintenance) display the locale-appropriate app name.

**Independent Test**: Navigate to a non-existent route — 404 page shows "manara" (EN) / "منارة" (AR).

### Implementation

- [x] T027 [US4] Create `apps/web/src/app/not-found.tsx` with locale-appropriate app name branding
- [x] T028 [US4] Create `apps/web/src/app/error.tsx` with locale-appropriate app name branding
- [x] T029 [US4] Update auth page error states to display locale-appropriate app name — covered by header brand change in T013/T014; error states already show in header

**Checkpoint**: Error pages show localized brand name. User Story 4 is fully functional and testable independently.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: API branding, PWA support, legacy cleanup, and validation.

- [x] T030 [P] Update Swagger doc title from "LMS API" to "manara API" in `apps/api/src/main.ts`
- [x] T031 [P] Update health check response `app` field from "LMS API" to "manara" in `apps/api/src/app.controller.ts`
- [x] T032 [P] Create PWA manifest with `name: "manara"` at `apps/web/public/manifest.json`
- [x] T033 Update legacy `public/locales/en/translation.json` and `public/locales/ar/translation.json` with `app.name` keys
- [x] T034 Run full-text sweep — remaining instances of "LMS" found and fixed in `apps/admin/src/app/layout.tsx` and `.github/workflows/swagger-docs.yml`
- [ ] T035 Run all [quickstart.md](quickstart.md) validation scenarios to verify brand consistency — requires running dev servers

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — project already initialized
- **Foundational (Phase 2)**: No dependencies — BLOCKS all user stories
- **User Stories (Phase 3–6)**: All depend on Foundational phase completion
  - Phases 3 (US1) and 4 (US2) can proceed in parallel (both P1)
  - Phase 5 (US3) can start after Phase 2 (P2)
  - Phase 6 (US4) can start after Phase 2 (P3)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — No dependencies on other stories
- **US2 (P1)**: Can start after Phase 2 — No dependencies on other stories
- **US3 (P2)**: Can start after Phase 2 — No dependencies on other stories
- **US4 (P3)**: Can start after Phase 2 — No dependencies on other stories

### Within Each User Story

- Tasks marked [P] can be done in parallel (different files, no dependencies)
- All tasks within a story are independent of tasks in other stories

### Parallel Opportunities

- All Foundational tasks marked [P] can run in parallel
- US1 and US2 can run in parallel (both P1, different files)
- Within each user story, all [P]-marked tasks can run in parallel
- US3 and US4 can run in parallel with each other or with US1/US2
- Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1 (Page Titles)

```bash
Task: Update web root layout metadata.title in apps/web/src/app/layout.tsx
Task: Update I18nProvider document.title in apps/web/src/components/providers/I18nProvider.tsx
Task: Update admin root layout metadata.title in apps/admin/src/app/layout.tsx
Task: Add OG/Twitter meta tags in apps/web/src/app/layout.tsx
```

## Parallel Example: User Story 2 (Navigation Headers)

```bash
Task: Update Web sidebar in apps/web/src/components/layout/Sidebar.tsx
Task: Update Web auth layout in apps/web/src/app/(auth)/layout.tsx
Task: Update admin sidebar in apps/admin/src/components/layout/Sidebar.tsx
Task: Update landing Navbar in apps/web/src/components/landing/Navbar.tsx
Task: Update landing Footer in apps/web/src/components/landing/Footer.tsx
Task: Update landing Hero in apps/web/src/components/landing/Hero.tsx
Task: Update landing Features in apps/web/src/components/landing/Features.tsx
Task: Update login/register forms
```

---

## Implementation Strategy

### MVP First (US1 + US2 — Both P1)

1. Complete Phase 2: Foundational (translation keys)
2. Complete Phase 3: User Story 1 (page titles)
3. Complete Phase 4: User Story 2 (navigation headers)
4. **STOP and VALIDATE**: Test both stories independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Foundational → Translation keys ready
2. Add US1 (Page Titles) → Test independently → Deploy/Demo (MVP!)
3. Add US2 (Navigation Headers) → Test independently → Deploy/Demo
4. Add US3 (Email Branding) → Test independently → Deploy/Demo
5. Add US4 (Error Pages) → Test independently → Deploy/Demo
6. Polish: API branding, PWA, sweep → Final validation

### Parallel Team Strategy

With multiple developers:

1. Team completes Phase 2: Foundational together
2. Once Phase 2 is done:
   - Developer A: US1 (page titles) + US4 (error pages)
   - Developer B: US2 (navigation headers) + US3 (email branding)
   - Developer C: Phase 7 (polish/cross-cutting)
3. All stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable — no cross-story dependencies
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
