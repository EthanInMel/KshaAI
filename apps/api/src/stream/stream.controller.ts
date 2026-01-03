import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { StreamService } from './stream.service';
import { AuthService } from '../auth/auth.service';
import { CreateStreamDto } from './dto/create-stream.dto';
import { UpdateStreamDto } from './dto/update-stream.dto';
import { STREAM_TEMPLATES } from './stream-templates';

@Controller('stream')
export class StreamController {
  constructor(
    private readonly streamService: StreamService,
    private readonly authService: AuthService
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Headers('authorization') authHeader: string, @Body() createStreamDto: CreateStreamDto) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    const decoded = this.authService.decodeToken(token);

    if (!decoded) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return this.streamService.create(createStreamDto, decoded.userId);
  }

  @Get()
  findAll() {
    return this.streamService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.streamService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStreamDto: UpdateStreamDto) {
    return this.streamService.update(id, updateStreamDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.streamService.remove(id);
  }

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  start(@Param('id') id: string) {
    return this.streamService.start(id);
  }

  @Post(':id/pause')
  @HttpCode(HttpStatus.OK)
  pause(@Param('id') id: string) {
    return this.streamService.pause(id);
  }

  @Get(':id/statistics')
  getStatistics(@Param('id') id: string) {
    return this.streamService.getStatistics(id);
  }

  @Get(':id/content-stats')
  getContentStats(@Param('id') id: string) {
    return this.streamService.getContentStats(id);
  }

  @Post(':id/clone')
  @HttpCode(HttpStatus.CREATED)
  clone(@Param('id') id: string, @Body('name') name?: string) {
    return this.streamService.clone(id, name);
  }

  @Get('templates/list')
  getTemplates() {
    return STREAM_TEMPLATES;
  }

  @Post('test-llm')
  testLlm(@Body() data: {
    llm_config: any;
    prompt_template: { template: string };
    sample_content: string;
  }) {
    return this.streamService.testLlm(data);
  }

  @Post(':id/toggle')
  toggle(@Param('id') id: string) {
    return this.streamService.toggleStatus(id);
  }

  @Post(':id/stop')
  stop(@Param('id') id: string) {
    return this.streamService.stop(id);
  }

  @Get(':id/llm-outputs')
  getLlmOutputs(
    @Param('id') id: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.streamService.getLlmOutputs(
      id,
      limit ? parseInt(limit.toString()) : 50,
      offset ? parseInt(offset.toString()) : 0,
    );
  }
}
