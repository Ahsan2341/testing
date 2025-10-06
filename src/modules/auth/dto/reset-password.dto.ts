import { IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  otp: string;

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  readonly newPassword: string;
}
