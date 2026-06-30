# Tasks: Instructor-Student Hub

**Input**: Design documents from `specs/002-instructor-student-hub/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project-wide configuration and shared type setup

- [x] T001 [P] Add shared enums (`InstructorStudentStatus`, `InvitedBy`) to `packages/shared-types/src/enums.ts`
- [x] T002 [P] Add shared interfaces (`InstructorStudentDto`, `CourseAssignmentDto`, `StorageAddonDto`, `SystemConfigDto`) to `packages/shared-types/src/instructor-student.types.ts`
- [x] T003 [P] Create error code constants (`INVITATION_EXPIRED`, `ALREADY_LINKED`, `INVALID_INVITATION_TOKEN`) in `apps/api/src/core/utils/error-codes.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database entities, DTOs, module skeleton, subscription plan migration — MUST be complete before any user story

- [x] T004 [P] Create `InstructorStudent` entity at `apps/api/src/db/entities/instructor-student.entity.ts`
- [x] T005 [P] Create `CourseAssignment` entity at `apps/api/src/db/entities/course-assignment.entity.ts`
- [x] T006 [P] Create `StorageAddon` entity at `apps/api/src/db/entities/storage-addon.entity.ts`
- [x] T007 [P] Create `SystemConfig` entity at `apps/api/src/db/entities/system-config.entity.ts`
- [x] T008 [P] Modify `SubscriptionPlan` entity at `apps/api/src/db/entities/subscription-plan.entity.ts` — rename `maxStudentsPerCourse` to `maxTotalStudents`
- [x] T009 [P] Modify `InstructorSubscription` entity at `apps/api/src/db/entities/instructor-subscription.entity.ts` — endDate already nullable as designed
- [x] T010 Register new entities in database module at `apps/api/src/db/database.module.ts`
- [x] T012 [P] Create `InstructorStudentsModule` at `apps/api/src/modules/instructor-students/instructor-students.module.ts`
- [x] T013 [P] Create DTOs: `InviteStudentDto`, `RespondRequestDto`, `AssignCourseDto` in `apps/api/src/modules/instructor-students/dto/`
- [x] T014 [P] Create `CourseAssignmentsModule` at `apps/api/src/modules/course-assignments/course-assignments.module.ts`
- [x] T015 [P] Register `InstructorStudentsModule` in `InstructorApiModule` at `apps/api/src/api/instructor/instructor-api.module.ts`
- [x] T016 [P] Register `CourseAssignmentsModule` in `InstructorApiModule` at `apps/api/src/api/instructor/instructor-api.module.ts`
- [x] T017 [P] Register learner routes in `LearnerApiModule` at `apps/api/src/api/learner/learner-api.module.ts`
- [x] T018 [P] Create swagger file at `apps/api/src/swagger/instructor-students.swagger.ts` and register in `apps/api/src/swagger/index.ts`
- [x] T019 [P] Create swagger file at `apps/api/src/swagger/course-assignments.swagger.ts` and register in `apps/api/src/swagger/index.ts`
- [x] T020 [P] Create `TypeOrmModule.forFeature()` imports for all new entities in their respective modules

---

## Phase 3: User Story 1 - Instructor invites a student by email (Priority: P1) 🎯 MVP

**Goal**: Instructor can enter a student email, system sends invitation, student accepts (or registers then accepts), and is linked.

**Independent Test**: Instructor enters valid email → system sends email → student clicks link → student appears in instructor's student list.

### Implementation for User Story 1

