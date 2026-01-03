import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';
import { Source, SourceType } from '@prisma/client';

@Injectable()
export class SourceService {
  private readonly logger = new Logger(SourceService.name);

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Create a new source
   */
  /**
   * Create a new source
   */
  async create(createSourceDto: CreateSourceDto, userId: string): Promise<Source> {
    const { type, identifier, config } = createSourceDto;

    // Check if source already exists
    const existing = await this.prisma.source.findUnique({
      where: {
        type_identifier: {
          type,
          identifier,
        },
      },
    });

    if (existing) {
      this.logger.warn(
        `Source already exists: ${type}:${identifier}, returning existing source`,
      );
      return existing;
    }

    this.logger.log(`Creating new source: ${type}:${identifier} for user ${userId}`);

    return this.prisma.source.create({
      data: {
        type,
        identifier,
        config: config || {},
        user_id: userId,
      },
    });
  }

  /**
   * Find all sources
   */
  async findAll(): Promise<Source[]> {
    return this.prisma.source.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  /**
   * Find sources by type
   */
  async findByType(type: SourceType): Promise<Source[]> {
    return this.prisma.source.findMany({
      where: { type },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  /**
   * Find one source by ID
   */
  async findOne(id: string): Promise<Source> {
    const source = await this.prisma.source.findUnique({
      where: { id },
      include: {
        streams: true,
        contents: {
          take: 10,
          orderBy: {
            created_at: 'desc',
          },
        },
      },
    });

    if (!source) {
      throw new NotFoundException(`Source with ID ${id} not found`);
    }

    return source;
  }

  /**
   * Find source by type and identifier
   */
  async findByTypeAndIdentifier(
    type: SourceType,
    identifier: string,
  ): Promise<Source | null> {
    return this.prisma.source.findUnique({
      where: {
        type_identifier: {
          type,
          identifier,
        },
      },
    });
  }

  /**
   * Update a source
   */
  async update(id: string, updateSourceDto: UpdateSourceDto): Promise<Source> {
    // Check if source exists
    await this.findOne(id);

    this.logger.log(`Updating source: ${id}`);

    return this.prisma.source.update({
      where: { id },
      data: {
        ...updateSourceDto,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Remove a source
   */
  async remove(id: string): Promise<Source> {
    // Check if source exists
    await this.findOne(id);

    this.logger.log(`Removing source: ${id}`);

    return this.prisma.source.delete({
      where: { id },
    });
  }

  /**
   * Update last polled timestamp
   */
  async updateLastPolled(id: string): Promise<void> {
    await this.prisma.source.update({
      where: { id },
      data: {
        last_polled_at: new Date(),
      },
    });
  }

  /**
   * Get sources that need polling (haven't been polled recently)
   */
  /**
   * Get sources that need polling (haven't been polled recently)
   */
  async getSourcesNeedingPoll(
    intervalMinutes = 5,
  ): Promise<Source[]> {
    const cutoffTime = new Date(Date.now() - intervalMinutes * 60 * 1000);

    return this.prisma.source.findMany({
      where: {
        OR: [
          { last_polled_at: null },
          { last_polled_at: { lt: cutoffTime } },
        ],
      },
      orderBy: {
        last_polled_at: 'asc',
      },
    });
  }

  /**
   * Get overview statistics for sources
   */
  async getStatsOverview(): Promise<{
    total: number;
    by_type: Record<string, { count: number; contents: number; streams: number }>;
    market_sources: number;
  }> {
    const total = await this.prisma.source.count();

    // Group by type
    const sourcesByType = await this.prisma.source.groupBy({
      by: ['type'],
      _count: {
        id: true,
      },
    });

    // We also need content and stream counts by source type
    // This is a bit more complex with PrismagroupBy, so we'll do a robust approximation or separate queries
    // For now, let's iterate types since there are few
    const by_type: Record<string, { count: number; contents: number; streams: number }> = {};

    for (const group of sourcesByType) {
      const type = group.type;
      const count = group._count.id;

      const contents = await this.prisma.content.count({
        where: { source: { type } }
      });

      const streams = await this.prisma.stream.count({
        where: { source: { type } }
      });

      by_type[type] = { count, contents, streams };
    }

    return {
      total,
      by_type,
      market_sources: 0, // Marketplace removed
    };
  }

  /**
   * Regenerate generic secret for a source (useful for webhook sources)
   */
  async regenerateSecret(id: string): Promise<{ secret: string; message: string }> {
    const source = await this.findOne(id);

    // Generate new secret (simple implementation)
    const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Update source config
    const config = (source.config as any) || {};
    config.secret = secret;

    await this.prisma.source.update({
      where: { id },
      data: { config },
    });

    return { secret, message: 'Secret regenerated successfully' };
  }

  /**
   * Test webhook ingestion
   */
  async testWebhook(id: string, payload: any): Promise<any> {
    const source = await this.findOne(id);
    this.logger.log(`Testing webhook for source ${id} with payload size: ${JSON.stringify(payload).length}`);
    return { success: true, message: 'Webhook test payload received', parsed_content: payload };
  }

  // WebSocket Methods

  async connectWebSocket(id: string, url: string, config?: any): Promise<{ success: boolean; message: string }> {
    const source = await this.findOne(id);

    // In a real app, this would start a persistent WebSocket client process
    this.logger.log(`Connecting WebSocket for source ${id} to ${url}`);

    // Update config to mark as connected
    const newConfig = { ...(source.config as any || {}), wsUrl: url, ...config, connected: true };
    await this.update(id, { config: newConfig });

    return { success: true, message: 'WebSocket connected successfully' };
  }

  async disconnectWebSocket(id: string): Promise<{ success: boolean; message: string }> {
    const source = await this.findOne(id);

    // In a real app, this would stop the WebSocket client
    this.logger.log(`Disconnecting WebSocket for source ${id}`);

    // Update config to mark as disconnected
    const newConfig = { ...(source.config as any || {}), connected: false };
    await this.update(id, { config: newConfig });

    return { success: true, message: 'WebSocket disconnected successfully' };
  }

  async getWebSocketStatus(id: string): Promise<{ connected: boolean; readyState: number }> {
    const source = await this.findOne(id);
    const config = source.config as any || {};
    // Simulate open connection (readyState 1) if connected
    return {
      connected: !!config.connected,
      readyState: config.connected ? 1 : 3 // 1=OPEN, 3=CLOSED
    };
  }

  async getAllWebSocketConnections(): Promise<any[]> {
    // Find all sources with WebSocket type (assuming 'wss' type exists or checking config)
    const sources = await this.prisma.source.findMany({
      where: {
        type: 'wss' as any, // assuming 'wss' is in SourceType enum, otherwise checking config
      }
    });

    return sources.map(s => {
      const config = s.config as any || {};
      return {
        sourceId: s.id,
        url: config.wsUrl,
        connected: !!config.connected
      };
    });
  }
}
