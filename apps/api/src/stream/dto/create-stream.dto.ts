import { IsEnum, IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';
import { StreamStatus } from '@prisma/client';

export class CreateStreamDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    source_id: string;

    @IsObject()
    @IsOptional()
    prompt_template?: {
        triggerPrompt?: string;
        notificationPrompt?: string;
        [key: string]: any;
    };

    @IsObject()
    @IsOptional()
    notification_config?: {
        channel: string;
        config?: Record<string, any>;
        [key: string]: any;
    };

    @IsEnum(StreamStatus)
    @IsOptional()
    status?: StreamStatus;
}
