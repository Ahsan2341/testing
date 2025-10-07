import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Chat } from './chat.entity';
import { User } from 'src/modules/user/entities/user.entity';

export type MessageDocument = HydratedDocument<Message>;
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
}
@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: Chat.name, required: true })
  chat: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  sender: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  receiver: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  read: boolean;

  @Prop({ type: String, enum: MessageType, default: MessageType.TEXT })
  messageType: MessageType;

  @Prop({})
  sentAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
