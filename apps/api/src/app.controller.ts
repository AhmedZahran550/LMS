import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags("Health")
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: "Health check", description: "Returns API health status." })
  @ApiResponse({ status: 200, description: "API is healthy" })
  getHealthCheck() {
    return {
      status: 'ok',
      message: 'LMS API is running!',
      timestamp: new Date().toISOString(),
    };
  }
}
