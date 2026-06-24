import { Controller, Get, Patch, Post, Body, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from '../users.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { StorageService } from '../../storage/storage.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly usersService: UsersService,
    private readonly storageService: StorageService,
  ) {}

  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    const dbUser = await this.usersService.findById(user.id);
    const { password, hashedRefreshToken, ...safeUser } = dbUser;
    return safeUser;
  }

  @Patch('me')
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    const dbUser = await this.usersService.updateProfile(user.id, dto.firstName, dto.lastName);
    const { password, hashedRefreshToken, ...safeUser } = dbUser;
    return safeUser;
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Avatar file is required');
    }
    const uploadResult = await this.storageService.upload(file, `avatars/${user.id}`);
    const dbUser = await this.usersService.updateProfileImage(user.id, uploadResult.url);
    const { password, hashedRefreshToken, ...safeUser } = dbUser;
    return safeUser;
  }
}
