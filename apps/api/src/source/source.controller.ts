import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { SourceService } from './source.service';
import { AuthService } from '../auth/auth.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';
import { SourceType } from '@prisma/client';

@Controller('source')
export class SourceController {
  constructor(
    private readonly sourceService: SourceService,
    private readonly authService: AuthService
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Headers('authorization') authHeader: string, @Body() createSourceDto: CreateSourceDto) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    const decoded = this.authService.decodeToken(token);

    if (!decoded) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return this.sourceService.create(createSourceDto, decoded.userId);
  }

  @Get()
  findAll(@Query('type') type?: SourceType) {
    if (type) {
      return this.sourceService.findByType(type);
    }
    return this.sourceService.findAll();
  }

  @Get('available/all')
  getAvailableSources() {
    return this.sourceService.findAll();
  }

  @Get('poll/needed')
  getSourcesNeedingPoll(@Query('intervalMinutes') intervalMinutes?: number) {
    return this.sourceService.getSourcesNeedingPoll(
      intervalMinutes ? parseInt(intervalMinutes.toString()) : 5,
    );
  }

  @Get('stats/overview')
  getStatsOverview() {
    return this.sourceService.getStatsOverview();
  }

  @Post(':id/regenerate-secret')
  regenerateSecret(@Param('id') id: string) {
    return this.sourceService.regenerateSecret(id);
  }

  @Post(':id/test-webhook')
  testWebhook(@Param('id') id: string, @Body() payload: any) {
    return this.sourceService.testWebhook(id, payload);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sourceService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSourceDto: UpdateSourceDto) {
    return this.sourceService.update(id, updateSourceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sourceService.remove(id);
  }
}
