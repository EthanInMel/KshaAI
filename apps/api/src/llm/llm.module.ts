import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { LlmController } from './llm.controller';
import { OpenAIProvider } from './providers/openai.provider';
import { AiSdkService } from './ai-sdk.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    controllers: [LlmController],
    providers: [LlmService, OpenAIProvider, AiSdkService],
    exports: [LlmService, AiSdkService],
})
export class LlmModule { }
