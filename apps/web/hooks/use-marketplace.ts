import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import { 
  MarketplaceSource, 
  MarketplaceSubscription,
  createMarketplaceSource,
  subscribeToMarketplaceSource,
  unsubscribeFromMarketplaceSource,
} from '../lib/api'
import { fetcher } from '../lib/swr-config'

// Marketplace sources with infinite scroll support
export function useMarketplaceSources(params?: {
  category?: string
  query?: string
  limit?: number
}) {
  const limit = params?.limit || 20

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.data?.length) return null
    
    const queryParams = new URLSearchParams()
    queryParams.append('page', (pageIndex + 1).toString())
    queryParams.append('limit', limit.toString())
    if (params?.category) queryParams.append('category', params.category)
    if (params?.query) queryParams.append('query', params.query)
    
    return `/marketplace?${queryParams.toString()}`
  }

  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite(
    getKey,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateFirstPage: false,
    }
  )

  const sources = data ? data.flatMap(page => page.data || []) : []
  const total = data?.[0]?.total || 0
  const isLoadingMore = size > 0 && data && typeof data[size - 1] === 'undefined'
  const isEmpty = data?.[0]?.data?.length === 0
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data?.length < limit)

  return {
    sources: sources as MarketplaceSource[],
    total,
    isLoading: !error && !data,
    isLoadingMore,
    isReachingEnd,
    isError: error,
    loadMore: () => setSize(size + 1),
    mutate,
  }
}

// Single marketplace source
export function useMarketplaceSource(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<MarketplaceSource>(
    id ? `/marketplace/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    source: data,
    isLoading,
    isError: error,
    mutate,
  }
}

// My marketplace subscriptions
export function useMyMarketplaceSubscriptions() {
  const { data, error, isLoading, mutate } = useSWR<MarketplaceSubscription[]>(
    '/marketplace/subscriptions',
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    subscriptions: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// My published sources
export function useMyPublishedSources() {
  const { data, error, isLoading, mutate } = useSWR<MarketplaceSource[]>(
    '/marketplace/my-sources',
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    sources: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Marketplace mutations
export function useMarketplaceMutations() {
  const { mutate: mutateMarketplace } = useSWR('/marketplace')
  const { mutate: mutateSubscriptions } = useSWR('/marketplace/subscriptions')
  const { mutate: mutateMySources } = useSWR('/marketplace/my-sources')

  const publish = async (data: Parameters<typeof createMarketplaceSource>[0]) => {
    const newSource = await createMarketplaceSource(data)
    mutateMarketplace()
    mutateMySources()
    return newSource
  }

  const subscribe = async (id: string) => {
    const subscription = await subscribeToMarketplaceSource(id)
    mutateMarketplace()
    mutateSubscriptions()
    return subscription
  }

  const unsubscribe = async (id: string) => {
    await unsubscribeFromMarketplaceSource(id)
    mutateMarketplace()
    mutateSubscriptions()
  }

  return {
    publishSource: publish,
    subscribe,
    unsubscribe,
  }
}

