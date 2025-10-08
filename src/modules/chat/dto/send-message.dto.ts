import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  chatId: string;

  @IsString()
  receiverId: string;
  
  @IsString()
  senderId: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}