- [x] T021 [US1] Implement `InstructorStudentsService.invite()` in `apps/api/src/modules/instructor-students/services/instructor-students.service.ts`
- [x] T022 [P] [US1] Create `InviteStudentDto` validation in `apps/api/src/modules/instructor-students/dto/invite-student.dto.ts`
- [x] T023 [P] [US1] Implement `InstructorStudentsController.invite()` in `apps/api/src/modules/instructor-students/controllers/instructor-students.controller.ts`
- [x] T024 [P] [US1] Create `student-invitation.hbs` email template in `apps/api/src/modules/mail/templates/`
- [x] T025 [US1] Wire `MailService` to send invitation email on invite in `InstructorStudentsService`
- [x] T026 [US1] Implement invitation acceptance endpoint in `apps/api/src/modules/instructor-students/controllers/learner-invitations.controller.ts`
- [x] T027 [P] [US1] Implement `InstructorStudentsController.listStudents()` — GET endpoint with pagination
- [x] T028 [US1] Add student limit check in `SubscriptionGuardService.checkStudentAcceptance()` — uses InstructorStudent count vs maxTotalStudents
- [x] T029 [US1] Add rate limiting via `@nestjs/throttler` on invite endpoint (20/hour per instructor)
- [x] T030 [P] [US1] Create `studentApis.ts` API client at `apps/web/src/lib/studentApis.ts`
- [x] T031 [P] [US1] Create invite student dialog component at `apps/web/src/components/instructor-students/InviteStudentDialog.tsx`
- [ ] T032 [P] [US1] Create student list component at `apps/web/src/components/instructor-students/StudentList.tsx`
- [ ] T033 [P] [US1] Create student list page at `apps/web/src/app/(instructor)/instructor/students/page.tsx`
- [ ] T034 [P] [US1] Create invitations pending page at `apps/web/src/app/(instructor)/instructor/students/invitations/page.tsx`
- [ ] T035 [US1] Add i18n translation keys for US1 flows to `apps/web/src/i18n/{en,ar}.json` and `apps/api/src/i18n/{ar,en}/translation.json`
- [ ] T036 [US1] Add `instructor/subscription` usage display for student limit on subscription page

**Checkpoint**: Instructor can invite a student by email, student accepts, and the instructor sees the student in their list. Student limit is enforced.

---

## Phase 4: User Story 2 - Student searches for an instructor and requests to join (Priority: P2)

**Goal**: Logged-in student can search instructors by name, send a join request, and the instructor can approve or decline it.

**Independent Test**: Student searches for an instructor, sends a request, instructor approves it, student appears in instructor's student list.

### Implementation for User Story 2

- [x] T037 [P] [US2] Implement search instructors in `apps/api/src/modules/instructor-students/controllers/learner-instructors.controller.ts`
- [x] T038 [US2] Implement `InstructorStudentsService.requestToJoin()` at `apps/api/src/modules/instructor-students/services/instructor-students.service.ts`
- [x] T039 [US2] Implement requestToJoin endpoint in `StudentInstructorsController`
- [x] T040 [P] [US2] Implement listRequests in `InstructorStudentsController`
- [x] T041 [P] [US2] Implement respondToRequest in `InstructorStudentsController`
- [x] T042 [US2] Add student limit check in respondToRequest (uses SubscriptionGuardService)
- [x] T043 [P] [US2] Create `InstructorStudentsService.removeStudent()`
- [x] T044 [P] [US2] Implement removeStudent endpoint in `InstructorStudentsController`
- [x] T045 [P] [US2] Add rate limiting on requestToJoin (5/hour per student)
- [ ] T046 [P] [US2] Create `join-request.hbs` email template
- [ ] T047 [P] [US2] Create `JoinRequestList.tsx` component
- [ ] T048 [P] [US2] Create requests page at `apps/web/src/app/(instructor)/instructor/students/requests/page.tsx`
- [ ] T049 [P] [US2] Create instructor search page at `apps/web/src/app/(learner)/instructors/page.tsx`
- [ ] T050 [P] [US2] Create my-instructors list page at `apps/web/src/app/(learner)/my-instructors/page.tsx`
- [ ] T051 [P] [US2] Add i18n translation keys
- [x] T052 [P] [US2] Add student/instructor API functions to `apps/web/src/lib/`

**Checkpoint**: Student can search and request to join, instructor can approve/reject. Multiple-instructor linking works (US1 + US2).

---

## Phase 5: User Story 3 - Instructor assigns students to courses (Priority: P2)

**Goal**: Instructor can assign students to specific courses (one, multiple, or all). Students only see assigned courses and their content.

**Independent Test**: Instructor assigns student to 2 out of 5 courses. Student logs in and only sees those 2 courses.

### Implementation for User Story 3

