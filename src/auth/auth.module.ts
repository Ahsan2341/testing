import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { QueueJobsModule } from 'src/queue-jobs/queue-jobs.module';
import { GoogleAuthService } from './google-auth.service';

@Module({
  imports:[UserModule, QueueJobsModule],
  controllers: [AuthController],
  providers: [AuthService, GoogleAuthService],
})
export class AuthModule {}
