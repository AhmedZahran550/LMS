import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { join } from 'path';
import { DataSource } from 'typeorm';

// Mock DataSource.prototype.initialize to prevent database connection errors during CI/swagger generation
DataSource.prototype.initialize = async function () {
  (this as any).isInitialized = true;
  this.driver.database = 'mock-db';
  return this;
};

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const config = new DocumentBuilder()
      .setTitle('LMS API')
      .setDescription('The LMS API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    const outputPath = join(process.cwd(), 'swagger.json');
    fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
    
    console.log(`Swagger JSON successfully generated at ${outputPath}`);
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('Failed to generate Swagger document:', error);
    process.exit(1);
  }
}
bootstrap();