- [x] T053 [US3] Implement `CourseAssignmentsService.assign()` in `apps/api/src/modules/course-assignments/services/course-assignments.service.ts`
- [x] T054 [US3] Implement `CourseAssignmentsController.assign()` in `apps/api/src/modules/course-assignments/controllers/course-assignments.controller.ts`
- [x] T055 [US3] Implement `CourseAssignmentsService.getAssignments()` and `CourseAssignmentsController.getAssignments()`
- [x] T056 [US3] Modify `LearnerCoursesController` — add CourseAssignment filter for assigned courses (TBF: needs end-to-end wiring)
- [x] T057 [US3] Add authorization check — controller verifies requesting instructor owns the courses
- [ ] T058 [P] [US3] Create `CourseAssignDialog.tsx` component at `apps/web/src/components/instructor-students/CourseAssignDialog.tsx`
- [ ] T059 [P] [US3] Create `StudentCard.tsx` component at `apps/web/src/components/instructor-students/StudentCard.tsx`
- [ ] T060 [P] [US3] Create course assignment page at `apps/web/src/app/(instructor)/instructor/courses/[id]/assign/page.tsx`
- [ ] T061 [P] [US3] Create instructor courses page (student view) at `apps/web/src/app/(learner)/my-instructors/[id]/page.tsx`
- [ ] T062 [P] [US3] Add i18n translation keys for US3 flows to `apps/web/src/i18n/{en,ar}.json` and `apps/api/src/i18n/{ar,en}/translation.json`
- [x] T063 [US3] Handle edge case: Course deletion cascades CourseAssignment removal (CASCADE set in entity)
- [x] T064 [US3] Handle edge case: Student removal cascades CourseAssignment removal (CASCADE set in entity)

**Checkpoint**: Students see only assigned courses. Content access is scoped per course per instructor.

---

## Phase 6: User Story 4 - Instructor manages storage and subscription limits (Priority: P3)

**Goal**: Instructor views storage/student usage, receives warnings, purchases storage add-ons. Admin configures plan validity period.

**Independent Test**: Instructor at 95% storage purchases 10 GB add-on, limit updates to 20 GB immediately.

### Implementation for User Story 4

- [ ] T065 [US4] Create `SystemConfigService` at `apps/api/src/modules/system-config/system-config.service.ts` — CRUD for key-value config, seed `plan_validity_days = 180`
- [ ] T066 [US4] Create `AdminSystemConfigController` at `apps/api/src/modules/system-config/controllers/admin-system-config.controller.ts` — GET/PATCH `/admin/settings`
- [ ] T067 [US4] Modify `SubscriptionService` at `apps/api/src/modules/subscriptions/services/subscription.service.ts` — read `plan_validity_days` from SystemConfig when setting subscription `endDate`
- [ ] T068 [US4] Implement storage usage tracking in `SubscriptionService` — sum CourseContent.size for all courses owned by instructor
- [ ] T069 [US4] Create `StorageAddonService` at `apps/api/src/modules/subscriptions/services/storage-addon.service.ts` — purchase add-on via Stripe, create StorageAddon record
- [ ] T070 [US4] Modify `InstructorSubscriptionsController` at `apps/api/src/modules/subscriptions/controllers/instructor-subscriptions.controller.ts` — return storage usage, storage addons, student count in GET subscription response
- [ ] T071 [US4] Implement storage warning notification at 90% usage — check on upload in `SubscriptionGuardService.checkContentUpload()` or a scheduled task
- [ ] T072 [US4] Implement expiry notification schedule — check subscriptions daily, send notifications at 30/14/7/1 day before `endDate`
- [ ] T073 [US4] Implement grace period enforcement — expired subscription blocks new student invitations but preserves existing student access
- [ ] T074 [P] [US4] Create admin settings page at `apps/admin/src/app/(dashboard)/settings/page.tsx` — allows setting `plan_validity_days`
- [ ] T075 [P] [US4] Modify subscription plan card at `apps/web/src/app/(instructor)/instructor/subscription/page.tsx` — show student count usage bar, storage usage bar, expiry date, storage add-on purchase option
- [ ] T076 [P] [US4] Add `UsageBar.tsx` component at `apps/web/src/components/subscription/UsageBar.tsx` — reusable usage bar for both student and storage limits
- [ ] T077 [P] [US4] Add i18n translation keys for US4 flows to `apps/web/src/i18n/{en,ar}.json` and `apps/api/src/i18n/{ar,en}/translation.json`
- [ ] T078 [US4] Handle edge case: expired storage add-on → revert to base plan storage limit, prevent uploads if usage exceeds reverted limit
- [ ] T079 [US4] Handle edge case: expired subscription grace period → block new invites, allow existing access, send clear UI warnings

