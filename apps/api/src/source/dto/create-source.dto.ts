import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SourceType } from '@prisma/client';

export class CreateSourceDto {
    @IsEnum(SourceType)
    @IsNotEmpty()
    type: SourceType;

    @IsString()
    @IsNotEmpty()
    identifier: string; // e.g., X username "elonmusk", RSS URL

    @IsOptional()
    config?: Record<string, any>; // Extra configuration for the source
}
