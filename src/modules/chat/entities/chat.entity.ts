import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/modules/user/entities/user.entity';

export type ChatDocument = HydratedDocument<Chat>;

@Schema({ timestamps: true })
export class Chat {
  @Prop({ type: [{ type: Types.ObjectId, ref: User.name }], required: true })
  participants: Types.ObjectId[];

  @Prop({ default: Date.now })
  lastMessageAt: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
