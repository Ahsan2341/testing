import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/modules/user/user.module';
import { QueueJobsModule } from 'src/modules/queue-jobs/queue-jobs.module';
import { GoogleAuthService } from './google-auth.service';
import { JwtAuthService } from 'src/common/services/jwt-auth.service';
import { AppleAuthService } from './apple-auth.service';

@Module({
  imports:[UserModule, QueueJobsModule],
  controllers: [AuthController],
  providers: [AuthService, GoogleAuthService, JwtAuthService, AppleAuthService],
})
export class AuthModule {}
