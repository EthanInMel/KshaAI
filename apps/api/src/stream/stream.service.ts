import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStreamDto } from './dto/create-stream.dto';
import { UpdateStreamDto } from './dto/update-stream.dto';
import { Stream, StreamStatus } from '@prisma/client';

@Injectable()
export class StreamService {
  private readonly logger = new Logger(StreamService.name);

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Create a new stream
   */
  /**
   * Create a new stream
   */
  async create(createStreamDto: CreateStreamDto, userId: string): Promise<Stream> {
    const { name, source_id, prompt_template, notification_config, status } = createStreamDto;

    // Verify source exists
    const source = await this.prisma.source.findUnique({
      where: { id: source_id },
    });

    if (!source) {
      throw new NotFoundException(`Source with ID ${source_id} not found`);
    }

    this.logger.log(`Creating new stream: ${name} for user ${userId}`);

    return this.prisma.stream.create({
      data: {
        name,
        source_id,
        prompt_template: prompt_template || {},
        notification_config: notification_config || {},
        status: status || StreamStatus.active,
        user_id: userId,
      },
    });
  }

  /**
   * Find all streams
   */
  async findAll(): Promise<Stream[]> {
    return this.prisma.stream.findMany({
      include: {
        source: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  /**
   * Find one stream by ID
   */
  async findOne(id: string): Promise<Stream> {
    const stream = await this.prisma.stream.findUnique({
      where: { id },
      include: {
        source: true,
        logs: {
          take: 10,
          orderBy: {
            created_at: 'desc',
          },
        },
      },
    });

    if (!stream) {
      throw new NotFoundException(`Stream with ID ${id} not found`);
    }

    return stream;
  }

  /**
   * Update a stream
   */
  async update(id: string, updateStreamDto: UpdateStreamDto): Promise<Stream> {
    // Check if stream exists
    await this.findOne(id);

    this.logger.log(`Updating stream: ${id}`);

    return this.prisma.stream.update({
      where: { id },
      data: {
        ...updateStreamDto,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Remove a stream
   */
  async remove(id: string): Promise<Stream> {
    // Check if stream exists
    await this.findOne(id);

    this.logger.log(`Removing stream: ${id}`);

    return this.prisma.stream.delete({
      where: { id },
    });
  }

  /**
   * Start a stream (set status to active)
   */
  async start(id: string): Promise<Stream> {
    return this.update(id, { status: StreamStatus.active });
  }

  /**
   * Pause a stream (set status to paused)
   */
  async pause(id: string): Promise<Stream> {
    return this.update(id, { status: StreamStatus.paused });
  }

  /**
   * Get active streams
   */
  async getActiveStreams(): Promise<Stream[]> {
    return this.prisma.stream.findMany({
      where: {
        status: StreamStatus.active,
      },
      include: {
        source: true,
      },
    });
  }

  /**
   * Get stream statistics
   */
  async getStatistics(id: string) {
    const stream = await this.findOne(id);

    // Get log statistics
    const [totalLogs, successLogs, errorLogs, warningLogs] = await Promise.all([
      this.prisma.log.count({ where: { stream_id: id } }),
      this.prisma.log.count({ where: { stream_id: id, type: 'success' } }),
      this.prisma.log.count({ where: { stream_id: id, type: 'error' } }),
      this.prisma.log.count({ where: { stream_id: id, type: 'warning' } }),
    ]);

    const successRate = totalLogs > 0 ? (successLogs / totalLogs) * 100 : 0;
    const errorRate = totalLogs > 0 ? (errorLogs / totalLogs) * 100 : 0;

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentLogs = await this.prisma.log.count({
      where: {
        stream_id: id,
        created_at: {
          gte: sevenDaysAgo,
        },
      },
    });

    return {
      streamId: id,
      streamName: stream.name,
      status: stream.status,
      totalProcessed: totalLogs,
      successCount: successLogs,
      errorCount: errorLogs,
      warningCount: warningLogs,
      successRate: Math.round(successRate * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      recentActivity: recentLogs,
      createdAt: stream.created_at,
      updatedAt: stream.updated_at,
    };
  }

  /**
   * Get content statistics for a stream
   */
  async getContentStats(id: string) {
    const stream = await this.findOne(id);

    // Get content counts
    const totalContent = await this.prisma.content.count({
      where: { source_id: stream.source_id },
    });

    const [processed, failed] = await Promise.all([
      this.prisma.log.count({
        where: {
          stream_id: id,
          type: 'success',
        },
      }),
      this.prisma.log.count({
        where: {
          stream_id: id,
          type: 'error',
        },
      }),
    ]);

    // Recent 24h stats
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const [recentTotal, recentProcessed] = await Promise.all([
      this.prisma.content.count({
        where: {
          source_id: stream.source_id,
          created_at: { gte: oneDayAgo },
        },
      }),
      this.prisma.log.count({
        where: {
          stream_id: id,
          type: 'success',
          created_at: { gte: oneDayAgo },
        },
      }),
    ]);

    return {
      total: totalContent,
      processed: processed,
      failed: failed,
      unprocessed: Math.max(0, totalContent - processed), // simplified calculation
      recent24h: {
        total: recentTotal,
        processed: recentProcessed,
      },
    };
  }

  /**
   * Clone a stream
   */
  async clone(id: string, newName?: string): Promise<Stream> {
    const originalStream = await this.findOne(id);

    this.logger.log(`Cloning stream: ${id}`);

    return this.prisma.stream.create({
      data: {
        name: newName || `${originalStream.name} (Copy)`,
        source_id: originalStream.source_id,
        prompt_template: originalStream.prompt_template as any,
        notification_config: originalStream.notification_config as any,
        status: StreamStatus.paused, // Start as paused
        user_id: originalStream.user_id,
      },
    });
  }

  /**
   * Toggle stream status
   */
  async toggleStatus(id: string): Promise<Stream> {
    const stream = await this.findOne(id);
    const newStatus = stream.status === StreamStatus.active ? StreamStatus.paused : StreamStatus.active;
    return this.update(id, { status: newStatus });
  }

  /**
   * Stop stream (alias for pause)
   */
  async stop(id: string): Promise<Stream> {
    return this.pause(id);
  }

  /**
   * Get LLM outputs for a stream
   */
  async getLlmOutputs(streamId: string, limit = 50, offset = 0) {
    const [data, total] = await Promise.all([
      this.prisma.llmOutput.findMany({
        where: { stream_id: streamId },
        take: limit,
        skip: offset,
        orderBy: { created_at: 'desc' },
        include: {
          content: true,
        },
      }),
      this.prisma.llmOutput.count({
        where: { stream_id: streamId },
      }),
    ]);

    return { data, total };
  }

  /**
   * Test LLM configuration
   */
  async testLlm(data: {
    llm_config: any;
    prompt_template: { template: string };
    sample_content: string;
  }): Promise<{ output: string; usage?: any; estimated_cost?: number }> {
    // In a real implementation, this would call the LlmService
    // For now, we return a simulated response to verify the endpoint works
    this.logger.log(`Testing LLM with config: ${JSON.stringify(data.llm_config)}`);

    return {
      output: `[SIMULATED LLM OUTPUT]\nBased on your prompt template: "${data.prompt_template.template}"\nAnd content: "${data.sample_content.substring(0, 50)}..."\n\nAnalysis: This appears to be a valid configuration. The LLM would process this content and return a relevant insight.`,
      usage: { prompt_tokens: 50, completion_tokens: 30, total_tokens: 80 },
      estimated_cost: 0.002,
    };
  }
}

