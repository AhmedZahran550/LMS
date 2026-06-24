import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class AppController {
  @Get()
  getHealthCheck() {
    return {
      status: 'ok',
      message: 'LMS API is running!',
      timestamp: new Date().toISOString(),
    };
  }
}
