import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chat, ChatDocument } from './entities/chat.entity';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async getOrCreateChat(user1Id: Types.ObjectId, user2Id: Types.ObjectId) {
    let chat = await this.chatModel.findOne({
      participants: { $all: [user1Id, user2Id], $size: 2 },
    });
    if (!chat) {
      chat = await this.chatModel.create({ participants: [user1Id, user2Id] });
    }
    // fetch all messages of the chat
    const messages = await this.getMessages(chat._id);
    return { chat, messages };
  }
  async getChatById(id) {
    const chat = await this.chatModel.findById(id);
    if (!chat) {
      throw new BadRequestException('Chat with this id does not exist');
    }
    const messages = await this.getMessages(chat._id);
    return { chat, messages };
  }
  async getAllUserChats(userId) {
    const chats = await this.chatModel.aggregate([
      {
        $match: {
          participants: new Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'messages',
          localField: '_id',
          foreignField: 'chat',
          as: 'messages',
        },
      },
      {
        $addFields: {
          unreadMessagesCount: {
            $size: {
              $filter: {
                input: '$messages',
                as: 'message',
                cond: { $eq: ['$$message.read', false] },
              },
            },
          },
          user: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$participants',
                  as: 'participant',
                  cond: { $ne: ['$$participant', new Types.ObjectId(userId)] },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    return chats;
  }

  async saveMessage(
    chatId: string,
    sender: string,
    receiver: string,
    content: string,
    sentAt: string,
  ) {
    const message = await this.messageModel.create({
      chat: new Types.ObjectId(chatId),
      sender: new Types.ObjectId(sender),
      receiver: new Types.ObjectId(receiver),
      content,
      sentAt,
    });
    await this.chatModel.findByIdAndUpdate(chatId, {
      lastMessageAt: sentAt,
    });
    return message.populate(['sender', 'receiver']);
  }

  async getMessages(chatId: Types.ObjectId, populate?: string[]) {
    let query = this.messageModel.find({ chat: chatId }).sort({ createdAt: 1 });

    if (populate && populate.length > 0) {
      query = query.populate(populate);
    }

    return query.exec();
  }

  async readChatMessages(chatId: string) {
    await this.messageModel.updateMany(
      { chat: new Types.ObjectId(chatId) },
      { $set: { read: true } },
    );
    const messages = await this.messageModel.find({
      chat: new Types.ObjectId(chatId),
    });

    return { message: 'Success', messages };
  }
}
