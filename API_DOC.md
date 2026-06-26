# LMS API Documentation

Base URL: `/api`

This document details the REST API endpoints available in the LMS application, including request methods, authorization requirements, request body schemas, and response formats.

---

## 1. Authentication (`/auth`)

### `POST /auth/register`
Register a new user account.

**Request Body (JSON):**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "LEARNER" // or "INSTRUCTOR"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "LEARNER"
  }
}
```

---

### `POST /auth/login`
Authenticate a user and receive access & refresh tokens.

**Request Body (JSON):**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhb...",
  "refreshToken": "eyJhb...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "LEARNER"
  }
}
```

---

### `POST /auth/verify-email`
Verify a new user's email using the 6-digit OTP code sent during registration.

**Request Body (JSON):**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### `POST /auth/send-otp`
Resend a verification OTP email to the user.

**Request Body (JSON):**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Verification code sent to email"
}
```

---

### `POST /auth/forgot-password`
Request a password reset email.

**Request Body (JSON):**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "If an account exists, a reset link has been sent."
}
```

---

### `POST /auth/reset-password`
Reset password using the reset token.

**Request Body (JSON):**
```json
{
  "token": "reset_token_string",
  "newPassword": "NewPassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### `POST /auth/refresh`
Refresh access token using refresh token.

**Request Body (JSON):**
```json
{
  "refreshToken": "eyJhb..."
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhb..."
}
```

---

### `POST /auth/logout`
Logout user and invalidate the session.
*Requires Bearer Token*

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 2. Profile & Settings (`/profile`)
All routes require a bearer token in the `Authorization` header.

### `GET /profile/me`
Get current authenticated user profile.
*Requires Bearer Token*

**Response (200 OK):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "LEARNER",
  "lang": "en",
  "mode": "light",
  "profileImageUrl": "https://res.cloudinary.com/..."
}
```

---

### `PATCH /profile/me`
Update user profile information.
*Requires Bearer Token*

**Request Body (JSON):**
```json
{
  "firstName": "Johnny",
  "lastName": "Doe"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "Johnny",
  "lastName": "Doe",
  "role": "LEARNER",
  "lang": "en",
  "mode": "light",
  "profileImageUrl": "https://res.cloudinary.com/..."
}
```

---

### `PATCH /profile/me/preferences`
Update user UI language and theme mode preferences.
*Requires Bearer Token*

**Request Body (JSON):**
```json
{
  "lang": "ar", // "ar" or "en"
  "mode": "dark" // "light" or "dark"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "Johnny",
  "lastName": "Doe",
  "role": "LEARNER",
  "lang": "ar",
  "mode": "dark",
  "profileImageUrl": "https://res.cloudinary.com/..."
}
```

---

### `POST /profile/me/avatar`
Upload or update profile avatar image.
*Requires Bearer Token*

**Request Body (multipart/form-data):**
- `file`: (Binary image file)

**Response (201 Created):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "Johnny",
  "lastName": "Doe",
  "role": "LEARNER",
  "lang": "ar",
  "mode": "dark",
  "profileImageUrl": "https://res.cloudinary.com/..."
}
```

---

## 3. Learner Portal (`/learner`)
All routes require a bearer token with role `LEARNER`.

### `GET /learner/instructors`
Get a list of all instructors in the system (paginated).

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "firstName": "Jane",
      "lastName": "Smith",
      "profileImageUrl": "https://..."
    }
  ],
  "meta": {
    "totalItems": 5,
    "itemCount": 1,
    "itemsPerPage": 10,
    "totalPages": 1,
    "currentPage": 1
  }
}
```

---

### `GET /learner/instructors/:id`
Get detailed profile of a specific instructor.

**Response (200 OK):**
```json
{
  "id": "uuid",
  "firstName": "Jane",
  "lastName": "Smith",
  "profileImageUrl": "https://...",
  "role": "INSTRUCTOR"
}
```

---

