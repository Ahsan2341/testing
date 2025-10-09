import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/modules/user/entities/user.entity';

export type ListingDocument = HydratedDocument<Listing>;
export enum PricingType {
  FOR_RENT = 'for rent',
  FOR_SALE = 'for sale',
}

@Schema({ timestamps: true })
export class Listing {
  @Prop({ required: true })
  propertyTitle: string;

  @Prop({ required: true })
  propertyType: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  })
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude] From google maps the convention is [lat, long] but in geoJson the correct way is [long, lat]
  };

  @Prop({})
  spaceType: string;

  @Prop({})
  ownershipType: string;

  @Prop({})
  titleInHand: boolean; // for propertyType land

  @Prop({})
  bedrooms: number;

  @Prop({})
  bathrooms: number;

  @Prop({ required: true, default: 2200 })
  size: number;

  @Prop({
    type: String,
    enum: PricingType,
    default: PricingType.FOR_RENT,
  })
  pricing: PricingType;

  @Prop({})
  monthlyRent: number;

  @Prop({})
  salePrice: number;

  @Prop({ default: 500 })
  findersFee: number;

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

  @Prop({ default: false })
  isFurnished: boolean;

  @Prop({ default: false })
  isPromoted: boolean;

  @Prop({})
  promotedTill: Date;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ required: true, type: Date })
  availableFrom: Date;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: User.name })
  user: MongooseSchema.Types.ObjectId;
}

export const ListingSchema = SchemaFactory.createForClass(Listing);
// Add 2dsphere index for geospatial queries
ListingSchema.index({ location: '2dsphere' });
