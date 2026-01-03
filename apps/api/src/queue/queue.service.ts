import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
    constructor(
        @InjectQueue('stream-processing') private streamQueue: Queue,
    ) { }

    async addToStreamQueue(data: any) {
        return this.streamQueue.add('process-content', data, {
            removeOnComplete: true,
            attempts: 3,
        });
    }
}
