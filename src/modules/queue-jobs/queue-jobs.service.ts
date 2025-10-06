import { Injectable } from '@nestjs/common';
import { QueuedJobRepository } from './queue-jobs.repository';
import { GenericService } from 'src/common/services/generic.service';

@Injectable()
export class QueueJobsService extends GenericService {
  constructor(private readonly queuedJobsRepository: QueuedJobRepository) {
    super(queuedJobsRepository);
  }
}
