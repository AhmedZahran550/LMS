import { IsEmail, IsNotEmpty } from 'class-validator';

export class InviteLearnerDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
