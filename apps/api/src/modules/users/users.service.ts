import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as argon2 from "argon2";
import { PaginateConfig, FilterOperator } from "nestjs-paginate";
import { DBService } from '../../db/db.service';
import { User } from '../../db/entities/user.entity';
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UpdatePreferencesDto } from "./dto/update-preferences.dto";

export const USER_PAGINATION_CONFIG: PaginateConfig<User> = {
  sortableColumns: ["createdAt", "firstName", "lastName", "email"],
  nullSort: "last",
  defaultSortBy: [["createdAt", "DESC"]],
  searchableColumns: ["firstName", "lastName", "email"],
  filterableColumns: {
    role: [FilterOperator.EQ],
    isActive: [FilterOperator.EQ],
  },
};

@Injectable()
export class UsersService extends DBService<
  User,
  CreateUserDto,
  UpdateUserDto
> {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {
    super(usersRepository, USER_PAGINATION_CONFIG);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { resetPasswordToken: token },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await argon2.hash(updateUserDto.password);
    }
    return super.update(id, updateUserDto);
  }

  async updateRefreshToken(
    id: string,
    hashedRefreshToken: string | null,
  ): Promise<void> {
    await this.usersRepository.update(id, { hashedRefreshToken });
  }

  async updateProfile(
    id: string,
    firstName: string,
    lastName: string,
  ): Promise<User> {
    const user = await this.findByIdOrFail(id);
    user.firstName = firstName;
    user.lastName = lastName;
    return this.usersRepository.save(user);
  }

  async updatePreferences(id: string, dto: UpdatePreferencesDto): Promise<User> {
    const user = await this.findByIdOrFail(id);
    user.preferences = {
      lang: dto.lang ?? user.preferences?.lang ?? 'ar',
      mode: dto.mode ?? user.preferences?.mode ?? 'light',
    };
    return this.usersRepository.save(user);
  }

  async updateProfileImage(id: string, profileImageUrl: string): Promise<User> {
    const user = await this.findByIdOrFail(id);
    user.profileImageUrl = profileImageUrl;
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.softDelete(id);
  }
}
