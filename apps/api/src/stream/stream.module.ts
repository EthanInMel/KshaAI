import { Module } from '@nestjs/common';
import { StreamService } from './stream.service';
import { StreamController } from './stream.controller';
import { StreamProcessorService } from './stream-processor.service';
import { StreamConsumer } from './stream.consumer';
import { DigestService } from './digest.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LlmModule } from '../llm/llm.module';
import { NotificationModule } from '../notification/notification.module';
import { QueueModule } from '../queue/queue.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, LlmModule, NotificationModule, QueueModule, AuthModule],
  controllers: [StreamController],
  providers: [StreamService, StreamProcessorService, StreamConsumer, DigestService],
  exports: [StreamService, StreamProcessorService],
})
export class StreamModule { }