### `GET /learner/courses`
List all visible public courses available to enroll.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Introduction to TypeScript",
      "description": "Learn the basics",
      "visibility": "PUBLIC",
      "thumbnailUrl": "https://...",
      "instructor": {
        "id": "uuid",
        "firstName": "Jane",
        "lastName": "Smith"
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### `GET /learner/courses/:id`
Get public course information details (videos and contents are stripped from public preview).

**Response (200 OK):**
```json
{
  "id": "uuid",
  "title": "Introduction to TypeScript",
  "description": "Learn the basics",
  "visibility": "PUBLIC",
  "thumbnailUrl": "https://...",
  "instructor": {
    "id": "uuid",
    "firstName": "Jane",
    "lastName": "Smith"
  },
  "videos": []
}
```

---

### `POST /learner/courses/:courseId/enroll`
Request enrollment/access to a course.

**Response (201 Created):**
```json
{
  "id": "uuid",
  "status": "PENDING", // "PENDING", "APPROVED", "REJECTED"
  "courseId": "uuid",
  "learnerId": "uuid",
  "createdAt": "timestamp"
}
```

---

### `GET /learner/my-courses`
List all courses the authenticated learner is enrolled in.

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "status": "APPROVED",
    "course": {
      "id": "uuid",
      "title": "Introduction to TypeScript",
      "description": "Learn the basics",
      "thumbnailUrl": "https://...",
      "instructor": {
        "id": "uuid",
        "firstName": "Jane",
        "lastName": "Smith"
      }
    }
  }
]
```

---

### `GET /learner/my-courses/:courseId`
Retrieve full course details and syllabus content list for an enrolled course.
*Fails with 403 Forbidden if not enrolled and approved.*

**Response (200 OK):**
```json
{
  "id": "uuid",
  "title": "Introduction to TypeScript",
  "description": "Learn the basics",
  "thumbnailUrl": "https://...",
  "instructor": {
    "id": "uuid",
    "firstName": "Jane",
    "lastName": "Smith"
  },
  "contents": [
    {
      "id": "uuid",
      "title": "1. Getting Started",
      "description": "First introduction video",
      "contentType": "VIDEO",
      "sortOrder": 1
    }
  ]
}
```

---

### `GET /learner/my-courses/:courseId/content`
Get paginated course content list for the course.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "1. Getting Started",
      "description": "First introduction video",
      "contentType": "VIDEO",
      "sortOrder": 1
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

---

### `GET /learner/my-courses/:courseId/content/:contentId`
Retrieve metadata and secure streaming URL for a specific content video.

**Response (200 OK):**
```json
{
  "id": "uuid",
  "title": "1. Getting Started",
  "description": "First introduction video",
  "contentType": "VIDEO",
  "url": "https://res.cloudinary.com/.../video.mp4",
  "sortOrder": 1
}
```

---

## 4. Instructor Portal (`/instructor`)
All routes require a bearer token with role `INSTRUCTOR`.

### `GET /instructor/courses`
List all courses created by the authenticated instructor.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Advanced NestJS Patterns",
      "visibility": "PUBLIC",
      "isActive": true
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

---

### `POST /instructor/courses`
Create a new course.

**Request Body (JSON):**
```json
{
  "title": "Advanced NestJS Patterns",
  "description": "Deep dive into architecture",
  "visibility": "PUBLIC", // "PUBLIC" or "PRIVATE"
  "thumbnailUrl": "https://example.com/image.png" // Optional
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "title": "Advanced NestJS Patterns",
  "description": "Deep dive into architecture",
  "visibility": "PUBLIC",
  "thumbnailUrl": "https://example.com/image.png",
  "instructorId": "uuid"
}
```

---

### `GET /instructor/courses/stats/dashboard`
Retrieve metrics/statistics for the instructor's dashboard (total courses, students, enrollments).

**Response (200 OK):**
```json
{
  "totalCourses": 5,
  "totalActiveStudents": 42,
  "pendingEnrollments": 3,
  "monthlyGrowth": 12
}
```

---

### `GET /instructor/courses/:id`
Get detailed view of a course owned by the instructor.

**Response (200 OK):**
```json
{
  "id": "uuid",
  "title": "Advanced NestJS Patterns",
  "description": "Deep dive into architecture",
  "visibility": "PUBLIC",
  "thumbnailUrl": "https://example.com/image.png"
}
```

---

### `PATCH /instructor/courses/:id`
Update course details.

**Request Body (JSON):**
```json
{
  "title": "Updated NestJS Title",
  "visibility": "PRIVATE",
  "isActive": true
}
```

---

### `DELETE /instructor/courses/:id`
Delete a course.

**Response (200 OK):**
```json
{
  "id": "uuid",
  "deleted": true
}
```

---

### `GET /instructor/courses/:courseId/enrollments`
Get all enrollments and pending registration requests for a specific course.

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "status": "PENDING",
    "learner": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "learner@example.com"
    }
  }
]
```

---

### `PATCH /instructor/enrollments/:id/respond`
Respond (Approve or Reject) to a student's pending enrollment request.

