import { IsEnum, IsString } from 'class-validator';
export enum MediaType {
  LISTING = 'listing',
  USER = 'user',
}
export class CreateMediaDto {
  @IsEnum(MediaType)
  type: MediaType;

  @IsString()
  name: string
}
