import { Inject, Injectable } from '@nestjs/common';
import { QueueJobsService } from './queue-jobs.service';
import { EmailService } from 'src/common/services/email.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QUEUE_JOB_STATUS, QUEUE_JOB_TYPE } from './queue-jobs.constants';
@Injectable()
export class QueueCronService {
  @Inject(QueueJobsService)
  private queueJobService: QueueJobsService;
  @Inject(EmailService)
  private emailService: EmailService;

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleQueuedEmails() {
    console.log('Email Service running....');
    const jobs = await this.queueJobService.findAll({
      type: QUEUE_JOB_TYPE.EMAIL,
      status: 'PENDING',
      attempts: { $lt: 5 },
    });
    console.log(jobs);
    jobs.data.forEach(async (job) => {
      try {
        await this.emailService.sendMail(job.data.email, job.data.subject, job.data.template);
        await this.queueJobService.findByIdAndUpdate(job._id, {status:QUEUE_JOB_STATUS.SUCCESS})
      } catch (error) {
        console.log(error)
        await this.queueJobService.findByIdAndUpdate(job._id, {status:QUEUE_JOB_STATUS.FAILED})
      }
    });
  }
}
