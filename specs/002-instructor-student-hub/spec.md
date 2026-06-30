# Feature Specification: Instructor-Student Hub

**Feature Branch**: `002-instructor-student-hub`

**Created**: 2026-06-30

**Status**: Draft

**Input**: User description: "besiness logic now changes from the course has enrollment students under , to this , the instrucor has students under him who will be ables to see all the instrucors courses and content the instrucor control this like first add student by there email , we send email to the students to join under this instrucor if the student has a ccount just join them by accepting the invet if not have account they must create on then automatic join them , or the student could search for the instrucor and request to join to him,so the subscription now will limit the number of stuent that the teacher could have under him , he could create as many as he want of courses , but he only has 10 gb storage limit , but he could expand the limit by buying storage so we need storage plans , teacher could assiag his student under the courses to enable them to see the content of the course could assiage to all courses or just one or two course as he need ,chang the relations and the logic and the ui"

## User Scenarios & Testing

### User Story 1 - Instructor invites a student by email (Priority: P1)

The instructor adds a student's email address through their dashboard. The system sends an invitation email. If the student already has an account, they log in and accept the invitation, which immediately links them to the instructor. If the student does not have an account, they are guided through registration, and upon completion, they are automatically linked to the instructor.

**Why this priority**: This is the primary way instructors build their student base — the core workflow of the feature.

**Independent Test**: An instructor enters a valid email, system sends an email, and student completes the join flow. The instructor can then see the student in their student list and assign them to courses.

**Acceptance Scenarios**:

1. **Given** an instructor is on their dashboard, **When** they enter a student email that is not yet registered, **Then** the system sends an invitation email with a registration link, and the email address is recorded as pending.
2. **Given** a student receives an invitation email and already has an account, **When** they click the link and log in, **Then** they are automatically linked to the instructor without further steps.
3. **Given** a student receives an invitation email and does not have an account, **When** they click the link and complete registration, **Then** they are automatically linked to the instructor upon successful registration.
4. **Given** an instructor has reached their student limit per subscription, **When** they try to invite a new student, **Then** the system blocks the invitation and prompts them to upgrade their plan.

---

### User Story 2 - Student searches for an instructor and requests to join (Priority: P2)

A student who already has an account can search for an instructor by name or other identifier and send a join request. The instructor receives the request and can approve or decline it.

**Why this priority**: Provides an alternative, student-initiated path to link with an instructor, reducing the instructor's manual effort.

**Independent Test**: A student searches for an instructor, sends a request, and the instructor approves it. The student then appears in the instructor's student list.

**Acceptance Scenarios**:

1. **Given** a logged-in student, **When** they search for an instructor by name and find the correct profile, **Then** they see a "Request to Join" option.
2. **Given** a student sends a join request, **When** the instructor views their pending requests, **Then** they can approve or decline the request with one click.
3. **Given** a student sends a join request to an instructor who has reached their student limit, **When** the instructor tries to approve, **Then** the system blocks the approval and prompts the instructor to upgrade their plan.
4. **Given** a student has already been invited by or joined an instructor, **When** they try to send another request to the same instructor, **Then** the system notifies them that they are already linked.

---

### User Story 3 - Instructor assigns students to courses (Priority: P2)

The instructor views their student list and can assign individual students or groups to specific courses. A student assigned to a course gains access to that course's content. The instructor can assign a student to all their courses or select specific ones.

**Why this priority**: This is the mechanism that grants students access to content — essential for the learning workflow.

**Independent Test**: An instructor assigns a student to two out of five courses. The student can only see those two courses in their dashboard.

**Acceptance Scenarios**:

1. **Given** an instructor has students linked to them, **When** they select a student, **Then** they see a list of all their courses with checkboxes to toggle access.
2. **Given** an instructor selects "Assign to All Courses", **When** they confirm, **Then** the student gains access to every course the instructor has created.
3. **Given** an instructor assigns a student to specific courses, **When** the student logs in, **Then** they see only those assigned courses in their dashboard and can access their content.
4. **Given** an instructor removes a student from a course assignment, **When** the student next accesses the platform, **Then** that course is no longer visible to them.

---

### User Story 4 - Instructor manages storage and subscription limits (Priority: P3)

The instructor can view their current storage usage and student count against plan limits. They can purchase additional storage through predefined plans when they near their limit.

**Why this priority**: Storage expansion is important for instructors with rich content, but the default 10 GB serves most initial use cases.

**Independent Test**: An instructor with 9.5 GB used receives a warning, purchases an additional 10 GB plan, and the limit updates to 20 GB.

**Acceptance Scenarios**:

1. **Given** an instructor is on the default plan (10 GB storage, student limit based on subscription), **When** they visit their plan settings, **Then** they see their current usage and available upgrade options.
2. **Given** an instructor's storage exceeds 90% usage, **When** they upload new content or access their dashboard, **Then** the system displays a warning notification.
3. **Given** an instructor purchases a storage expansion plan, **When** the purchase is confirmed, **Then** their storage limit increases immediately.
4. **Given** an instructor has reached their student limit, **When** they view their plan, **Then** they see upgrade options that include higher student caps.

### Edge Cases

