


// Stream Templates
export interface StreamTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    promptTemplate: {
        triggerPrompt: string;
        notificationPrompt: string;
    };
    notificationConfig: {
        channel: string;
    };
}

// Stream Statistics
export interface StreamStatistics {
    totalProcessed: number;
    successCount: number;
    successRate: number;
    errorCount: number;
    errorRate: number;
    recentActivity: number;
}

// Sources
export interface Source {
    id: string;
    organization_id: string;
    type: string;
    identifier: string;
    config?: any;
    last_polled_at?: string;
    created_at: string;
    updated_at: string;
}

// Extended source with marketplace info
export interface AvailableSource extends Source {
    marketplace_info?: {
        name: string;
        description: string;
        recommended_prompt?: string;
        original_source_type: string;
    };
    _count?: {
        streams: number;
        contents: number;
    };
}

// Streams
export interface LlmConfig {
    provider: string;
    model: string;
    temperature?: number;
    max_tokens?: number;
    api_key?: string;
    base_url?: string;
}

export interface Stream {
    id: string;
    organization_id: string;
    name: string;
    source_id: string;
    prompt_template?: any;
    llm_config?: LlmConfig;
    notification_config?: any;
    aggregation_config?: {
        type: 'realtime' | 'digest';
        schedule?: string;
    };
    analysis_config?: any;
    status: 'active' | 'paused' | 'error';
    created_at: string;
    updated_at: string;
    source?: {
        id: string;
        type: string;
        identifier: string;
    };
    creator?: {
        full_name: string;
        organization?: {
            name: string;
        };
    };
}

// Logs
export interface Log {
    id: string;
    stream_id: string;
    content_id?: string;
    type: string;
    message: string;
    metadata?: any;
    created_at: string;
    stream?: {
        id: string;
        name: string;
    };
    content?: {
        id: string;
        external_id?: string;
    };
}

export interface LogsResponse {
    logs: Log[];
    total: number;
    limit: number;
    offset: number;
}

// Users
export interface User {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    settings?: any; // { twitter: ..., llm: ... }
    is_active: boolean;
    last_login_at?: string;
    created_at: string;
    updated_at?: string;
}

// Backtest
export interface Backtest {
    id: string;
    stream_id: string;
    name: string;
    description?: string;
    range_start: string;
    range_end: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    started_at?: string;
    completed_at?: string;
    config?: any;
    total_items: number;
    processed_items: number;
    created_at: string;
    stream?: {
        name: string;
        prompt_template?: any;
    };
    results?: BacktestResult[];
}

export interface BacktestResult {
    id: string;
    backtest_id: string;
    content_id: string;
    status: string;
    output?: any;
    execution_time_ms?: number;
    created_at: string;
    content?: {
        external_id?: string;
        created_at: string;
    };
}

// WebSocket Source
export interface WebSocketConnectionStatus {
    connected: boolean;
    readyState?: number;
}

export interface WebSocketConnection {
    sourceId: string;
    url: string;
    connected: boolean;
}

// LLM Outputs
export interface LlmOutput {
    id: string;
    content_id: string;
    stream_id: string;
    log_id?: string;
    raw_output: string;
    model?: string;
    prompt_text?: string;
    created_at: string;
    content?: {
        raw_content: string;
        posted_at?: string;
    };
}

// Dashboard
export interface DashboardStats {
    totalStreams: number;
    activeStreams: number;
    totalSources: number;
    todayContent: number;
    todayLlmCalls: number;
}

export interface ActivityData {
    date: string;
    content: number;
    llm: number;
}

export interface SourceDistribution {
    name: string;
    value: number;
}

// API Keys
export interface ApiKey {
    id: string;
    name: string;
    key_prefix: string;
    scopes: string[];
    status: 'active' | 'revoked' | 'expired';
    expires_at?: string;
    rate_limit?: number;
    last_used_at?: string;
    total_requests: number;
    created_at: string;
    updated_at: string;
}

export interface ApiKeyWithSecret extends ApiKey {
    key: string; // Only returned on creation
}

export interface ApiKeyUsageStats {
    totalRequests: number;
    avgResponseTime: number;
    errorRate: number;
    statusCodeBreakdown: Array<{
        statusCode: number;
        count: number;
    }>;
}

// LLM Models
export interface ModelInfo {
    id: string;
    name: string;
    owned_by?: string;
}

export interface LLMModelsResponse {
    openai?: ModelInfo[];
    anthropic?: ModelInfo[];
    google?: ModelInfo[];
    siliconflow?: ModelInfo[];
    provider?: string;
    models?: ModelInfo[];
}

// Organization LLM Config
export interface LLMProviderConfig {
    configured: boolean;
    key_preview?: string;
    error?: string;
}

export interface OrganizationLLMConfig {
    providers: Record<string, LLMProviderConfig>;
}

// Organization
export interface Organization {
    id: string;
    name: string;
    slug: string;
    plan: string;
    llm_balance: number;
    billing_email?: string;
    created_at: string;
    updated_at: string;
    llm_config?: OrganizationLLMConfig;
}

// Analytics API
export interface DataOverview {
    totalContent: number;
    totalSources: number;
    totalStreams?: number;
    activeStreams: number;
    todayContent?: number;
    todayLlmCalls?: number;
    contentByDay: Array<{ date: string; count: number }>;
    contentBySource: Array<{ sourceType: string; count: number }>;
    recentActivity: Array<{
        type: string;
        message: string;
        timestamp: string;
    }>;
}

