export type {
    Source, AvailableSource, LlmConfig, Stream, Log, LogsResponse, User, Backtest, BacktestResult,
    WebSocketConnectionStatus, WebSocketConnection, LlmOutput, DashboardStats, ActivityData, SourceDistribution,
    ApiKey, ApiKeyWithSecret, ApiKeyUsageStats, ModelInfo, LLMModelsResponse, LLMProviderConfig, OrganizationLLMConfig,
    DataOverview, TopicTrendResult, PlatformCompareResult, ViralTopic, ViralTopicsResult, TopicLifecycle,
    KeywordCooccurrenceResult, SentimentResult, SummaryReport, TelegramBotInfo, TelegramChat, ValidateTelegramTokenResponse,
    DiscordBotInfo, DiscordGuild, DiscordChannel, ValidateDiscordTokenResponse, SubredditInfo, MastodonInstanceInfo,
    MastodonAccount, BlueskyProfile, ChannelType, NotificationChannel, CreateChannelData, StreamTemplate, StreamStatistics,
    MarketplaceSource, MarketplaceSubscription, Organization
} from '@ksha/shared';

import {
    Source, AvailableSource, LlmConfig, Stream, Log, LogsResponse, User, Backtest, BacktestResult,
    WebSocketConnectionStatus, WebSocketConnection, LlmOutput, DashboardStats, ActivityData, SourceDistribution,
    ApiKey, ApiKeyWithSecret, ApiKeyUsageStats, ModelInfo, LLMModelsResponse, LLMProviderConfig, OrganizationLLMConfig,
    DataOverview, TopicTrendResult, PlatformCompareResult, ViralTopic, ViralTopicsResult, TopicLifecycle,
    KeywordCooccurrenceResult, SentimentResult, SummaryReport, TelegramBotInfo, TelegramChat, ValidateTelegramTokenResponse,
    DiscordBotInfo, DiscordGuild, DiscordChannel, ValidateDiscordTokenResponse, SubredditInfo, MastodonInstanceInfo,
    MastodonAccount, BlueskyProfile, ChannelType, NotificationChannel, CreateChannelData, StreamTemplate, StreamStatistics,
    MarketplaceSource, MarketplaceSubscription, Organization
} from '@ksha/shared';

// API Base URL - defaults to ksha-core API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';

export function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
}

export async function handleResponse(response: Response) {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
}

// Auth
export async function login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
}

export async function register(data: {
    email: string;
    password: string;
    fullName?: string;
    organizationName?: string;
}) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
}

