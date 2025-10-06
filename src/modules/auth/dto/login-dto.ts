import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  email: string;

  @IsString()
  password: string;
}

export class GoogleSignInDto {
  @IsNotEmpty()
  readonly code: string;
}

export class AppleSignInDto {
  @IsString()
  code: string;
}