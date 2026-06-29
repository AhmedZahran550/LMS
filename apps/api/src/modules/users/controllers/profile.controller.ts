import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { UsersService } from "../users.service";
import { UpdateProfileDto } from "../dto/update-profile.dto";
import { UpdatePreferencesDto } from "../dto/update-preferences.dto";
import { JwtAuthGuard } from "../../../core/auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../../core/decorators/current-user.decorator";
import { StorageService } from "../../storage/storage.service";
import { UsersSwagger } from "../../../swagger/users.swagger";

@ApiTags("Profile")
@Controller("profile")
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly usersService: UsersService,
    private readonly storageService: StorageService,
  ) {}

  @Get("me")
  @UsersSwagger.getProfile()
  async getProfile(@CurrentUser() user: any) {
    const dbUser = await this.usersService.findByIdOrFail(user.id);
    return dbUser;
  }

  @Patch("me")
  @UsersSwagger.updateProfile()
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    const dbUser = await this.usersService.updateProfile(
      user.id,
      dto.firstName,
      dto.lastName,
    );
    const { password, hashedRefreshToken, ...safeUser } = dbUser;
    return safeUser;
  }

  @Patch("me/preferences")
  @UsersSwagger.updatePreferences()
  async updatePreferences(@CurrentUser() user: any, @Body() dto: UpdatePreferencesDto) {
    const dbUser = await this.usersService.updatePreferences(user.id, dto);
    const { password, hashedRefreshToken, ...safeUser } = dbUser;
    return safeUser;
  }

  @Post("me/avatar")
  @UseInterceptors(FileInterceptor("file"))
  @UsersSwagger.uploadAvatar()
  async uploadAvatar(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException("Avatar file is required");
    }
    const uploadResult = await this.storageService.upload(
      file,
      "avatars/" + user.id,
    );
    const dbUser = await this.usersService.updateProfileImage(
      user.id,
      uploadResult.url,
    );
    const { password, hashedRefreshToken, ...safeUser } = dbUser;
    return safeUser;
  }
}