export async function getProfile() {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

// Sources

export async function getSources(): Promise<Source[]> {
    const response = await fetch(`${API_BASE_URL}/source`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

// Extended source with marketplace info

export async function getAvailableSources(): Promise<AvailableSource[]> {
    const response = await fetch(`${API_BASE_URL}/source/available/all`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function getSourceStats(): Promise<{
    total: number;
    by_type: Record<string, { count: number; contents: number; streams: number }>;
    market_sources: number;
}> {
    const response = await fetch(`${API_BASE_URL}/source/stats/overview`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function getSource(id: string): Promise<Source> {
    const response = await fetch(`${API_BASE_URL}/source/${id}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function createSource(data: {
    type: string;
    identifier: string;
    config?: any;
}): Promise<Source> {
    const response = await fetch(`${API_BASE_URL}/source`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
}

export async function updateSource(id: string, data: Partial<Source>): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/source/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
}

export async function deleteSource(id: string): Promise<any> {
    const headers = { ...getAuthHeaders() };
    delete (headers as any)['Content-Type'];
    const response = await fetch(`${API_BASE_URL}/source/${id}`, {
        method: 'DELETE',
        headers,
    });
    return handleResponse(response);
}

// Streams

export async function getStreams(): Promise<Stream[]> {
    const response = await fetch(`${API_BASE_URL}/stream`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function getStream(id: string): Promise<Stream> {
    const response = await fetch(`${API_BASE_URL}/stream/${id}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function getStreamStatistics(id: string): Promise<StreamStatistics> {
    const response = await fetch(`${API_BASE_URL}/stream/${id}/statistics`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function createStream(data: {
    name: string;
    source_id?: string;
    source_type?: string;
    source_identifier?: string;
    prompt_template?: any;
    llm_config?: any;
    notification_config?: any;
    aggregation_config?: any;
}): Promise<Stream> {
    const response = await fetch(`${API_BASE_URL}/stream`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
}

export async function updateStream(id: string, data: Partial<Stream>): Promise<Stream> {
    const response = await fetch(`${API_BASE_URL}/stream/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
}

export async function deleteStream(id: string): Promise<any> {
    const headers = { ...getAuthHeaders() };
    delete (headers as any)['Content-Type'];
    const response = await fetch(`${API_BASE_URL}/stream/${id}`, {
        method: 'DELETE',
        headers,
    });
    return handleResponse(response);
}

export async function toggleStreamStatus(id: string): Promise<Stream> {
    const response = await fetch(`${API_BASE_URL}/stream/${id}/toggle`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function stopStream(id: string): Promise<Stream> {
    const response = await fetch(`${API_BASE_URL}/stream/${id}/stop`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function getStreamTemplates(): Promise<StreamTemplate[]> {
    const response = await fetch(`${API_BASE_URL}/stream/templates/list`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function cloneStream(id: string): Promise<Stream> {
    const response = await fetch(`${API_BASE_URL}/stream/${id}/clone`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

// Logs

export async function getLogs(params?: {
    limit?: number;
    offset?: number;
    type?: string;
    streamId?: string;
}): Promise<LogsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.streamId) queryParams.append('streamId', params.streamId);

    const response = await fetch(
        `${API_BASE_URL}/log?${queryParams.toString()}`,
        {
            headers: getAuthHeaders(),
        }
    );
    return handleResponse(response);
}

export async function getLog(id: string): Promise<Log> {
    const response = await fetch(`${API_BASE_URL}/log/${id}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function getLogStats(): Promise<{
    total: number;
    byType: Record<string, number>;
}> {
    const response = await fetch(`${API_BASE_URL}/log/stats`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

// Users

export async function updateProfile(data: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
}

// User Management & Organization & Marketplace removed


// Backtest

export async function createBacktest(data: {
    streamId: string;
    name: string;
    description?: string;
    startTime: string;
    endTime: string;
    config?: any;
}): Promise<Backtest> {
    const response = await fetch(`${API_BASE_URL}/backtest`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
}

export async function getBacktests(): Promise<Backtest[]> {
    const response = await fetch(`${API_BASE_URL}/backtest`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function getStreamBacktests(streamId: string): Promise<Backtest[]> {
    const response = await fetch(`${API_BASE_URL}/backtest/stream/${streamId}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function getBacktest(id: string): Promise<Backtest> {
    const response = await fetch(`${API_BASE_URL}/backtest/${id}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function getBacktestResults(id: string, page = 1, limit = 50): Promise<{ data: BacktestResult[]; total: number }> {
    const response = await fetch(`${API_BASE_URL}/backtest/${id}/results?page=${page}&limit=${limit}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

// Webhook
export async function testWebhook(sourceId: string, sampleData: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/source/${sourceId}/test-webhook`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(sampleData),
    });
    return handleResponse(response);
}

export async function regenerateWebhookSecret(sourceId: string): Promise<{ secret: string; message: string }> {
    const response = await fetch(`${API_BASE_URL}/source/${sourceId}/regenerate-secret`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

// WebSocket Source

export async function connectWebSocketSource(sourceId: string, url: string, config?: any): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/websocket-source/${sourceId}/connect`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ url, config }),
    });
    return handleResponse(response);
}

export async function disconnectWebSocketSource(sourceId: string): Promise<{ success: boolean; message: string }> {
    const headers = { ...getAuthHeaders() };
    delete (headers as any)['Content-Type'];
    const response = await fetch(`${API_BASE_URL}/websocket-source/${sourceId}/disconnect`, {
        method: 'DELETE',
        headers,
    });
    return handleResponse(response);
}

export async function getWebSocketSourceStatus(sourceId: string): Promise<WebSocketConnectionStatus> {
    const response = await fetch(`${API_BASE_URL}/websocket-source/${sourceId}/status`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function getAllWebSocketConnections(): Promise<WebSocketConnection[]> {
    const response = await fetch(`${API_BASE_URL}/websocket-source/connections`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

// Stream Subscriptions REMOVED

// LLM Outputs

export async function getStreamLlmOutputs(streamId: string, params?: { limit?: number; offset?: number }): Promise<{ data: LlmOutput[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(`${API_BASE_URL}/stream/${streamId}/llm-outputs?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function testStreamLlm(data: {
    llm_config: LlmConfig;
    prompt_template: { template: string };
    sample_content: string;
}): Promise<{ output: string; usage?: any; estimated_cost?: number }> {
    const response = await fetch(`${API_BASE_URL}/stream/test-llm`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
}

// Dashboard

export async function getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/analytics/overview`, {
        headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return {
        totalStreams: data.total_streams,
        activeStreams: data.active_streams || 0,
        totalSources: data.total_sources,
        todayContent: data.today_content || 0,
        todayLlmCalls: data.today_llm_calls || 0,
    };
}

export async function getDashboardActivity(days = 7): Promise<ActivityData[]> {
    const response = await fetch(`${API_BASE_URL}/analytics/content-trend?days=${days}`, {
        headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data.map((item: any) => ({
        date: item.date,
        content: item.count,
        llm: 0 // Backend doesn't support LLM trend yet
    }));
}

export async function getDashboardSourceDistribution(): Promise<SourceDistribution[]> {
    const response = await fetch(`${API_BASE_URL}/analytics/source-stats`, {
        headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    const byType = data.by_type || {};
    return Object.entries(byType).map(([type, stats]: [string, any]) => ({
        name: type,
        value: stats.count
    }));
}

// API Keys

export async function createApiKey(data: {
    name: string;
    scopes?: string[];
    expiresAt?: string;
    rateLimit?: number;
}): Promise<ApiKeyWithSecret> {
    const response = await fetch(`${API_BASE_URL}/api-keys`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
}

export async function getApiKeys(): Promise<ApiKey[]> {
    const response = await fetch(`${API_BASE_URL}/api-keys`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function getApiKey(id: string): Promise<ApiKey> {
    const response = await fetch(`${API_BASE_URL}/api-keys/${id}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function revokeApiKey(id: string): Promise<ApiKey> {
    const response = await fetch(`${API_BASE_URL}/api-keys/${id}/revoke`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function deleteApiKey(id: string): Promise<{ message: string }> {
    const headers = { ...getAuthHeaders() };
    delete (headers as any)['Content-Type'];
    const response = await fetch(`${API_BASE_URL}/api-keys/${id}`, {
        method: 'DELETE',
        headers,
    });
    return handleResponse(response);
}

export async function getApiKeyUsage(id: string, days = 7): Promise<ApiKeyUsageStats> {
    const response = await fetch(`${API_BASE_URL}/api-keys/${id}/usage?days=${days}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

// LLM Models

export async function getLLMModels(provider?: string): Promise<LLMModelsResponse> {
    const url = provider
        ? `${API_BASE_URL}/llm/models?provider=${provider}`
        : `${API_BASE_URL}/llm/models`;
    const response = await fetch(url, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

// Organization LLM Config

export async function getOrganizationLLMConfig(): Promise<OrganizationLLMConfig> {
    const response = await fetch(`${API_BASE_URL}/organization/llm-config`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}



// ==================== Analytics API ====================

// 数据概览

export async function getDataOverview(days = 7): Promise<DataOverview> {
    const response = await fetch(`${API_BASE_URL}/analytics/overview?days=${days}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

// 话题趋势分析

export async function analyzeTopicTrend(params: {
    topic: string;
    startDate?: string;
    endDate?: string;
    sourceIds?: string[];
}): Promise<TopicTrendResult> {
    const queryParams = new URLSearchParams();
    queryParams.append('topic', params.topic);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.sourceIds) queryParams.append('sourceIds', params.sourceIds.join(','));

    const response = await fetch(`${API_BASE_URL}/analytics/topic-trend?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

// 平台对比分析

export async function comparePlatforms(params?: {
    topic?: string;
    startDate?: string;
    endDate?: string;
}): Promise<PlatformCompareResult> {
    const queryParams = new URLSearchParams();
    if (params?.topic) queryParams.append('topic', params.topic);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await fetch(`${API_BASE_URL}/analytics/platform-compare?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

// 爆火话题检测

export async function detectViralTopics(params?: {
    threshold?: number;
    minCount?: number;
}): Promise<ViralTopicsResult> {
    const queryParams = new URLSearchParams();
    if (params?.threshold) queryParams.append('threshold', params.threshold.toString());
    if (params?.minCount) queryParams.append('minCount', params.minCount.toString());

    const response = await fetch(`${API_BASE_URL}/analytics/viral-topics?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

// 话题生命周期分析

export async function analyzeTopicLifecycle(params: {
    topic: string;
    startDate?: string;
    endDate?: string;
}): Promise<TopicLifecycle> {
    const queryParams = new URLSearchParams();
    queryParams.append('topic', params.topic);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const response = await fetch(`${API_BASE_URL}/analytics/topic-lifecycle?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

// 关键词共现分析

export async function analyzeKeywordCooccurrence(params?: {
    minFrequency?: number;
    topN?: number;
    startDate?: string;
    endDate?: string;
}): Promise<KeywordCooccurrenceResult> {
    const queryParams = new URLSearchParams();
    if (params?.minFrequency) queryParams.append('minFrequency', params.minFrequency.toString());
    if (params?.topN) queryParams.append('topN', params.topN.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await fetch(`${API_BASE_URL}/analytics/keyword-cooccurrence?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

// 情感分析

export async function analyzeSentiment(params?: {
    topic?: string;
    sourceIds?: string[];
    limit?: number;
    startDate?: string;
    endDate?: string;
}): Promise<SentimentResult> {
    const queryParams = new URLSearchParams();
    if (params?.topic) queryParams.append('topic', params.topic);
    if (params?.sourceIds) queryParams.append('sourceIds', params.sourceIds.join(','));
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await fetch(`${API_BASE_URL}/analytics/sentiment?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

// 摘要报告

export async function generateSummaryReport(type: 'daily' | 'weekly' = 'daily'): Promise<SummaryReport> {
    const response = await fetch(`${API_BASE_URL}/analytics/summary-report?type=${type}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

// ==================== Telegram API ====================

export async function validateTelegramToken(botToken: string): Promise<ValidateTelegramTokenResponse> {
    const response = await fetch(`${API_BASE_URL}/telegram/validate-token`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ botToken }),
    });
    return handleResponse(response);
}

export async function getTelegramChats(botToken: string): Promise<{ success: boolean; chats: TelegramChat[] }> {
    const response = await fetch(`${API_BASE_URL}/telegram/get-chats`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ botToken }),
    });
    return handleResponse(response);
}

export async function getTelegramChatInfo(botToken: string, chatId: number): Promise<{ success: boolean; chat: TelegramChat }> {
    const response = await fetch(`${API_BASE_URL}/telegram/get-chat-info`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ botToken, chatId }),
    });
    return handleResponse(response);
}

export async function pollTelegramSource(sourceId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/telegram/${sourceId}/poll`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

// ==================== Discord API ====================

export async function validateDiscordToken(botToken: string): Promise<ValidateDiscordTokenResponse> {
    const response = await fetch(`${API_BASE_URL}/discord/validate-token`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ botToken }),
    });
    return handleResponse(response);
}

export async function getDiscordChannels(botToken: string, guildId: string): Promise<{ success: boolean; channels: DiscordChannel[] }> {
    const response = await fetch(`${API_BASE_URL}/discord/get-channels`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ botToken, guildId }),
    });
    return handleResponse(response);
}

// ==================== Reddit API ====================

export async function validateRedditSubreddits(subreddits: string[]): Promise<{
    success: boolean;
    valid: SubredditInfo[];
    invalid: string[];
}> {
    const response = await fetch(`${API_BASE_URL}/reddit/validate-subreddits`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ subreddits }),
    });
    return handleResponse(response);
}

export async function searchRedditSubreddits(query: string): Promise<{ success: boolean; subreddits: SubredditInfo[] }> {
    const response = await fetch(`${API_BASE_URL}/reddit/search?q=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

// ==================== Mastodon API ====================

export async function validateMastodonInstance(instance: string): Promise<{
    success: boolean;
    info?: MastodonInstanceInfo;
    error?: string;
}> {
    const response = await fetch(`${API_BASE_URL}/mastodon/validate-instance`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ instance }),
    });
    return handleResponse(response);
}

export async function searchMastodonAccounts(instance: string, query: string): Promise<{
    success: boolean;
    accounts: MastodonAccount[];
}> {
    const response = await fetch(`${API_BASE_URL}/mastodon/search-accounts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ instance, query }),
    });
    return handleResponse(response);
}

export async function lookupMastodonAccount(instance: string, username: string): Promise<{
    success: boolean;
    account: MastodonAccount;
}> {
    const response = await fetch(`${API_BASE_URL}/mastodon/lookup-account`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ instance, username }),
    });
    return handleResponse(response);
}

// ==================== Bluesky API ====================

export async function validateBlueskyHandle(handle: string): Promise<{
    success: boolean;
    profile?: BlueskyProfile;
    error?: string;
}> {
    const response = await fetch(`${API_BASE_URL}/bluesky/validate-handle`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ handle }),
    });
    return handleResponse(response);
}

export async function searchBlueskyUsers(query: string): Promise<{
    success: boolean;
    users: BlueskyProfile[];
}> {
    const response = await fetch(`${API_BASE_URL}/bluesky/search-users?q=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

// ============================================================================
// NOTIFICATION CHANNELS
// ============================================================================

export async function getNotificationChannels(): Promise<NotificationChannel[]> {
    const response = await fetch(`${API_BASE_URL}/notification-channel`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function getNotificationChannel(id: string): Promise<NotificationChannel> {
    const response = await fetch(`${API_BASE_URL}/notification-channel/${id}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function getDefaultNotificationChannels(): Promise<NotificationChannel[]> {
    const response = await fetch(`${API_BASE_URL}/notification-channel/defaults`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function createNotificationChannel(data: CreateChannelData): Promise<NotificationChannel> {
    const response = await fetch(`${API_BASE_URL}/notification-channel`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
}

export async function updateNotificationChannel(id: string, data: Partial<CreateChannelData>): Promise<NotificationChannel> {
    const response = await fetch(`${API_BASE_URL}/notification-channel/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
}

export async function deleteNotificationChannel(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/notification-channel/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

// Marketplace
export async function getMarketplaceSources(params?: any): Promise<MarketplaceSource[]> {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/marketplace/sources?${query}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function getMarketplaceSubscriptions(): Promise<MarketplaceSubscription[]> {
    const response = await fetch(`${API_BASE_URL}/marketplace/subscriptions`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function subscribeToMarketplaceSource(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/marketplace/sources/${id}/subscribe`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function unsubscribeFromMarketplaceSource(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/marketplace/sources/${id}/unsubscribe`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function createMarketplaceSource(data: any): Promise<MarketplaceSource> {
    const response = await fetch(`${API_BASE_URL}/marketplace/sources`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
}

export async function updateOrganization(data: any): Promise<Organization> {
    const response = await fetch(`${API_BASE_URL}/organization/current`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
}

export async function regenerateApiKey(): Promise<ApiKeyWithSecret> {
    const response = await fetch(`${API_BASE_URL}/organization/current/api-key/regenerate`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function updateOrganizationLLMConfig(provider: string, apiKey: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/organization/current/llm-config`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ provider, apiKey }),
    });
    return handleResponse(response);
}

export async function deleteOrganizationLLMConfig(provider: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/organization/current/llm-config/${provider}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}

export async function inviteUser(data: { email: string, role: string }): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/invite`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
}

export async function updateUserRole(id: string, role: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}/role`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role }),
    });
    return handleResponse(response);
}

export async function toggleUserActive(id: string, active?: boolean): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}/active`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ active }),
    });
    return handleResponse(response);
}

export async function deleteUser(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}
