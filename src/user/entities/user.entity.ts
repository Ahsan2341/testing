import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import * as bcrypt from 'bcrypt';
export type UserDocument = HydratedDocument<User>;
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({})
  password: string;

  @Prop({ required: true })
  name: string;

  // Add the role field with enum
  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Prop({})
  aboutMe: string;

  @Prop({})
  profilePicture: string;

  @Prop({})
  phoneNumber: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: '' })
  googleSignInId: string;

  @Prop({ default: false })
  googleSignInEnabled: boolean;

  @Prop({ default: '' })
  appleSignInId: string;

  @Prop({ default: false })
  appleSignInEnabled: boolean;

  @Prop()
  passwordResetToken: number;

  @Prop()
  passwordResetTokenExpiresAt: Date;

  @Prop()
  stripeCustomerId: string;

  @Prop({ type: String, default: null })
  stripeConnectedAccountId: string;

  @Prop({ type: [String], default: [] })
  fcmTokens: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as Record<string, any> | null;

  if (update?.password) {
    const hashed = await bcrypt.hash(update.password, 10);
    this.setUpdate({ ...update, password: hashed });
  }

  next();
});
