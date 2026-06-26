# LMS API Documentation

Base URL: `/api`

This document details the REST API endpoints available in the LMS application, including request methods, parameters, request body schemas, and response formats.

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

### `POST /auth/login`
Authenticate a user and receive tokens.

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

### `POST /auth/reset-password`
Reset password using token.

**Request Body (JSON):**
```json
{
  "token": "reset_token_string",
  "newPassword": "NewPassword123!"
}
```

### `POST /auth/logout`
Logout user and invalidate session.
*Requires Bearer Token*

---

## 2. Users & Profile (`/users`)

### `GET /users/me`
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
  "mode": "light"
}
```

### `PATCH /users/profile`
Update user profile information.
*Requires Bearer Token*

**Request Body (JSON):**
```json
{
  "firstName": "Johnny",
  "lastName": "Doe"
}
```

### `PATCH /users/preferences`
Update user UI preferences (language, theme).
*Requires Bearer Token*

**Request Body (JSON):**
```json
{
  "lang": "ar",
  "mode": "dark"
}
```

---

## 3. Courses (`/courses`)

### `GET /courses`
List all visible courses with pagination.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string)
- `filter.visibility` (string, e.g. `$eq:PUBLIC`)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Introduction to TypeScript",
      "description": "Learn the basics",
      "visibility": "PUBLIC",
      "instructor": {
        "firstName": "Jane",
        "lastName": "Smith"
      }
    }
  ],
  "meta": {
    "totalItems": 1,
    "itemCount": 1,
    "itemsPerPage": 10,
    "totalPages": 1,
    "currentPage": 1
  }
}
```

### `POST /courses`
Create a new course.
*Requires Bearer Token (Instructor/Admin)*

**Request Body (JSON):**
```json
{
  "title": "Advanced TypeScript",
  "description": "Deep dive into generics",
  "visibility": "PRIVATE",
  "thumbnailUrl": "https://example.com/image.png"
}
```

### `PATCH /courses/:id`
Update course details.
*Requires Bearer Token (Instructor/Admin)*

**Request Body (JSON):**
```json
{
  "title": "Advanced TypeScript 2024",
  "visibility": "PUBLIC"
}
```

### `DELETE /courses/:id`
Delete a course.
*Requires Bearer Token (Instructor/Admin)*

---

## 4. Course Content (`/courses/:courseId/contents`)

### `GET /courses/:courseId/contents`
Get content files/videos for a course.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Intro Lecture",
      "description": "First video",
      "contentType": "VIDEO",
      "size": 1024000,
      "url": "/uploads/video.mp4"
    }
  ]
}
```

### `POST /courses/:courseId/contents`
Upload new content to a course.
*Requires Bearer Token (Instructor/Admin)*

**Request Body (multipart/form-data):**
- `file`: (Binary file)
- `title`: "Intro Lecture"
- `description`: "First video"

---

## 5. Enrollments (`/enrollments` & `/courses/:id/enroll`)

### `POST /courses/:id/enroll`
Learner requests to enroll in a course.
*Requires Bearer Token (Learner)*

**Response (201 Created):**
```json
{
  "id": "uuid",
  "status": "PENDING",
  "courseId": "uuid",
  "learnerId": "uuid"
}
```

### `GET /courses/:id/enrollments`
Get all enrollments for a course.
*Requires Bearer Token (Instructor)*

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "status": "APPROVED",
    "learner": {
      "firstName": "John",
      "email": "user@example.com"
    }
  }
]
```

### `POST /enrollments/:id/respond`
Instructor responds to a pending enrollment request.
*Requires Bearer Token (Instructor)*

**Request Body (JSON):**
```json
{
  "status": "APPROVED" // or "REJECTED"
}
```

### `POST /courses/:id/invite`
Instructor invites a learner by email.
*Requires Bearer Token (Instructor)*

**Request Body (JSON):**
```json
{
  "email": "newlearner@example.com"
}
```

### `DELETE /enrollments/:id`
Instructor removes a student from a course.
*Requires Bearer Token (Instructor)*
