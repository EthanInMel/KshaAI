import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { StreamProcessorService } from './stream-processor.service';

@Processor('stream-processing')
export class StreamConsumer extends WorkerHost {
    private readonly logger = new Logger(StreamConsumer.name);

    constructor(private readonly streamProcessor: StreamProcessorService) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        this.logger.log(`Processing job ${job.id} of type ${job.name}`);

        const { streamId, contentId } = job.data;

        if (!streamId || !contentId) {
            this.logger.error('Invalid job data: missing streamId or contentId');
            return;
        }

        try {
            await this.streamProcessor.process(streamId, contentId);
            return { success: true };
        } catch (error) {
            this.logger.error(`Failed to process job ${job.id}: ${error.message}`);
            throw error;
        }
    }
}