export interface TopicTrendResult {
    topic: string;
    dateRange: { start: string; end: string; totalDays: number };
    trendData: Array<{
        date: string;
        count: number;
        sampleContents?: string[];
    }>;
    statistics: {
        totalMentions: number;
        averageMentions: number;
        peakCount: number;
        peakDate: string | null;
        changeRate: number;
    };
    trendDirection: 'rising' | 'falling' | 'stable';
}

export interface PlatformCompareResult {
    topic: string | null;
    dateRange: { start: string; end: string };
    platformStats: Array<{
        sourceId: string;
        sourceType: string;
        sourceIdentifier: string;
        totalContent: number;
        topicMentions: number;
        coverageRate: number;
        topKeywords: Array<{ keyword: string; count: number }>;
    }>;
    totalPlatforms: number;
}

export interface ViralTopic {
    keyword: string;
    currentCount: number;
    previousCount: number;
    growthRate: number | 'new';
    sampleContents: string[];
    alertLevel: 'high' | 'medium' | 'low';
}

export interface ViralTopicsResult {
    viralTopics: ViralTopic[];
    totalDetected: number;
    threshold: number;
    detectionTime: string;
}

export interface TopicLifecycle {
    topic: string;
    firstAppearance: string | null;
    lastAppearance: string | null;
    peakDate: string;
    peakCount: number;
    activeDays: number;
    avgDailyMentions: number;
    lifecycleStage: 'emerging' | 'rising' | 'peak' | 'declining' | 'stable';
    topicType: 'flash' | 'sustained' | 'periodic';
}

export interface KeywordCooccurrenceResult {
    cooccurrencePairs: Array<{
        keyword1: string;
        keyword2: string;
        cooccurrenceCount: number;
        sampleContents: string[];
    }>;
    totalPairs: number;
    minFrequency: number;
}

export interface SentimentResult {
    overall: 'positive' | 'negative' | 'neutral';
    score: number;
    distribution: {
        positive: number;
        negative: number;
        neutral: number;
    };
    platformComparison: Array<{
        sourceType: string;
        sentiment: 'positive' | 'negative' | 'neutral';
        score: number;
    }>;
    aiPrompt?: string;
    newsCount: number;
}

export interface SummaryReport {
    title: string;
    dateRange: { start: string; end: string };
    summary: {
        totalContent: number;
        activeSources: number;
        topKeywords: Array<{ keyword: string; count: number }>;
    };
    platformBreakdown: Array<{
        sourceType: string;
        count: number;
        percentage: number;
    }>;
    trendingTopics: Array<{
        topic: string;
        count: number;
        trend: 'rising' | 'stable' | 'falling';
    }>;
    markdownReport: string;
    generatedAt: string;
}

// Telegram API
export interface TelegramBotInfo {
    id: number;
    is_bot: boolean;
    first_name: string;
    username: string;
    can_join_groups: boolean;
    can_read_all_group_messages: boolean;
}

export interface TelegramChat {
    id: number;
    title: string;
    type: 'group' | 'supergroup' | 'channel' | 'private';
    username?: string;
    description?: string;
    member_count?: number;
}

export interface ValidateTelegramTokenResponse {
    success: boolean;
    bot?: TelegramBotInfo;
    chats?: TelegramChat[];
    error?: string;
    // Added for robustness
    message?: string;
}

// Discord API
export interface DiscordBotInfo {
    id: string;
    username: string;
    discriminator: string;
    avatar?: string;
}

export interface DiscordGuild {
    id: string;
    name: string;
    icon?: string;
    owner: boolean;
}

export interface DiscordChannel {
    id: string;
    name: string;
    type: number;
    guild_id: string;
    topic?: string;
}

export interface ValidateDiscordTokenResponse {
    success: boolean;
    bot?: DiscordBotInfo;
    guilds?: DiscordGuild[];
    error?: string;
}

// Reddit API
export interface SubredditInfo {
    name: string;
    title: string;
    description: string;
    subscribers: number;
    public_description: string;
    icon_img?: string;
}

// Mastodon API
export interface MastodonInstanceInfo {
    name: string;
    description: string;
    version: string;
}

export interface MastodonAccount {
    id: string;
    username: string;
    acct: string;
    display_name: string;
    note: string;
    avatar: string;
    followers_count: number;
    following_count: number;
    statuses_count: number;
}

// Bluesky API
export interface BlueskyProfile {
    did: string;
    handle: string;
    displayName?: string;
    description?: string;
    avatar?: string;
    followersCount: number;
    followsCount: number;
    postsCount: number;
}

// Marketplace
export interface MarketplaceSource {
    id: string;
    organization_id: string;
    source_id: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    price: number;
    is_public: boolean;
    created_at: string;
    updated_at: string;
    creator?: {
        organization?: {
            name: string;
        };
    };
    _count?: {
        subscriptions: number;
    };
}

export interface MarketplaceSubscription {
    id: string;
    user_id: string;
    marketplace_source_id: string;
    status: 'active' | 'cancelled' | 'expired';
    created_at: string;
    expires_at?: string;
}

// Notification Channels
export type ChannelType = 'telegram' | 'discord' | 'webhook' | 'email' | 'slack';

export interface NotificationChannel {
    id: string;
    user_id: string;
    name: string;
    type: ChannelType;
    config: Record<string, any>;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateChannelData {
    name: string;
    type: ChannelType;
    config: Record<string, any>;
    is_default?: boolean;
}
