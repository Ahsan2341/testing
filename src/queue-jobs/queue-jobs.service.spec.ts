import { Test, TestingModule } from '@nestjs/testing';
import { QueueJobsService } from './queue-jobs.service';

describe('QueueJobsService', () => {
  let service: QueueJobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueueJobsService],
    }).compile();

    service = module.get<QueueJobsService>(QueueJobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
