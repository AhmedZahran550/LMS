import { IsEmail, IsNotEmpty } from 'class-validator';

export class InviteStudentDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
