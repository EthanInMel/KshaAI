import useSWR from 'swr'
import { DashboardStats, ActivityData, SourceDistribution } from '../lib/api'
import { fetcher } from '../lib/swr-config'

// Dashboard stats hook with auto-refresh
export function useDashboardStats() {
  const { data, error, isLoading, mutate } = useSWR<DashboardStats>('/dashboard/stats', fetcher, {
    refreshInterval: 60000, // Refresh every minute
    revalidateOnFocus: true,
  })

  return {
    stats: data,
    isLoading,
    isError: error,
    mutate,
  }
}

// Dashboard activity hook
export function useDashboardActivity(days = 7) {
  const { data, error, isLoading, mutate } = useSWR<ActivityData[]>(
    `/dashboard/activity?days=${days}`,
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: false,
    }
  )

  return {
    activity: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Dashboard source distribution hook
export function useSourceDistribution() {
  const { data, error, isLoading, mutate } = useSWR<SourceDistribution[]>(
    '/dashboard/source-distribution',
    fetcher,
    {
      refreshInterval: 120000, // Refresh every 2 minutes
      revalidateOnFocus: false,
    }
  )

  return {
    distribution: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Combined dashboard data hook
export function useDashboardData() {
  const stats = useDashboardStats()
  const activity = useDashboardActivity()
  const distribution = useSourceDistribution()

  return {
    stats: stats.stats,
    activity: activity.activity,
    distribution: distribution.distribution,
    isLoading: stats.isLoading || activity.isLoading || distribution.isLoading,
    isError: stats.isError || activity.isError || distribution.isError,
    refresh: () => {
      stats.mutate()
      activity.mutate()
      distribution.mutate()
    },
  }
}

