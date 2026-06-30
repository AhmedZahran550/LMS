import { IsEnum, IsNotEmpty } from 'class-validator';

export enum RequestAction {
  APPROVE = 'approve',
  DECLINE = 'decline',
}

export class RespondRequestDto {
  @IsEnum(RequestAction)
  @IsNotEmpty()
  action!: RequestAction;
}
