import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { QueuedJob, QueuedJobDocument } from './entities/queue-job.entity';
import { GenericRepository } from 'src/common/repositories/generic.repository';

export class QueuedJobRepository extends GenericRepository<QueuedJobDocument> {
  constructor(
    @InjectModel(QueuedJob.name)
    readonly model: Model<QueuedJobDocument>,
  ) {
    super(model);
  }
}
