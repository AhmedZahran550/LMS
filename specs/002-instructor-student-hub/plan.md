# Implementation Plan: Instructor-Student Hub

**Branch**: `002-instructor-student-hub` | **Date**: 2026-06-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-instructor-student-hub/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Restructure the LMS from a course-centered enrollment model to an instructor-centered student management model. Instructors invite or accept students globally (not per-course), assign them to specific courses for content access, and operate under subscription limits on total student count (not courses). Storage limit defaults to 10 GB with purchasable expansion plans that have a configurable renewal period (default 6 months). This requires new entities (InstructorStudent, CourseAssignment), modified subscription logic, and updated UI across instructor and learner dashboards.

## Technical Context

**Language/Version**: TypeScript 5.x (NestJS ^10.0.0, Next.js 16.2.9, React 19.2.4)

**Primary Dependencies**: NestJS, TypeORM ^0.3.20, class-validator, @nestjs/jwt, @nestjs/passport, stripe ^22.3.0, cloudinary ^2.10.0, nodemailer / resend, @nestjs/throttler, helmet

**Storage**: PostgreSQL 16 (Docker, port 5432), Cloudinary / local filesystem for file uploads

**Testing**: Jest + ts-jest + supertest (API); Testing Library / Vitest (frontend, existing setup)

**Target Platform**: Web — browser (Next.js App Router) + Node.js server (NestJS)

**Project Type**: Multi-app pnpm monorepo — `apps/api` (NestJS), `apps/web` (Next.js learner/instructor), `apps/admin` (Next.js admin dashboard), `packages/shared-types`

**Performance Goals**: Instructor dashboard loads student list and course assignments in under 2 seconds for up to 500 students. Invitation emails deliver within 5 minutes.

**Constraints**: Must use existing TypeORM entities and migrations pattern. Stripe integration already exists for billing. All user-facing text must be available in ar/en via existing i18n framework. File upload validation (MIME, size) must follow constitution security rules. Invitation endpoints must be rate-limited.

**Scale/Scope**: ~6 new/modified entities, ~10 new API endpoints, ~15 new/modified frontend pages/components across all 3 apps. Impacts all user roles: instructor, student (learner), admin.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Status |
|-----------|-----------|--------|
| **I. Security-First Development** | Email invitations need rate limiting + secure token generation. Student-instructor links require authorization checks. File uploads already validated. No sensitive data exposure. | ✅ Pass |
| **II. Decoupled API Documentation** | New endpoints require swagger files under `apps/api/src/swagger/`. Follow existing pattern (e.g., `instructor-students.swagger.ts`, `course-assignments.swagger.ts`). | ✅ Pass |
| **III. Layered Monorepo Structure** | New feature module under `apps/api/src/modules/instructor-students/`. Frontend changes in `(instructor)` and `(learner)` route groups. Admin changes in `(dashboard)`. | ✅ Pass |
| **IV. DTO-Driven Schema Generation** | New DTOs for invite, join-request, course-assignment with class-validator decorators. Swagger references DTO types. | ✅ Pass |
| **V. Consistency & Developer Ergonomics** | Follow camelCase naming, centralized Axios client, TanStack React Query for server state, Zustand for client state. | ✅ Pass |
| **VI. Localization & Internationalization** | All new UI text (invite flows, student management, storage plans) needs ar/en translation keys following dot-notation convention. | ✅ Pass |
| **VII. Error Handling & Observability** | Follow GlobalExceptionFilter, TransformResponseInterceptor, LoggerMiddleware patterns. New errors in ErrorCodes enum. | ✅ Pass |

**GATE verdict**: ✅ All gates pass. No constitution violations.

## Project Structure

### Documentation (this feature)

```text
specs/002-instructor-student-hub/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
├── checklists/          # Quality checklists
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
apps/api/src/
├── modules/
│   └── instructor-students/       # NEW feature module
│       ├── controllers/
│       │   ├── instructor-students.controller.ts
│       │   └── course-assignments.controller.ts
│       ├── services/
│       │   ├── instructor-students.service.ts
│       │   └── course-assignments.service.ts
│       ├── dto/
│       │   ├── invite-student.dto.ts
│       │   ├── join-request.dto.ts
│       │   ├── respond-request.dto.ts
│       │   └── assign-course.dto.ts
│       └── tests/
├── db/
│   ├── entities/
│   │   ├── instructor-student.entity.ts  # NEW
│   │   └── course-assignment.entity.ts   # NEW
│   └── migrations/                      # NEW migration files
├── api/
│   ├── admin-api.module.ts              # add admin/students routes
│   ├── instructor-api.module.ts         # add instructor/students routes
│   └── learner-api.module.ts            # add student routes
├── swagger/
│   ├── instructor-students.swagger.ts   # NEW
│   └── course-assignments.swagger.ts    # NEW
├── i18n/
│   ├── ar/translation.json              # UPDATE: new keys
│   └── en/translation.json              # UPDATE: new keys
├── core/
│   └── guards/
│       └── subscription.guard.ts        # MODIFY: student limit check
└── modules/
    └── subscriptions/
        ├── services/
        │   ├── subscription.service.ts          # MODIFY: new limit logic
        │   └── subscription-guard.service.ts     # MODIFY: check total students
        └── entities/
            ├── subscription-plan.entity.ts       # MODIFY: replace maxStudentsPerCourse
            └── instructor-subscription.entity.ts # MODIFY: add renewal fields

apps/web/src/
├── app/
│   ├── (instructor)/
│   │   └── instructor/
│   │       ├── students/                        # NEW pages
│   │       │   ├── page.tsx                     # student list
│   │       │   ├── invitations/page.tsx         # pending invites
│   │       │   └── requests/page.tsx            # join requests
│   │       ├── courses/[id]/assign/page.tsx     # NEW: assign students
│   │       └── subscription/page.tsx            # MODIFY: storage + student plan UI
│   └── (learner)/
│       └── my-instructors/                      # NEW pages
│           ├── page.tsx                         # list of instructors
│           └── [id]/page.tsx                    # instructor's courses
├── components/
│   └── instructor-students/                     # NEW components
│       ├── StudentList.tsx
│       ├── InviteStudentDialog.tsx
│       ├── JoinRequestList.tsx
│       ├── CourseAssignDialog.tsx
│       └── StudentCard.tsx
├── lib/
│   ├── studentApis.ts                          # NEW API client
│   └── instructorApis.ts                       # MODIFY: add student endpoints

apps/admin/src/app/
└── (dashboard)/
    └── settings/
        └── page.tsx                            # NEW: plan validity period config
```

**Structure Decision**: Follow existing monorepo layout. The new `instructor-students` module follows the existing module convention (controllers, services, dto, tests). Existing `subscriptions` and `enrollments` modules are modified rather than replaced. Frontend follows the route group pattern already established.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations identified. Complexity tracking not required.
