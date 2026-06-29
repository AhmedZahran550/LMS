# Implementation Plan: Branding - App Name "manara / منارة"

**Branch**: `001-branding-manara` | **Date**: 2026-06-29 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-branding-manara/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command.

## Summary

Replace all existing placeholder app names (e.g., "LMS") across the application with the locale-specific brand name — "manara" for English, "منارة" for Arabic — in browser titles, navigation headers, system emails, error pages, meta tags, PWA manifest, loading screens, notifications, and API responses. The name is sourced from translation files to respect the existing i18n architecture.

## Technical Context

**Language/Version**: TypeScript 5.x (NestJS, Next.js)

**Primary Dependencies**: nestjs-i18n (backend), react-i18next / next-i18next (frontend)

**Storage**: N/A — app name lives in translation JSON files and config

**Testing**: Jest / Vitest (existing project setup)

**Target Platform**: Web (browser + Node.js server)

**Project Type**: Multi-app monorepo (NestJS API + Next.js Web + Next.js Admin)

**Performance Goals**: N/A — branding changes are compile-time/config, zero runtime impact

**Constraints**: Must follow existing i18n patterns; no new dependencies; single source of truth per locale

**Scale/Scope**: 3 applications — `apps/api`, `apps/web`, `apps/admin` — covering ~15–20 routes/pages plus email templates and PWA

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Status |
|-----------|-----------|--------|
| **I. Security-First Development** | No security impact — branding changes are cosmetic, no new endpoints or data handling | ✅ Pass |
| **II. Decoupled API Documentation** | No Swagger/OpenAPI changes required | ✅ Pass |
| **III. Layered Monorepo Structure** | Changes touch all three app layers (API, Web, Admin) — consistent with existing structure | ✅ Pass |
| **IV. DTO-Driven Schema Generation** | No DTO or schema changes required | ✅ Pass |
| **V. Consistency & Developer Ergonomics** | Must follow existing camelCase naming and centralized API client patterns | ✅ Pass |
| **VI. Localization & Internationalization** | **Key principle**: Brand name must be defined in both `ar` and `en` translation files using dot-notation keys (e.g., `app.name`). Backend uses `nestjs-i18n` with `I18nJsonLoader`, frontend uses `react-i18next`. Fallback language is `ar`. Language resolution: JWT → Accept-Language → `ar` fallback | ✅ Pass |
| **VII. Error Handling & Observability** | Error pages need locale-appropriate branding — consistent with existing `GlobalExceptionFilter` structure | ✅ Pass |

**GATE verdict**: ✅ All gates pass. No constitution violations. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-branding-manara/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
├── checklists/          # Spec quality checklists
└── spec.md              # Feature specification
```

### Source Code (repository root)

```text
apps/
├── api/src/
│   ├── i18n/
│   │   ├── ar/translation.json
│   │   └── en/translation.json
│   ├── core/
│   └── modules/
├── web/src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (instructor)/
│   │   └── (learner)/
│   ├── i18n/en.json
│   ├── i18n/ar.json
│   └── lib/api.ts
└── admin/src/
    └── app/

packages/
└── shared-types/

public/locales/
├── en/translation.json
└── ar/translation.json
```

**Structure Decision**: Use existing monorepo layout. Brand name lives in translation files per location (`apps/api/src/i18n/`, `apps/web/src/i18n/`, `public/locales/`) and is referenced via the existing i18n framework rather than introducing a new configuration mechanism.

## Complexity Tracking

No constitution violations to justify — all gates passed.
