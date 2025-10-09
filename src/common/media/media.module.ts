import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { JwtAuthService } from '../services/jwt-auth.service';
import { UserModule } from 'src/modules/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [MediaController],
  providers: [MediaService, JwtAuthService],
})
export class MediaModule {}
