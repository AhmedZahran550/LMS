# Swagger Documentation Guide & Integration Architecture

This document explains the folder structure, decorator patterns, and integration mechanism of Swagger API documentation in the **Fixawy** application.

---

## 1. Architectural Philosophy: Decoupled API Documentation

To maintain a clean, maintainable, and readable codebase, **all API documentation is decoupled from the controller logic**. 

*   **No Swagger decorators** (e.g., `@ApiOperation`, `@ApiResponse`, `@ApiBody`, etc.) should be placed directly inside controller files, with the sole exception of `@ApiTags` at the controller class level.
*   Instead, all Swagger-related metadata is defined in a dedicated `swagger/` directory, grouped into reusable constants/functions using NestJS's `applyDecorators` utility.
*   This keeps controllers lean and focused entirely on handling HTTP routing, validation, and calling services.

---

## 2. Directory & File Structure

All swagger files reside in `src/swagger/`. Every resource has its own swagger definition file named in **kebab-case**, and all are exported through a central `index.ts` file.

```
src/
└── swagger/
    ├── index.ts                     # Central export registry
    ├── auth.swagger.ts              # Auth endpoints documentation
    ├── users.swagger.ts             # Users and profile endpoints documentation
    ├── logs.swagger.ts              # Logs endpoints documentation
    └── craftsman-search.swagger.ts  # Craftsman search endpoints documentation
```

### The Central Registry (`src/swagger/index.ts`)
All swagger files must export a single, consolidated object (e.g., `AuthSwagger`, `UsersSwagger`). These objects are exported from the folder through `index.ts`:

```typescript
export { AuthSwagger } from "./auth.swagger";
export { UsersSwagger } from "./users.swagger";
export { LogsSwagger } from "./logs.swagger";
export { CraftsmanSearchSwagger } from "./craftsman-search.swagger";
```

---

## 3. Swagger Decorator Pattern (`[resource].swagger.ts`)

Inside each swagger file, define an object with methods representing each endpoint. 
*   **Naming Convention:** Method names in the swagger object **must match** their corresponding controller handler names in `camelCase` (e.g., `sendOtp`, `getProfile`).
*   **Implementation:** Each method returns the result of NestJS's `applyDecorators(...)` containing the Swagger decorators.

### Example: `src/swagger/auth.swagger.ts`
```typescript
import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import { SendOtpDto } from "@/modules/auth/dto/send-otp.dto";
import { SendOtpResponseDto, AuthResponseDto } from "@/modules/auth/dto/auth-response.dto";

export const AuthSwagger = {
  sendOtp: () =>
    applyDecorators(
      ApiOperation({
        summary: "Send OTP to mobile number",
        description: "Generates a 6-digit OTP and sends it to the provided mobile number.",
      }),
      ApiBody({ type: SendOtpDto }),
      ApiResponse({
        status: 200,
        description: "OTP sent successfully",
        type: SendOtpResponseDto,
      }),
      ApiResponse({
        status: 400,
        description: "Rate limit exceeded or invalid mobile number",
      }),
    ),

  getProfile: () =>
    applyDecorators(
      ApiOperation({
        summary: "Get current user profile",
        description: "Returns the authenticated user profile",
      }),
      ApiBearerAuth(), // Marks endpoint as requiring a Bearer Token
      ApiResponse({
        status: 200,
        description: "User profile retrieved successfully",
      }),
      ApiResponse({
        status: 401,
        description: "Unauthorized - invalid or missing token",
      }),
    ),
};
```

---

## 4. Controller Integration

In the controller file:
1.  Import the swagger registry object.
2.  Add `@ApiTags("CategoryName")` to the controller class.
3.  Apply the swagger decorator directly to the route method.

### Example: `src/modules/auth/auth.controller.ts`
```typescript
import { Controller, Post, Get, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { SendOtpDto } from "./dto/send-otp.dto";
import { AuthSwagger } from "@/swagger/auth.swagger"; // Import Swagger documentation

@ApiTags("Auth") // Configures the group tag in Swagger UI
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("otp/send")
  @HttpCode(HttpStatus.OK)
  @AuthSwagger.sendOtp() // Apply the decoupled swagger decorators
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto);
  }

  @Get("profile")
  @AuthSwagger.getProfile() // Apply the decoupled swagger decorators
  async getProfile() {
    return this.authService.getProfile();
  }
}
```

---

## 5. Main Application Integration (`src/main.ts`)

The swagger modules are registered and bootstrapped globally in `src/main.ts`.

### Bootstrap & Configuration
```typescript
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from "@nestjs/swagger";
import { MetadataStorage, getFromContainer } from "class-validator";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // ...app setups

  // 1. Configure operational options
  const options: SwaggerDocumentOptions = {
    // Generates clean operation IDs based on method name rather than ClassName_methodName
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };

  // 2. Build configuration metadata
  const config = new DocumentBuilder()
    .setTitle("Fixawy API Specs")
    .setDescription("Fixawy API description")
    .setVersion("1.0")
    .addBearerAuth() // Globally configures JWT Bearer Auth in Swagger UI
    .build();

  const document = SwaggerModule.createDocument(app, config, options);

  // 3. Dynamically inject DTO Validation rules as OpenAPI schemas
  const metadata = (getFromContainer(MetadataStorage) as any).validationMetadatas;
  document.components.schemas = Object.assign(
    {},
    document.components.schemas || {},
    validationMetadatasToSchemas(metadata),
  );

  // 4. Setup Swagger UI Endpoint
  SwaggerModule.setup("api-docs", app, document, {
    jsonDocumentUrl: "api/docs-json",
    swaggerOptions: {
      docExpansion: "none", // Collapses all tags by default
    },
    // Loads assets from CDN to keep local bundle small and prevent loading blocks
    customCssUrl: "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css",
    customJs: [
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js",
    ],
  });

  await app.listen(PORT);
}
```

---

## 6. Developer Checklist & Rules

When adding or modifying API endpoints, follow these rules:

*   [ ] **Create/Update File:** Ensure a swagger file exists under `src/swagger/[resource-name].swagger.ts` with kebab-case.
*   [ ] **Register Export:** Confirm it is exported in `src/swagger/index.ts`.
*   [ ] **Matching Method Names:** The swagger object method names must match the controller handler names using `camelCase`.
*   [ ] **No Inline Controller Decorators:** Never add `@ApiOperation`, `@ApiResponse`, or other Swagger decorators directly to methods in the controller class. Only `@ApiTags` is permitted at the controller class level.
*   [ ] **DTO Integration:** Always specify DTO types in `ApiBody({ type: MyDto })` or `@ApiResponse({ type: MyDto })` so they are visualised in the Swagger schema section.
*   [ ] **Bearer Authentication:** Add `ApiBearerAuth()` to any swagger decorator for endpoints protected by JWT/Roles Guards.