**Request Body (JSON):**
```json
{
  "status": "APPROVED" // "APPROVED" or "REJECTED"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "status": "APPROVED"
}
```

---

### `POST /instructor/courses/:courseId/invite`
Invite a student to enroll in a course by email. Automatically grants approved enrollment status once the user signs up.

**Request Body (JSON):**
```json
{
  "email": "invitee@example.com"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "status": "APPROVED",
  "courseId": "uuid",
  "email": "invitee@example.com"
}
```

---

### `DELETE /instructor/enrollments/:id`
Remove a student enrollment or reject/cancel a request.

**Response (200 OK):**
```json
{
  "id": "uuid",
  "deleted": true
}
```

---

### `GET /instructor/courses/:courseId/content`
Get list of uploaded videos/contents in the course.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Syllabus Overview",
      "contentType": "VIDEO",
      "sortOrder": 1,
      "url": "https://..."
    }
  ]
}
```

---

### `POST /instructor/courses/:courseId/content`
Upload and append new video content to the course.
*Supports file upload to Cloudinary/Local storage.*

**Request Body (multipart/form-data):**
- `file`: (Binary video/document file)
- `title`: "Syllabus Overview"
- `description`: "Introductory content" (Optional)

**Response (201 Created):**
```json
{
  "id": "uuid",
  "title": "Syllabus Overview",
  "description": "Introductory content",
  "url": "https://...",
  "contentType": "VIDEO",
  "sortOrder": 2
}
```

---

### `PATCH /instructor/courses/:courseId/content/reorder`
Reorder course contents.

**Request Body (JSON):**
```json
{
  "videoIds": ["uuid-content-2", "uuid-content-1", "uuid-content-3"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Content reordered successfully"
}
```

---

### `PATCH /instructor/courses/:courseId/content/:contentId`
Update title or description of a course content.

**Request Body (JSON):**
```json
{
  "title": "Updated Content Title"
}
```

---

### `DELETE /instructor/courses/:courseId/content/:contentId`
Remove a course content video.

**Response (200 OK):**
```json
{
  "contentId": "uuid",
  "deleted": true
}
```

---

## 5. Admin Portal (`/admin`)
All routes require a bearer token with role `ADMIN`.

### `GET /admin/users`
List and manage all registered users in the database (paginated).

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "LEARNER"
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 10
  }
}
```

---

### `POST /admin/users`
Create a new user.

**Request Body (JSON):**
```json
{
  "email": "newuser@example.com",
  "password": "Password123!",
  "firstName": "New",
  "lastName": "User",
  "role": "INSTRUCTOR"
}
```

---

### `GET /admin/users/:id`
Get detailed user profile of any user.

---

### `PATCH /admin/users/:id`
Update any user profile fields.

**Request Body (JSON):**
```json
{
  "role": "ADMIN",
  "firstName": "Super"
}
```

---

### `DELETE /admin/users/:id`
Deactivate/remove any user.

**Response (200 OK):**
```json
{
  "id": "uuid",
  "deactivated": true
}
```

---

### `GET /admin/courses`
List all courses in the system.

---

### `GET /admin/courses/:id`
Get any course details.

---

### `PATCH /admin/courses/:id`
Update any course details.

---

### `DELETE /admin/courses/:id`
Delete any course.

---

### `GET /admin/enrollments`
List all enrollment records in the system.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "status": "APPROVED",
      "learner": {
        "id": "uuid",
        "firstName": "John",
        "email": "learner@example.com"
      },
      "course": {
        "id": "uuid",
        "title": "TypeScript 101"
      }
    }
  ]
}
```

---

### `PATCH /admin/enrollments/:id`
Directly respond or edit enrollment status as an admin.

**Request Body (JSON):**
```json
{
  "status": "APPROVED" // "PENDING", "APPROVED", "REJECTED"
}
```

---

## 6. Notifications (`/notifications`)
All routes require a Bearer Token.

### `GET /notifications`
Fetch all active notifications for the current user.

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "title": "Welcome to LMS",
    "message": "You have successfully registered.",
    "read": false,
    "createdAt": "timestamp"
  }
]
```

---

### `PATCH /notifications/:id/read`
Mark a notification as read.

**Response (200 OK):**
```json
{
  "id": "uuid",
  "read": true
}
```

---

### `POST /notifications/read-all`
Mark all notifications of the user as read.

**Response (201 Created):**
```json
{
  "success": true
}
```
