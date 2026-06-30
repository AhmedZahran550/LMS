# Data Model: Instructor-Student Hub

**Date**: 2026-06-30 | **Plan**: [plan.md](plan.md)

## Entity Overview

### NEW: InstructorStudent

Represents the link between an instructor and a student. A student can be linked to multiple instructors. Governed by the instructor's `maxTotalStudents` plan limit.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID (PK) | Auto-generated | |
| `instructorId` | UUID (FK → User) | NOT NULL, indexed | The instructor |
| `studentId` | UUID (FK → User) | NOT NULL, indexed | The student (role=learner) |
| `status` | enum | `invited` / `requested` / `active` / `removed` | Current state of the link |
| `invitedBy` | enum | `instructor` / `student` | Who initiated the link |
| `invitationToken` | string? | Nullable, `@Exclude()` | JWT token for email invitation |
| `invitationSentAt` | timestamp? | | When invitation was sent |
| `respondedAt` | timestamp? | | When invitation/request was responded to |
| `createdAt` | timestamp | Auto-generated | |
| `updatedAt` | timestamp | Auto-generated | |
| `deletedAt` | timestamp? | Soft delete | |

**Unique constraint**: `[instructorId, studentId]` — prevents duplicate links.

**Index**: `[instructorId, status]` — for querying active vs pending links.
**Index**: `[studentId, status]` — for student's instructor list.

**State transitions**:
```
invited ──(student accepts)──► active
requested ──(instructor approves)──► active
active ──(instructor removes)──► removed
invited ──(expired token)──► removed (auto-cleanup)
```

---

### NEW: CourseAssignment

Maps a student (via InstructorStudent link) to a specific course for content access.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID (PK) | Auto-generated | |
| `instructorStudentId` | UUID (FK → InstructorStudent) | NOT NULL, CASCADE on delete | The student link |
| `courseId` | UUID (FK → Course) | NOT NULL, CASCADE on delete | The assigned course |
| `assignedAt` | timestamp | Auto-generated | |
| `createdAt` | timestamp | Auto-generated | |
| `updatedAt` | timestamp | Auto-generated | |

**Unique constraint**: `[instructorStudentId, courseId]` — prevents duplicate assignments.

**Index**: `[instructorStudentId]` — for fetching all assignments for a student.
**Index**: `[courseId]` — for fetching all students assigned to a course.

---

### NEW: StorageAddon

Represents a purchasable storage expansion linked to an instructor's subscription.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID (PK) | Auto-generated | |
| `instructorSubscriptionId` | UUID (FK → InstructorSubscription) | NOT NULL, CASCADE on delete | Parent subscription |
| `additionalBytes` | bigint | NOT NULL | Additional storage capacity in bytes |
| `stripePriceId` | string? | | Stripe price ID for this add-on |
| `stripeInvoiceId` | string? | | Stripe invoice ID for purchase |
| `startDate` | timestamp | NOT NULL | When add-on becomes active |
| `endDate` | timestamp? | | Add-on expiry (matches subscription) |
| `isActive` | boolean | default true | |
| `createdAt` | timestamp | Auto-generated | |
| `updatedAt` | timestamp | Auto-generated | |

---

### NEW: SystemConfig

Key-value store for admin-configurable system-wide settings.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `key` | string (PK) | NOT NULL, unique | Config key (e.g., `plan_validity_days`) |
| `value` | text | NOT NULL | Config value (e.g., `180`) |
| `description` | text? | | Human-readable description |
| `updatedAt` | timestamp | Auto-generated | |

**Seed data**: `plan_validity_days = 180`

---

### MODIFIED: SubscriptionPlan

| Field | Change | Description |
|-------|--------|-------------|
| `maxStudentsPerCourse` | **RENAMED** → `maxTotalStudents` | Global student cap across all courses |
| `maxCourses` | **KEPT** | Instructor can create unlimited courses per spec; kept for future use or set high |
| `maxStorageBytes` | **KEPT** | Base storage included with plan |
| `trialDays` | **KEPT** | Trial period in days |

The `maxTotalStudents` field replaces `maxStudentsPerCourse`. Existing plans (free/pro/plus) must be reseeded with appropriate `maxTotalStudents` values (e.g., free=30, pro=100, plus=unlimited).

---

### MODIFIED: InstructorSubscription

| Field | Change | Description |
|-------|--------|-------------|
| `endDate` | **NOW REQUIRED** if not trialing | Subscription validity end date |
| `autoRenew` | **KEPT** | Auto-renew on expiry |

Storage add-ons are tracked via the new `StorageAddon` entity (linked by `instructorSubscriptionId`).

---

### DEPRECATED: Enrollment

Kept as-is for backward compatibility. No new endpoints or features will use it. Mark entity and all related controllers as `@deprecated`.

---

## Entity Relationship Diagram

```
User (role=instructor)
  │
  │ 1:N
  ├──► Course ──1:N──► CourseContent
  │     │
  │     │ 1:N
  │     └──► CourseAssignment ──N:1──► InstructorStudent
  │                                      │
  │ 1:N ──────────────────────────────────┘
  │
  └──► InstructorSubscription ──N:1──► SubscriptionPlan
          │
          │ 1:N
          └──► StorageAddon

User (role=learner)
  │
  │ 1:N ────────────────────────────────► InstructorStudent
  │
  └──► Enrollment (DEPRECATED) ──N:1──► Course
```
