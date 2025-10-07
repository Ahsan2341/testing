import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtGuards } from 'src/common/guards/jwt-guards';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}
  @UseGuards(JwtGuards)
  @Get(':id')
  async getChatById(@Param('id') id) {
    return this.chatService.getChatById(id);
  }
  @UseGuards(JwtGuards)
  @Get('get-chat/:userId')
  async getChat(@Param('userId') userId, @Request() request) {
    return this.chatService.getOrCreateChat(request.user._id, userId);
  }
  @UseGuards(JwtGuards)
  @Get('get/all-chats')
  async getAllUserChats(@Request() request) {
    return this.chatService.getAllUserChats(request.user._id);
  }

  @UseGuards(JwtGuards)
  @Patch('read-chat-messages')
  async readChatMessages(@Body() body) {
    const { chatId } = body;
    return this.chatService.readChatMessages(chatId);
  }
}
