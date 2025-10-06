import { Controller } from '@nestjs/common';
import { QueueJobsService } from './queue-jobs.service';

@Controller('queue-jobs')
export class QueueJobsController {
  constructor(private readonly queueJobsService: QueueJobsService) {}
}
