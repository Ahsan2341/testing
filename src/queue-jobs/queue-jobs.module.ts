import { Module } from '@nestjs/common';
import { QueueJobsService } from './queue-jobs.service';
import { QueueJobsController } from './queue-jobs.controller';
import { QueuedJobRepository } from './queue-jobs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { QueuedJob, queuedJobSchema } from './entities/queue-job.entity';

@Module({
   imports: [
    MongooseModule.forFeature([
      { name: QueuedJob.name, schema: queuedJobSchema },
    ]),
  ],
  controllers: [QueueJobsController],
  providers: [QueueJobsService, QueuedJobRepository],
  exports:[QueueJobsService, QueuedJobRepository]
})
export class QueueJobsModule {}
