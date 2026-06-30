# API Contracts: Instructor-Student Hub

This directory documents the HTTP API contracts for the Instructor-Student Hub feature.
All endpoints follow the existing NestJS controller pattern with `roleApi` routing.

## Instructor Endpoints

All instructor endpoints are prefixed with `instructor/students`.

### Invite Student

```
POST /instructor/students/invite
Body: { email: string }
Response: { success: true, data: { id: string, status: "invited" } }
Auth: JWT (role=instructor)
Rate limit: 20/hour per instructor
```

### List Students

```
GET /instructor/students?status=active&page=1&limit=20
Query: status (optional), page, limit
Response: { success: true, data: { items: StudentItem[], meta: PaginationMeta } }
Auth: JWT (role=instructor)
```

### View Pending Join Requests

```
GET /instructor/students/requests?page=1&limit=20
Response: { success: true, data: { items: JoinRequestItem[], meta: PaginationMeta } }
Auth: JWT (role=instructor)
```

### Respond to Join Request

```
PATCH /instructor/students/requests/:id/respond
Body: { action: "approve" | "decline" }
Response: { success: true, data: { id: string, status: "active" | "removed" } }
Auth: JWT (role=instructor)
```

### Assign Student to Courses

```
POST /instructor/students/:studentId/assign
Body: { courseIds: string[] }  // empty array = remove all, omit = assign all
Response: { success: true, data: { assignments: CourseAssignment[] } }
Auth: JWT (role=instructor)
```

### Get Student Assignments

```
GET /instructor/students/:studentId/assignments
Response: { success: true, data: { courseIds: string[] } }
Auth: JWT (role=instructor)
```

### Remove Student

```
DELETE /instructor/students/:id
Response: { success: true, data: { id: string, status: "removed" } }
Auth: JWT (role=instructor)
```

### View Subscription + Storage Usage

```
GET /instructor/subscription
Response: {
  success: true,
  data: {
    plan: { name, maxTotalStudents, maxStorageBytes, ... },
    usage: { totalStudents: number, storageBytes: number },
    storageAddons: StorageAddon[],
    expiryDate: string
  }
}
Auth: JWT (role=instructor)
```

## Student (Learner) Endpoints

All student endpoints are prefixed with `learner/instructors`.

### Search Instructors

```
GET /learner/instructors?q=searchTerm&page=1&limit=20
Response: { success: true, data: { items: InstructorItem[], meta: PaginationMeta } }
Auth: JWT (role=learner)
```

### Request to Join Instructor

```
POST /learner/instructors/:instructorId/join
Response: { success: true, data: { id: string, status: "requested" } }
Auth: JWT (role=learner)
Rate limit: 5/hour per student
```

### Accept Invitation (via token)

```
GET /learner/invitations/accept?token=jwt_token
Response: Redirect to dashboard on success, error page on failure
Auth: None (token-based)
```

### List My Instructors

```
GET /learner/my-instructors
Response: { success: true, data: { items: InstructorWithCourses[] } }
Auth: JWT (role=learner)
```

### View Instructor's Courses (Assigned Only)

```
GET /learner/my-instructors/:instructorId/courses
Response: { success: true, data: { courses: CourseItem[] } }
Auth: JWT (role=learner)
```

## Admin Endpoints

### Update System Config

```
PATCH /admin/settings
Body: { key: string, value: string }
Response: { success: true, data: { key, value } }
Auth: JWT (role=admin)
```

### Get System Config

```
GET /admin/settings
Response: { success: true, data: { settings: SystemConfig[] } }
Auth: JWT (role=admin)
```

## Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `STUDENT_LIMIT_REACHED` | 403 | Instructor has reached max total students |
| `INVITATION_EXPIRED` | 410 | Invitation token has expired |
| `ALREADY_LINKED` | 409 | Student is already linked to this instructor |
| `INSTRUCTOR_NOT_FOUND` | 404 | Instructor not found |
| `STUDENT_NOT_FOUND` | 404 | Student not in instructor's list |
| `INVALID_INVITATION_TOKEN` | 400 | Invalid or malformed token |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `SUBSCRIPTION_EXPIRED` | 403 | Instructor's subscription has expired |
| `STORAGE_LIMIT_REACHED` | 403 | Storage limit exceeded (uploads blocked) |
