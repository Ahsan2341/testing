import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as mongooseSchema } from 'mongoose';
import { QUEUE_JOB_TYPE } from '../queue-jobs.constants';

export type QueuedJobDocument = QueuedJob & Document;

@Schema()
export class QueuedJob {
  @Prop()
  type: QUEUE_JOB_TYPE;

  @Prop()
  data: mongooseSchema.Types.Mixed;

  @Prop()
  status: string;

  @Prop({ default: 3 })
  maxRetries: number;

  @Prop({ default: 0 })
  attempts: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const queuedJobSchema = SchemaFactory.createForClass(QueuedJob);
