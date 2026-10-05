import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/auth/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { UserRole } from '@lms/shared-types';
import { UploadSwagger } from '../../swagger/upload.swagger';

@ApiTags('Uploads')
@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get('session/:sessionId/status')
  @UploadSwagger.getStatus()
  async getStatus(
    @CurrentUser() user: any,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ) {
    return this.uploadService.getUploadStatus(sessionId, user.id);
  }

  @Delete('session/:sessionId')
  @UploadSwagger.abortSession()
  async abortSession(
    @CurrentUser() user: any,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ) {
    return this.uploadService.abortSession(sessionId, user.id);
  }
}
