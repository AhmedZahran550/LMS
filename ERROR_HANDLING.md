# Error Handling & Response Structure

This document outlines how errors are caught, formatted, translated, and structured across the application.

---

## 1. General Error Response Structure (Base Shape)

All HTTP error responses are normalized to a consistent structure defined by the `AppErrorResponse` interface (see [error-response.ts](file:///e:/Arcon/medyour-be/src/common/models/error-response.ts)). 

Every error payload returned from the backend conforms to the following schema:

```typescript
export interface AppErrorResponse {
  statusCode: number;      // HTTP Status Code (e.g., 400, 401, 409, 500)
  errorCode: string;       // Custom error code string (e.g., 'BAD_REQUEST', 'UNIQUE_VOILATION', 'TOKEN_EXPIRED')
  message: string;         // Localized, user-friendly error message
  path: string;            // The request URL route path where the error occurred
  errors?: FieldError[];   // (Optional) Detailed list of field-level errors (validation/DB)
  requestId?: string;      // Trace identifier (from response.locals.requestId)
  timestamp?: string;      // ISO string representation of the error time
}

export interface FieldError {
  property: string;        // The DTO field or database column name that failed
  code: string;            // The specific rule violated (e.g., 'isNotEmpty', 'UNIQUE_VOILATION')
  message?: string;        // Localized error message for this specific field
  value?: string;          // The invalid input value (when applicable)
  constraints?: {          // Raw validation constraints
    [type: string]: string;
  };
}
```

---

## 2. Validation Errors & How They Are Handled

Validation is managed dynamically using NestJS pipes, filters, and `class-validator`:

1. **Global Validation Pipe (`I18nValidationPipe`)**:
   Configured in [app-setup.ts](file:///e:/Arcon/medyour-be/src/app-setup.ts#L29-L39), this pipe sanitizes incoming requests:
   * Strips non-whitelisted properties (`whitelist: true`, `forbidNonWhitelisted: true`).
   * Automatically transforms payloads to their corresponding DTO classes with implicit conversions enabled.

2. **Validation Exception Filter (`I18nValidationExceptionFilter`)**:
   Catches class-validation failures globally. 
   * **`errorFormatter`**: Recursively traverses the validation tree using `findFirstConstraint(node)` to find the first constraint that failed (e.g., `isEmail`, `isNotEmpty`).
   * **Localization**: If the active language is Arabic (`'ar'`), all validation error messages are translated via the `I18nService` using the pattern `validation.${constraintKey}`.
   * **`responseBodyFormatter`**: Packages the formatted constraint violations into the `errors` array of `AppErrorResponse`.

### Validation Error Example
```json
{
  "statusCode": 400,
  "errorCode": "BAD_REQUEST",
  "path": "/api/v1/auth/register",
  "message": "Validation failed",
  "errors": [
    {
      "property": "email",
      "value": "invalid-email-address",
      "constraints": {
        "isEmail": "Must be a valid email address format"
      },
      "message": "Must be a valid email address format",
      "code": "isEmail"
    }
  ],
  "requestId": "req-98765-abc",
  "timestamp": "2026-06-26T17:15:30.000Z"
}
```

---

## 3. Database Errors (TypeORM / PostgreSQL)

Database errors are intercepted in two layers:
1. **`DBExceptionFilter`** ([db-exception.filter.ts](file:///e:/Arcon/medyour-be/src/common/filters/db-exception.filter.ts)) catches exceptions implementing `TypeORMError` (e.g., `QueryFailedError`, `EntityNotFoundError`).
2. **`GeneralExceptionFilter`** ([general-exception.filter.ts](file:///e:/Arcon/medyour-be/src/common/filters/general-exception.filter.ts)) uses `getError(exception)` from [db.errors.ts](file:///e:/Arcon/medyour-be/src/database/db.errors.ts) to map PostgreSQL error codes to application-specific status codes and error keys:
   * **Unique Violations (`23505`)**: Matches duplicate entries and automatically parses the field name from the Postgres detail string (e.g., extracting `"email"` from `Key (email)=(...) already exists`), throwing a `409 Conflict`.
   * **Foreign Key Violations (`23503`)**: Extends validation properties to target the invalid relationship reference, throwing a `409 Conflict`.
   * **Not Null Constraints (`23502`)**: Maps missing required columns, throwing a `400 Bad Request`.
   * **Invalid Text Representation (`22P02`)**: Catches invalid formats (e.g., malformed UUIDs), throwing a `400 Bad Request`.

### Database Error Example (Duplicate Unique Value)
```json
{
  "statusCode": 409,
  "errorCode": "UNIQUE_VOILATION",
  "path": "/api/v1/users",
  "message": "This record already exists.",
  "errors": [
    {
      "property": "email",
      "code": "UNIQUE_VOILATION",
      "message": "The email provided is already registered."
    }
  ],
  "requestId": "req-12345-xyz",
  "timestamp": "2026-06-26T17:18:22.000Z"
}
```

---

## 4. Authentication & Authorization Errors

Authentication errors are typically triggered by guards such as `JwtAuthGuard` ([jwt-auth.guard.ts](file:///e:/Arcon/medyour-be/src/modules/auth/jwt-auth.guard.ts)):

1. If no Bearer Token is supplied in the headers, or if validation fails, the guard throws an `UnauthorizedException`.
2. Specific error codes (e.g., `INVALID_TOKEN`, `TOKEN_EXPIRED`) are passed as payload properties.
3. The `GeneralExceptionFilter` catches the `UnauthorizedException` and translates the error code (via translation keys like `errors.TOKEN_EXPIRED`).

### Authentication Error Example (Expired Token)
```json
{
  "statusCode": 401,
  "errorCode": "TOKEN_EXPIRED",
  "path": "/api/v1/users/profile",
  "message": "The session has expired. Please log in again.",
  "requestId": "req-11111-auth",
  "timestamp": "2026-06-26T17:20:01.000Z"
}
```

---

## 5. Server/Internal Errors

If an error is thrown that is not a standard NestJS HTTP Exception or an anticipated DB/Validation exception, it is caught as a fall-through case in `GeneralExceptionFilter`:

* The full error stack trace is logged to the server logs for debugging.
* The API returns a sanitized, localized error body to avoid leaking application internals.

### Internal Server Error Example
```json
{
  "statusCode": 500,
  "errorCode": "INTERNAL_SERVER_ERROR",
  "path": "/api/v1/critical-process",
  "message": "An unexpected error occurred. Please try again later.",
  "requestId": "req-50000-err",
  "timestamp": "2026-06-26T17:21:40.000Z"
}
```
