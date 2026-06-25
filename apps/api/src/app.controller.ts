import { Controller, Get } from '@nestjs/common';

@Controller()
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