- What happens when an invited student's email is already linked to another instructor account?
- How does the system handle a student who was invited but never completes registration (pending invitations)?
- What happens to students linked to an instructor when the instructor's subscription expires or is downgraded?
- How are course assignments handled when an instructor deletes a course that has assigned students?
- What happens to a student's access when the instructor removes them from their student list?
- What happens to linked students and their course access when an instructor's subscription expires and they are within the grace period?
- How does the system handle a student who is linked to Instructor A (expired subscription) and Instructor B (active subscription) — do they lose access to A's courses only?

## Requirements

### Functional Requirements

- **FR-001**: Instructors MUST be able to add students by entering their email address through the instructor dashboard.
- **FR-002**: The system MUST send an invitation email to the student's email address when an instructor initiates an invitation.
- **FR-003**: Students receiving an invitation MUST be able to accept it by logging into their existing account.
- **FR-004**: Students receiving an invitation who do not have an account MUST be guided through registration and automatically linked to the instructor upon completion.
- **FR-005**: Students MUST be able to search for instructors by name or identifier from their dashboard.
- **FR-006**: Students MUST be able to send a join request to a found instructor.
- **FR-007**: Instructors MUST be able to view and manage (approve/decline) pending student join requests.
- **FR-008**: Instructors MUST be able to view all students linked to them in a centralized student list.
- **FR-009**: Instructors MUST be able to assign linked students to specific courses (select one, multiple, or all courses).
- **FR-010**: Students MUST only see and access courses they have been assigned to by their instructor.
- **FR-011**: The subscription model MUST limit the number of students an instructor can have under them.
- **FR-012**: Instructors MUST have a default storage limit of 10 GB for all their course content combined.
- **FR-013**: Instructors MUST be able to purchase storage expansion plans to increase their storage limit.
- **FR-014**: The system MUST track and display current student count and storage usage against plan limits to the instructor.
- **FR-015**: The system MUST prevent instructors from exceeding their student limit (block new invitations or approvals when at cap).
- **FR-016**: The system MUST notify instructors when storage usage exceeds 90% of their limit.
- **FR-017**: Instructors MUST be able to remove a student from their student list, which revokes access to all assigned courses.
- **FR-018**: Instructors MUST be able to remove a student's access to a specific course without removing them from the student list.

- **FR-019**: The system MUST allow a student to be linked to multiple instructors simultaneously.

- **FR-020**: The system MUST provide subscription and storage plans with a fixed validity period (default 6 months) that MUST be renewed upon expiry. The validity period MUST be configurable by an admin via system settings.

- **FR-021**: The system MUST notify instructors before their subscription or storage plan expires (e.g., 30 days, 14 days, 7 days, and 1 day before expiry).

- **FR-022**: When a subscription expires, the system MUST suspend the instructor's ability to add new students until the subscription is renewed. Existing student access to course content MUST remain intact during a grace period configurable by the admin.

- **FR-023**: When a storage plan expires, the instructor's storage limit MUST revert to the default (10 GB) or the next lower active tier. The system MUST prevent new content uploads if storage usage exceeds the reverted limit.

### Key Entities

- **Instructor**: A user role that manages courses, has a student list, and holds a subscription with student count and storage limits.
- **Student**: A user role that joins under an instructor, can be assigned to courses, and accesses course content.
- **Instructor-Student Link**: The relationship that connects a student to an instructor, created via invitation (email) or student request. Governed by the instructor's student limit.
- **Course Assignment**: Maps a specific student to a specific course under an instructor, granting the student access to that course's content.
- **Subscription Plan**: Defines the maximum number of students an instructor can have linked to them, with a configurable validity period that requires renewal upon expiry.
- **Storage Plan**: A purchasable add-on that increases the instructor's total storage capacity beyond the default 10 GB, with a configurable validity period that requires renewal upon expiry.
- **Admin Settings**: System-wide configuration that allows administrators to set the default validity period for all plans (subscription and storage).

## Success Criteria

### Measurable Outcomes

- **SC-001**: Instructors can invite a student by email and have them linked in under 3 minutes (end-to-end, assuming the student responds promptly).
- **SC-002**: Students can find an instructor, send a request, and be approved within 2 clicks from the search results.
- **SC-003**: Instructors can assign students to courses in under 30 seconds per student using the bulk assign feature.
- **SC-004**: Storage upgrades take effect immediately upon purchase confirmation, with zero downtime.
- **SC-005**: The system prevents instructors from exceeding their student limit in 100% of cases (no edge-case overflows).
- **SC-006**: Instructors with near-full storage receive a warning notification within 5 minutes of crossing the 90% threshold.
- **SC-007**: Instructors receive expiry notifications at the configured intervals (30, 14, 7, 1 day before expiry) with at least 99% email delivery rate.
- **SC-008**: Expired subscriptions correctly block new student additions while preserving existing student access during the grace period, with zero data loss.

## Assumptions

- The system already has user registration, authentication, and role management (instructor vs. student roles).
- An existing course creation and content management system is already in place.
- Email delivery infrastructure (SMTP/email service) is already configured.
- The default free subscription allows a reasonable number of students (e.g., 30 students) before requiring a paid plan upgrade.
- Subscription and storage plans have a default validity period of 6 months, configurable by the admin.
- Payment processing for plans will be handled by an existing or new payment integration (not specified in this feature).
- Notifications beyond email (in-app notifications) are assumed to exist or will be added as part of the broader notification system.
- A student's course access is read-only — they can view content but not modify courses.
- Storage limits apply to all content across all courses owned by the instructor (file uploads, media, documents, etc.).
