# Phase 0 Research: Instructor-Student Hub

**Date**: 2026-06-30 | **Plan**: [plan.md](plan.md)

## Research Tasks

### R-001: Entity Model — Instructor-Student Relationship vs Existing Enrollment

**Decision**: Create new `InstructorStudent` entity. Keep existing `Enrollment` entity for backward compatibility but deprecate the course-enrollment flow in favor of course assignments.

**Rationale**: The existing `Enrollment` entity links a learner to a course (via `learnerId`, `courseId`, `status`). The new model links a student to an instructor globally, then assigns courses separately. Introducing a new `InstructorStudent` entity cleanly separates concerns — the `Enrollment` can be deprecated but existing data is preserved.

**Alternatives considered**:
- Repurpose `Enrollment` to represent instructor-student link: Too invasive, breaks existing data semantics.
- Add `instructorId` to `User` entity: Not suitable because a student can join multiple instructors.

### R-002: SubscriptionPlan Changes — Student Limit

**Decision**: Rename `maxStudentsPerCourse` to `maxTotalStudents` in `SubscriptionPlan` entity. Replace the per-course student limit with a global student cap across all courses for the instructor.

**Rationale**: The new model limits the total number of students an instructor can have under them, not per course. The existing field `maxStudentsPerCourse` (currently used by `SubscriptionGuardService.checkStudentAcceptance()`) must be replaced to reflect the new logic.

**Alternatives considered**:
- Add `maxTotalStudents` alongside existing field: Cleaner evolution path but introduces two limit concepts, causing confusion.

### R-003: Storage Expansion Plans

**Decision**: Implement storage add-ons as a new `StorageAddon` entity linked to `InstructorSubscription`, with a separate Stripe price ID. Storage add-ons have a configurable validity period matching the subscription. The `maxStorageBytes` field on `SubscriptionPlan` defines the base storage; `StorageAddon` provides additional bytes.

**Rationale**: The existing plan has a single `maxStorageBytes` per tier. Adding a purchasable add-on requires a separate entity to track cumulative storage. This follows the Stripe add-on pattern already used in the system.

**Alternatives considered**:
- Create separate `StoragePlan` entity: Over-engineered; an add-on link to the existing subscription is simpler.

### R-004: Invitation Token Strategy

**Decision**: Generate a signed JWT token for email invitations that encodes `instructorId` and `studentEmail`, expiring in 7 days. Use existing `@nestjs/jwt` with a dedicated secret. No OTP flow — single-click acceptance.

**Rationale**: Leverages existing JWT infrastructure. Signed tokens prevent tampering. 7-day expiry balances security with user convenience. No need for a separate token table — stateless verification.

**Alternatives considered**:
- UUID stored in DB (revocable but requires DB lookup).
- Short OTP (more complex UX, not needed for invitation flow).

### R-005: Rate Limiting for Invitation Endpoints

**Decision**: Apply `@nestjs/throttler` with limits of 20 invitations per hour per instructor and 5 join requests per hour per student. Use the existing rate limiting setup (if any) or configure a new guard.

**Rationale**: Prevents abuse of the invitation system (spamming, enumeration attacks). Follows the constitution's security-first principle.

### R-006: Email Template Updates

**Decision**: Create two new email templates using existing Handlebars setup: `student-invitation.hbs` (instructor invites student) and `join-request.hbs` (instructor receives request notification). Both in ar/en via existing i18n integration.

**Rationale**: The existing mail service already supports Handlebars templates. Adding two templates follows the existing pattern (e.g., `payment-confirmation.hbs`, `subscription-expiring.hbs`).

### R-007: Enrollment Deprecation Strategy

**Decision**: Mark `Enrollment` entity and its related controllers as `@deprecated`. Do not remove them in this feature — leave them operational for existing data. New flows use `InstructorStudent` + `CourseAssignment`. Remove Enrollment in a future cleanup feature.

**Rationale**: Existing data (learners enrolled in courses with pending/approved status) must remain accessible. Hard deletion would break existing user access and requires data migration. Deprecation with no new usage is the safest approach.

### R-008: Admin-Configurable Plan Validity Period

**Decision**: Add a `planValidityDays` column to the `AppSettings` or create a new `SystemConfig` entity (key-value store) that admins can update. Default value = 180 days (6 months). The `SubscriptionService` reads this config when creating/renewing subscriptions.

**Rationale**: The spec requires admin-configurable validity period. A simple key-value config table avoids hardcoding. Follows existing patterns if present.

**Alternatives considered**:
- Environment variable: Not runtime-configurable by admin.
- Hardcoded default: Does not satisfy the "admin configurable" requirement.
