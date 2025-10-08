import { Module } from '@nestjs/common';
import { ListingService } from './listing.service';
import { ListingController } from './listing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Listing, ListingSchema } from './entities/listing.entity';
import { UserModule } from '../user/user.module';
import { ListingRepository } from './listing.repository';
import { JwtAuthService } from 'src/common/services/jwt-auth.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Listing.name, schema: ListingSchema }]),
    UserModule,
  ],
  controllers: [ListingController],
  providers: [ListingService, ListingRepository, JwtAuthService],
})
export class ListingModule {}
