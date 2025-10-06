import { Module } from '@nestjs/common';
import { QueueJobsService } from './queue-jobs.service';
import { QueueJobsController } from './queue-jobs.controller';
import { QueuedJobRepository } from './queue-jobs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { QueuedJob, queuedJobSchema } from './entities/queue-job.entity';
import { EmailService } from 'src/common/services/email.service';
import { QueueCronService } from './queue-job.cron.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QueuedJob.name, schema: queuedJobSchema },
    ]),
  ],
  controllers: [QueueJobsController],
  providers: [
    QueueJobsService,
    QueuedJobRepository,
    EmailService,
    QueueCronService,
  ],
  exports: [QueueJobsService, QueuedJobRepository],
})
export class QueueJobsModule {}
