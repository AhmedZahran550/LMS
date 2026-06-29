<!--
  SYNC IMPACT REPORT
  Version: 1.1.0 → 1.2.0 (MINOR bump)
  Modified principles:
    - "Security & Authentication" → "Security-First Development" (moved to Principle I, expanded with rate limiting, helmet, sanitization, file validation, env validation, CSRF)
    - All subsequent principles renumbered (II ↔ previously I, III ↔ previously II, etc.)
  Added sections: none
  Removed sections: none
  Templates requiring updates: plan-template.md ✅ (no constitution gates changed),
    spec-template.md ✅, tasks-template.md ✅, checklist-template.md ✅
  Follow-up TODOs: none
-->

# LMS Constitution

## Core Principles

### I. Security-First Development
Security MUST be the foremost consideration in every feature, evaluated before
implementation begins. The following rules are non-negotiable:

- **Rate limiting**: All auth/public endpoints MUST be rate-limited to prevent
  brute-force and abuse. Install and configure `@nestjs/throttler` or equivalent.
- **Security headers**: `helmet` MUST be configured for standard security headers
  (CSP, X-Frame-Options, HSTS, X-Content-Type-Options, etc.).
- **Input sanitization**: All user-text fields (names, titles, descriptions) MUST
  be sanitized against XSS. Store sanitized text; never render unsanitized input.
- **File upload validation**: Every file upload endpoint MUST validate file type
  (server-side MIME detection), file size, and reject malicious content before
  storage. Multer `limits` and `fileFilter` MUST be configured.
- **Environment variable validation**: A validation schema (Joi/Zod) MUST be
  provided in `ConfigModule.forRoot()`. No hardcoded fallback secrets allowed
  in production code.
- **CSRF protection**: State-changing endpoints (POST, PATCH, DELETE) MUST have
  CSRF protection when cookies are used for authentication.
- **Sensitive data**: Passwords, tokens, and secrets MUST be hashed (argon2),
  redacted in logs via `redact.util.ts`, and excluded from serialization via
  `@Exclude()`.
- **Security review gate**: No feature SHALL be released without a security review
  of its attack surface. All pull requests MUST verify compliance with these rules.

### II. Decoupled API Documentation
All OpenAPI/Swagger metadata MUST be defined in dedicated `[resource].swagger.ts`
files under `apps/api/src/swagger/`. Controllers MAY only contain `@ApiTags()` at
the class level. No `@ApiOperation`, `@ApiResponse`, `@ApiBody`, or other Swagger
decorators SHALL be placed directly inside controller files. This keeps controllers
lean and focused on HTTP routing and validation.

### III. Layered Monorepo Structure
The project is a pnpm monorepo with three application layers and a shared package:

- **API** (`apps/api/`): NestJS application with `modules/` (feature modules),
`core/` (shared infrastructure, auth, guards, filters, interceptors),
`swagger/` (decoupled documentation), `db/` (entities, migrations, datasource),
`i18n/` (translation files), `config/`, and `api/` (route modules by role).
- **Web** (`apps/web/`): Next.js App Router application with `app/` (route groups:
`(auth)`, `(instructor)`, `(learner)`), `components/` (UI and feature components),
`lib/` (Axios API client, utility functions), `store/` (Zustand stores),
`hooks/` (custom React hooks), `i18n/` (frontend translations).
- **Admin** (`apps/admin/`): Next.js application for administrative dashboard.
- **Shared** (`packages/shared-types/`): All shared TypeScript interfaces, enums,
and API response types consumed by all apps.
- **Tooling** (`tooling/`): Shared ESLint configuration and TypeScript configs.

Each feature module in the API groups its controllers, services, DTOs, and tests
together under `apps/api/src/modules/[module-name]/`.

### IV. DTO-Driven Schema Generation
All request/response DTOs MUST use `class-validator` decorators for validation
rules. Swagger decorators MUST reference DTO types in `@ApiBody({ type: MyDto })`
and `@ApiResponse({ type: MyDto })` so that OpenAPI schemas are auto-generated
from class metadata. The `class-validator-jsonschema` integration in `main.ts`
enriches schemas with validation rules.

