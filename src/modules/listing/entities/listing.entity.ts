import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/modules/user/entities/user.entity';

export type ListingDocument = HydratedDocument<Listing>;
@Schema({ timestamps: true })
export class Listing {
  @Prop({ required: true })
  propertyTitle: string;

  @Prop({ required: true })
  propertyType: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  spaceType: string;

  @Prop({})
  titleInHand: boolean;

  @Prop({})
  bedrooms: number;

  @Prop({})
  bathrooms: number;

  @Prop({ required: true, default: 2200 })
  size: number;

  @Prop({})
  monthlyRent: number;

  @Prop({})
  salePrice: number;

  @Prop({ required: true })
  description: string;

  @Prop({})
  documentFile: string;

  @Prop({ required: true })
  photos: string[];

  @Prop({})
  video: string;

  @Prop({ required: true })
  amenities: string[];

  @Prop({ default: false })
  aiFlagged: boolean;

  @Prop({})
  isFurnished: boolean;

  @Prop({ required: true, type: Date })
  availableFrom: Date;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: User.name })
  user: MongooseSchema.Types.ObjectId;
}

export const ListingSchema = SchemaFactory.createForClass(Listing);
