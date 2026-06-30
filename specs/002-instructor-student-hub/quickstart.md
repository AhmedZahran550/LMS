# Quickstart Validation Guide: Instructor-Student Hub

Use these scenarios to validate the feature end-to-end after implementation.

## Prerequisites

- Local dev environment running: `pnpm dev` starts all 3 apps
- PostgreSQL running in Docker: `docker compose up -d`
- Run pending migrations: `pnpm run migration:run` (from `apps/api`)
- Seed subscription plans: (add script command here if exists)
- Three test accounts: Instructor A (role=instructor), Student B (role=learner), Student C (role=learner, unregistered email)

## Scenario 1: Instructor Invites a Registered Student

1. **Login** as Instructor A → navigate to `instructor/students`
2. **Click** "Invite Student" → enter Student B's email
3. **Verify**: Student B appears in student list with status "invited"
4. **Check** email inbox → Student B received invitation email
5. **Login** as Student B → click invitation link
6. **Verify**: Student B sees Instructor A in their "My Instructors" list
7. **Verify** (instructor side): Student B status changed to "active"

**Expected outcome**: End-to-end invite-accept flow completes in under 3 minutes.

## Scenario 2: Instructor Invites an Unregistered User

1. **Login** as Instructor A → invite an unregistered email
2. **Check** email → invitation contains registration link
3. **Click** link → redirected to registration page (with invitation context)
4. **Complete** registration → auto-linked to Instructor A
5. **Verify**: New user appears in Instructor A's student list as "active"

**Expected outcome**: Registration + auto-link works seamlessly.

## Scenario 3: Student Requests to Join an Instructor

1. **Login** as Student C → navigate to `learner/instructors`
2. **Search** for Instructor A → click "Request to Join"
3. **Login** as Instructor A → navigate to `instructor/students/requests`
4. **Verify**: Student C's request appears → click "Approve"
5. **Verify**: Student C now in active student list
6. **Login** as Student C → verify Instructor A appears in "My Instructors"

**Expected outcome**: Student-initiated join flow works.

## Scenario 4: Instructor Assigns Students to Courses

1. **Login** as Instructor A → navigate to student list
2. **Select** Student B → click "Assign to Courses"
3. **Select** 2 courses out of 5 → confirm
4. **Login** as Student B → navigate to Instructor A's courses
5. **Verify**: Only the 2 assigned courses are visible
6. **Verify**: Course content for those 2 courses is accessible
7. **Verify**: The other 3 courses are not visible

**Expected outcome**: Course assignment scopes content access correctly.

## Scenario 5: Student Limit Enforcement

1. **Ensure** Instructor A's plan has `maxTotalStudents = 2`
2. **Verify** Instructor A already has Student B and Student C (2 active students)
3. **Attempt** to invite a 3rd student → system blocks with "Student limit reached" error
4. **Attempt** to approve a pending request → system blocks with same error
5. **Verify**: Error message includes upgrade prompt

**Expected outcome**: Student limit is enforced at all entry points.

## Scenario 6: Storage Limit and Add-on Purchase

1. **Login** as Instructor A → navigate to subscription page
2. **Verify**: Shows current storage usage (e.g., 2.1 GB / 10 GB)
3. **Upload** content until storage exceeds 9 GB (90%)
4. **Verify**: Warning notification appears on dashboard
5. **Purchase** a 10 GB storage add-on via Stripe checkout
6. **Verify**: Storage limit updates to 20 GB immediately
7. **Verify**: Storage add-on appears in subscription details

**Expected outcome**: Storage tracking, warnings, and add-on purchase work.

## Scenario 7: Subscription Expiry

1. **Set** `plan_validity_days` in system config to `1` (or manually expire subscription via DB)
2. **Verify**: Instructor A receives expiry notifications at 30/14/7/1 day intervals
3. **After expiry**: Instructor A cannot invite new students
4. **Verify**: Existing students (B and C) can still access their assigned courses
5. **Renew** subscription → verify invite capability is restored

**Expected outcome**: Expiry handling with grace period works.

## Scenario 8: Student Linked to Multiple Instructors

1. **Create** Instructor B (separate from A)
2. **Login** as Student B → search for and join Instructor B
3. **Verify**: Student B is linked to both Instructor A and Instructor B
4. **Login** as Student B → navigate to "My Instructors"
5. **Verify**: Both instructors appear with their respective courses
6. **Access** courses from Instructor A → works
7. **Access** courses from Instructor B → works

**Expected outcome**: Multi-instructor linking works independently.

## Scenario 9: Instructor Removes a Student

1. **Login** as Instructor A → navigate to student list
2. **Remove** Student C from student list
3. **Login** as Student C → verify Instructor A and their courses are no longer visible
4. **Login** as Instructor A → verify Student C shows status "removed"
5. **Verify**: Student C count decremented in plan usage

**Expected outcome**: Removal revokes all course access and reflects in limits.

## Run Validation

```bash
# Run backend tests
cd apps/api && pnpm test -- --testPathPattern="instructor-students"

# Run frontend tests
cd apps/web && pnpm test -- --testPathPattern="instructor-students"

# Manual E2E (requires running apps)
# Follow scenarios 1-9 above
```

See [contracts/README.md](contracts/README.md) for API endpoint details and [data-model.md](data-model.md) for entity structure.
