import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Paginate, PaginateQuery } from "nestjs-paginate";
import { UsersService } from "../users.service";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { JwtAuthGuard } from "../../../core/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../core/auth/guards/roles.guard";
import { Roles } from "../../../core/decorators/roles.decorator";
import { UserRole, PaginatedResponse } from "@lms/shared-types";
import { UsersSwagger } from "../../../swagger/users.swagger";

@ApiTags("Admin Users")
@Controller("admin/users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsersSwagger.createUser()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UsersSwagger.findAllUsers()
  async findAll(@Paginate() query: PaginateQuery) {
    const result = await this.usersService.findAll(query);

    result.data = result.data.map((u) => {
      const { password, hashedRefreshToken, ...safeUser } = u;
      return safeUser as any;
    });

    return result;
  }

  @Get(":id")
  @UsersSwagger.findOneUser()
  async findOne(@Param("id") id: string) {
    const user = await this.usersService.findByIdOrFail(id);
    return user;
  }

  @Patch(":id")
  @UsersSwagger.updateUser()
  async update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);
    const { password, hashedRefreshToken, ...safeUser } = user;
    return safeUser;
  }

  @Delete(":id")
  @UsersSwagger.removeUser()
  async remove(@Param("id") id: string) {
    await this.usersService.remove(id);
    return { id, deactivated: true };
  }
}
