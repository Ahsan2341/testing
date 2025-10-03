import { Test, TestingModule } from '@nestjs/testing';
import { QueueJobsController } from './queue-jobs.controller';
import { QueueJobsService } from './queue-jobs.service';

describe('QueueJobsController', () => {
  let controller: QueueJobsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueueJobsController],
      providers: [QueueJobsService],
    }).compile();

    controller = module.get<QueueJobsController>(QueueJobsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
