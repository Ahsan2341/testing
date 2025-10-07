import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './entities/chat.entity';
import { Message, MessageSchema } from './entities/message.entity';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { UserModule } from '../user/user.module';
import { ChatController } from './chat.controller';
import { JwtAuthService } from 'src/common/services/jwt-auth.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    UserModule,
  ],
  providers: [ChatService, ChatGateway, JwtAuthService],
  controllers:[ChatController],
  exports: [ChatService],
})
export class ChatModule {}
