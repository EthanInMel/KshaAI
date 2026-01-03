import useSWR from 'swr'
import { 
  DataOverview, 
  TopicTrendResult,
  PlatformCompareResult,
  ViralTopicsResult,
  TopicLifecycle,
  KeywordCooccurrenceResult,
  SentimentResult,
  SummaryReport,
} from '../lib/api'
import { fetcher } from '../lib/swr-config'

// 数据概览 hook
export function useDataOverview(days = 7) {
  const { data, error, isLoading, mutate } = useSWR<DataOverview>(
    `/analytics/overview?days=${days}`,
    fetcher,
    {
      refreshInterval: 60000, // 每分钟刷新
      revalidateOnFocus: false,
    }
  )

  return {
    overview: data,
    isLoading,
    isError: error,
    mutate,
  }
}

// 话题趋势分析 hook
export function useTopicTrend(params: {
  topic: string;
  startDate?: string;
  endDate?: string;
  sourceIds?: string[];
} | null) {
  const queryParams = params ? new URLSearchParams() : null
  if (params) {
    queryParams?.append('topic', params.topic)
    if (params.startDate) queryParams?.append('startDate', params.startDate)
    if (params.endDate) queryParams?.append('endDate', params.endDate)
    if (params.sourceIds) queryParams?.append('sourceIds', params.sourceIds.join(','))
  }

  const { data, error, isLoading, mutate } = useSWR<TopicTrendResult>(
    params ? `/analytics/topic-trend?${queryParams?.toString()}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    trend: data,
    isLoading,
    isError: error,
    mutate,
  }
}

// 平台对比 hook
export function usePlatformCompare(params?: {
  topic?: string;
  startDate?: string;
  endDate?: string;
}) {
  const queryParams = new URLSearchParams()
  if (params?.topic) queryParams.append('topic', params.topic)
  if (params?.startDate) queryParams.append('startDate', params.startDate)
  if (params?.endDate) queryParams.append('endDate', params.endDate)

  const { data, error, isLoading, mutate } = useSWR<PlatformCompareResult>(
    `/analytics/platform-compare?${queryParams.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    comparison: data,
    isLoading,
    isError: error,
    mutate,
  }
}

// 爆火话题检测 hook
export function useViralTopics(params?: {
  threshold?: number;
  minCount?: number;
}) {
  const queryParams = new URLSearchParams()
  if (params?.threshold) queryParams.append('threshold', params.threshold.toString())
  if (params?.minCount) queryParams.append('minCount', params.minCount.toString())

  const { data, error, isLoading, mutate } = useSWR<ViralTopicsResult>(
    `/analytics/viral-topics?${queryParams.toString()}`,
    fetcher,
    {
      refreshInterval: 300000, // 每5分钟刷新
      revalidateOnFocus: false,
    }
  )

  return {
    viralTopics: data,
    isLoading,
    isError: error,
    mutate,
  }
}

// 话题生命周期 hook
export function useTopicLifecycle(params: {
  topic: string;
  startDate?: string;
  endDate?: string;
} | null) {
  const queryParams = params ? new URLSearchParams() : null
  if (params) {
    queryParams?.append('topic', params.topic)
    if (params.startDate) queryParams?.append('startDate', params.startDate)
    if (params.endDate) queryParams?.append('endDate', params.endDate)
  }

  const { data, error, isLoading, mutate } = useSWR<TopicLifecycle>(
    params ? `/analytics/topic-lifecycle?${queryParams?.toString()}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    lifecycle: data,
    isLoading,
    isError: error,
    mutate,
  }
}

// 关键词共现 hook
export function useKeywordCooccurrence(params?: {
  minFrequency?: number;
  topN?: number;
  startDate?: string;
  endDate?: string;
}) {
  const queryParams = new URLSearchParams()
  if (params?.minFrequency) queryParams.append('minFrequency', params.minFrequency.toString())
  if (params?.topN) queryParams.append('topN', params.topN.toString())
  if (params?.startDate) queryParams.append('startDate', params.startDate)
  if (params?.endDate) queryParams.append('endDate', params.endDate)

  const { data, error, isLoading, mutate } = useSWR<KeywordCooccurrenceResult>(
    `/analytics/keyword-cooccurrence?${queryParams.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    cooccurrence: data,
    isLoading,
    isError: error,
    mutate,
  }
}

// 情感分析 hook
export function useSentiment(params?: {
  topic?: string;
  sourceIds?: string[];
  limit?: number;
  startDate?: string;
  endDate?: string;
}) {
  const queryParams = new URLSearchParams()
  if (params?.topic) queryParams.append('topic', params.topic)
  if (params?.sourceIds) queryParams.append('sourceIds', params.sourceIds.join(','))
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.startDate) queryParams.append('startDate', params.startDate)
  if (params?.endDate) queryParams.append('endDate', params.endDate)

  const { data, error, isLoading, mutate } = useSWR<SentimentResult>(
    `/analytics/sentiment?${queryParams.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    sentiment: data,
    isLoading,
    isError: error,
    mutate,
  }
}

// 摘要报告 hook
export function useSummaryReport(type: 'daily' | 'weekly' = 'daily') {
  const { data, error, isLoading, mutate } = useSWR<SummaryReport>(
    `/analytics/summary-report?type=${type}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    report: data,
    isLoading,
    isError: error,
    mutate,
  }
}