### V. Consistency & Developer Ergonomics
Swagger object method names MUST match their corresponding controller handler names
in `camelCase`. Each swagger file MUST be registered in `src/swagger/index.ts`.
Use `applyDecorators()` from `@nestjs/common` to compose multiple Swagger decorators
into a single exported function. CDN-hosted Swagger UI assets are used to keep the
bundle small. On the frontend, API calls go through the centralized Axios client
in `src/lib/api.ts` with request/response interceptors for auth token injection
and 401 auto-refresh handling.

### VI. Localization & Internationalization
All user-facing text MUST be available in both Arabic (`ar`) and English (`en`).

- **Backend**: Translation files live in `apps/api/src/i18n/{ar,en}/translation.json`
using `nestjs-i18n` with `I18nJsonLoader`. The fallback language is `ar`.
- **Frontend**: Translation files live in `apps/web/src/i18n/{en,ar}.json` and
`public/locales/{en,ar}/translation.json` using `react-i18next`.
- **Language resolution priority**: user preference (`req.user.lang` embedded in
JWT) → `Accept-Language` HTTP header → fallback `ar`.
- **Translation key convention**: dot-notation scoped by domain
(e.g., `errors.INVALID_CREDENTIALS`, `validation.isEmail`, `auth.*`).
- The `I18nModule` in `apps/api/src/i18n/i18n.module.ts` is registered as global
so `I18nService` is available app-wide without re-importing.

### VII. Error Handling & Observability
Error handling follows a centralized, layered architecture:

- Every request gets a UUID `requestId` via `LoggerMiddleware` attached to the
response header (`X-Request-Id`) and logged to the database via `LogsService`.
- **`GlobalExceptionFilter`** catches ALL exceptions, maps them to structured JSON
responses with i18n-translated messages, and attaches the error to `req.error` for
logging.
- **`DBExceptionFilter`** catches TypeORM `QueryFailedError` and `EntityNotFoundError`,
maps PostgreSQL error codes to standard HTTP exceptions, and delegates to
`GlobalExceptionFilter`.
- **`TransformResponseInterceptor`** wraps successful responses in
`{ success: true, data }` using the `ApiResponse<T>` shared type.
- On the frontend, the Axios response interceptor in `src/lib/api.ts` catches 401
errors, performs silent token refresh, and logs the user out on failure.
Errors are surfaced to users via the `Snackbar` component.

## Development Standards

- **Naming Conventions**: Files in `swagger/` use kebab-case (`auth.swagger.ts`).
Controller handler names and swagger method names both use `camelCase`.
- **DTO Placement**: DTOs live in `[module]/dto/` with descriptive names
(`create-course.dto.ts`, `update-profile.dto.ts`).
- **Response Types**: Use shared interfaces from `@lms/shared-types` for consistent
API response shapes (`ApiResponse<T>`, `PaginatedResponse<T>`).
- **Frontend API Layer**: All API calls go through `roleApi` helper in
`src/lib/api.ts` which prefixes routes based on user role.
- **State Management**: Server state is managed via TanStack React Query; client
state (auth) via Zustand stores persisted to localStorage.
- **Translation Files**: Backend translation keys use the `"translation.*"` prefix
matching JSON structure. Frontend keys follow `react-i18next` conventions.
- **Database Migrations**: When changing DB structure or entities, BOTH scripts
MUST be run in order: first `pnpm run migration:generate --name=AddFeatureX` (or
`migration:create`) then `pnpm run migration:run`. TypeORM auto-generates the
timestamp prefix (`{timestamp}-{PascalName}.ts`). Never commit entity changes
without the corresponding migration file.
- **Commit Messages**: MUST follow conventional commits format
(`type(scope): description`), e.g., `feat(auth): add rate limiting`.
- **Test Coverage**: Security-critical paths (auth, authorization, input validation)
MUST have unit and integration tests. Tests MUST fail before implementation.

## Governance

This constitution supersedes all other ad-hoc practices. Amendments MUST be
documented and approved by the team. All pull requests and code reviews MUST
verify compliance with the security-first principle, the decoupled documentation
principle, the localization requirements, and the error handling architecture.

**Versioning policy**:
- MAJOR: Backward incompatible governance or principle removals/redefinitions.
- MINOR: New principle or section added, materially expanded guidance.
- PATCH: Clarifications, wording refinements, typo fixes.

The `AGENTS.md` file in the project root provides runtime development guidance
and SHOULD be consulted by AI agents before making changes.

**Version**: 1.2.0 | **Ratified**: 2026-06-29 | **Last Amended**: 2026-06-29
