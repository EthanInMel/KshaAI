import useSWR from 'swr'
import { Backtest, BacktestResult, createBacktest, getBacktestResults } from '../lib/api'
import { fetcher } from '../lib/swr-config'

// Backtests list hook
export function useBacktests() {
  const { data, error, isLoading, mutate } = useSWR<Backtest[]>('/backtest', fetcher, {
    revalidateOnFocus: false,
  })

  return {
    backtests: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Stream backtests hook
export function useStreamBacktests(streamId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Backtest[]>(
    streamId ? `/backtest/stream/${streamId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    backtests: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Single backtest hook with auto-refresh for running tests
export function useBacktest(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Backtest>(
    id ? `/backtest/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: (data) => {
        // Auto-refresh every 2 seconds if backtest is running
        if (data?.status === 'RUNNING' || data?.status === 'PENDING') {
          return 2000
        }
        return 0
      },
    }
  )

  return {
    backtest: data,
    isLoading,
    isError: error,
    mutate,
  }
}

// Backtest results hook with pagination
export function useBacktestResults(id: string | null, page = 1, limit = 50) {
  const { data, error, isLoading, mutate } = useSWR<{ data: BacktestResult[]; total: number }>(
    id ? `/backtest/${id}/results?page=${page}&limit=${limit}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    results: data?.data || [],
    total: data?.total || 0,
    isLoading,
    isError: error,
    mutate,
  }
}

// Backtest mutations
export function useBacktestMutations() {
  const { mutate: globalMutate } = useSWR('/backtest')

  const create = async (data: Parameters<typeof createBacktest>[0]) => {
    const newBacktest = await createBacktest(data)
    globalMutate()
    return newBacktest
  }

  return {
    createBacktest: create,
  }
}

