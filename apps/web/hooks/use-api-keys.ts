import useSWR from 'swr'
import { ApiKey, createApiKey, revokeApiKey, deleteApiKey, getApiKeyUsage } from '../lib/api'
import { fetcher } from '../lib/swr-config'

// API keys list hook
export function useApiKeys() {
  const { data, error, isLoading, mutate } = useSWR<ApiKey[]>('/api-keys', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  })

  return {
    apiKeys: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Single API key hook
export function useApiKey(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<ApiKey>(
    id ? `/api-keys/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    apiKey: data,
    isLoading,
    isError: error,
    mutate,
  }
}

// API key usage stats hook
export function useApiKeyUsage(id: string | null, days = 7) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api-keys/${id}/usage?days=${days}` : null,
    fetcher,
    {
      refreshInterval: 60000,
    }
  )

  return {
    usage: data,
    isLoading,
    isError: error,
    mutate,
  }
}

// API key mutations
export function useApiKeyMutations() {
  const { mutate: globalMutate } = useSWR('/api-keys')

  const create = async (data: Parameters<typeof createApiKey>[0]) => {
    const newKey = await createApiKey(data)
    globalMutate()
    return newKey
  }

  const revoke = async (id: string) => {
    const updated = await revokeApiKey(id)
    globalMutate()
    return updated
  }

  const remove = async (id: string) => {
    await deleteApiKey(id)
    globalMutate()
  }

  return {
    createApiKey: create,
    revokeApiKey: revoke,
    deleteApiKey: remove,
  }
}

