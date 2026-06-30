import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe, BadRequestException } from "@nestjs/common";
import { ValidationError } from "class-validator";
import { MetadataStorage, getFromContainer } from "class-validator";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import { ConfigService } from "@nestjs/config";
import { join } from "path";
import { AppModule } from "./app.module";
import { LoggingInterceptor } from "./core/interceptors/logging.interceptor";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  app.useStaticAssets(join(process.cwd(), "uploads"), {
    prefix: "/uploads",
  });

  app.setGlobalPrefix("api");

  // Setup Swagger API Documentation
  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };

  const config = new DocumentBuilder()
    .setTitle("manara API")
    .setDescription("The manara API description")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config, options);

  const metadata = (getFromContainer(MetadataStorage) as any).validationMetadatas;
  if (metadata) {
    document.components = document.components || {};
    document.components.schemas = {
      ...(document.components.schemas || {}),
      ...(validationMetadatasToSchemas(metadata) as Record<string, any>),
    };
  }

  SwaggerModule.setup("api/docs", app, document, {
    jsonDocumentUrl: "api/docs-json",
    swaggerOptions: {
      docExpansion: "none",
    },
    customCssUrl: "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css",
    customJs: [
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js",
    ],
  });

  app.useBodyParser('json', {
    verify: (req: any, res: any, buf: Buffer) => {
      req.rawBody = buf.toString();
    },
  });

  const allowedOrigins = configService.get<string[]>("app.allowedOrigins");

  app.enableCors({
    origin: allowedOrigins,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errors = validationErrors.map((error) => ({
          property: error.property,
          value: error.value,
          code: Object.keys(error.constraints ?? {})[0] ?? "unknown",
          constraints: error.constraints ?? {},
        }));
        return new BadRequestException({
          message: "Validation failed",
          errors,
          errorCode: "BAD_REQUEST",
        });
      },
    }),
  );

  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = configService.get<number>("app.port", 5000);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
