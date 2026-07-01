import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { InstructorStudentsService } from '../services/instructor-students.service';
import { InstructorStudentsSwagger } from '../../../swagger/instructor-students.swagger';

@Controller('learner/invitations')
export class LearnerInvitationsController {
  constructor(private readonly service: InstructorStudentsService) {}

  @Get('accept')
  @UseGuards(JwtAuthGuard)
  @InstructorStudentsSwagger.acceptInvitation()
  async accept(@CurrentUser('id') userId: string, @Query('token') token: string) {
    const link = await this.service.acceptInvitation(token, userId);
    return { success: true, data: { id: link.id, status: link.status } };
  }

  @Get('info')
  async getInfo(@Query('token') token: string) {
    const info = await this.service.getInvitationInfo(token);
    return { success: true, data: info };
  }
}
