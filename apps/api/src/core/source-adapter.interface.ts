export interface SourceConfig {
    [key: string]: any;
}

export interface ContentItem {
    externalId: string;
    rawContent: string;
    postedAt: Date;
    metadata?: Record<string, any>;
    author?: {
        id: string;
        name?: string;
        username?: string;
    };
}

export interface SourceAdapter {
    /**
     * Unique type identifier for the adapter (e.g., 'x', 'rss')
     */
    type: string;

    /**
     * Validate configuration for a source
     */
    validateConfig(config: SourceConfig): Promise<boolean>;

    /**
     * Fetch content from the source
     * @param identifier The source identifier (e.g., username, URL)
     * @param config Configuration for the source
     * @param lastPolledAt Timestamp of the last poll
     * @param organizationId Organization ID (optional, for multi-tenant adapters)
     */
    fetchContent(
        identifier: string,
        config: SourceConfig,
        lastPolledAt?: Date,
        organizationId?: string
    ): Promise<ContentItem[]>;
}