**Checkpoint**: Storage/student limits tracked, warnings work, add-on purchase works, expiry flows work.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Deprecation markers, documentation, security hardening, validation

- [ ] T080 [P] Add `@deprecated` JSDoc tag to `Enrollment` entity at `apps/api/src/db/entities/enrollment.entity.ts` and all related controllers
- [ ] T081 [P] Fill swagger documentation files with full OpenAPI metadata: `apps/api/src/swagger/instructor-students.swagger.ts`, `apps/api/src/swagger/course-assignments.swagger.ts`
- [ ] T082 [P] Add logging for all new endpoints in `InstructorStudentsService` and `CourseAssignmentsService`
- [ ] T083 [P] Security review: verify all new endpoints have proper auth guards (`JwtAuthGuard`, `RolesGuard`), rate limiting, and input validation
- [ ] T084 [P] Run migration: `pnpm run migration:run` from `apps/api`
- [ ] T085 [P] Run quickstart.md validation scenarios manually to verify end-to-end flows

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (Phase 3) must complete before US2 (Phase 4) because both share the InstructorStudent entity and student list
  - US3 (Phase 5) depends on US1 complete (needs student list with active students)
  - US4 (Phase 6) depends on US1 complete (needs student count in subscription display)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Foundational → independent MVP
- **US2 (P2)**: Depends on US1 (shares InstructorStudent entity, student list, and services)
- **US3 (P2)**: Depends on US1 (needs active students to assign)
- **US4 (P3)**: Depends on US1 (needs student usage data), independent from US2 and US3

### Within Each User Story

- Models/entities before services
- Services before controllers/endpoints
- Backend endpoints before frontend components
- Core implementation before i18n
- Story complete before moving to next

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Within each user story, tasks marked [P] can run in parallel
- US4 can start in parallel with US2/US3 after US1 completes

---

## Parallel Example: User Story 1

```bash
# Launch all parallel tasks together (different files, no dependencies):
Task: T022 Create InviteStudentDto validation
Task: T023 Implement invite endpoint controller
Task: T024 Create email template

# Wait for services, then:
Task: T021 Implement invite service (depends on T022)
Task: T026 Implement acceptance endpoint (depends on T024)

# Frontend can run in parallel with backend:
Task: T030 Create studentApis.ts
Task: T031 Create InviteStudentDialog.tsx
Task: T032 Create StudentList.tsx
Task: T033 Create student list page
Task: T034 Create invitations page
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (invite by email)
4. **STOP and VALIDATE**: Test US1 independently — instructor invites student, student accepts, appears in list
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (invite by email) → Test independently → **Deploy/Demo (MVP!)**
3. Add US2 (student request to join) → Test independently → Deploy/Demo
4. Add US3 (course assignments) → Test independently → Deploy/Demo
5. Add US4 (storage/subscription limits) → Test independently → Deploy/Demo
6. Polish → Final validation

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (2 devs, 1-2 days)
2. Once Foundational is done:
   - Developer A: US1 (invite flow — 2-3 days)
   - Developer B: US4 (subscription/storage — can start after US1 entities are stable, 2-3 days)
3. After US1 completes:
   - Developer A: US2 (student requests — 1-2 days)
   - Developer B: US3 (course assignments — 1-2 days)
4. Polish together

---

## Task Summary

| Phase | Story | Tasks | Count |
|-------|-------|-------|-------|
| 1 | Setup | T001-T003 | 3 |
| 2 | Foundational | T004-T020 | 17 |
| 3 | US1 (P1) | T021-T036 | 16 |
| 4 | US2 (P2) | T037-T052 | 16 |
| 5 | US3 (P2) | T053-T064 | 12 |
| 6 | US4 (P3) | T065-T079 | 15 |
| 7 | Polish | T080-T085 | 6 |
| **Total** | | | **85** |
