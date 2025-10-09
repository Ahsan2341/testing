import { IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  aboutMe: string;

  @IsOptional()
  name: string;

  @IsOptional()
  email: string;

}
