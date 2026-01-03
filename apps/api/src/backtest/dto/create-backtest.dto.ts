import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateBacktestDto {
    @IsString()
    streamId: string;

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsDateString()
    startTime: string;

    @IsDateString()
    endTime: string;

    @IsOptional()
    config?: any;
}
