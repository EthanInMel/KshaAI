import useSWR from 'swr'
import { Source, createSource, updateSource, deleteSource } from '../lib/api'
import { fetcher } from '../lib/swr-config'

// Sources list hook with caching
export function useSources() {
  const { data, error, isLoading, mutate } = useSWR<Source[]>('/source', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  })

  return {
    sources: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Single source hook
export function useSource(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Source>(
    id ? `/source/${id}` : null,
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

// Source mutations with optimistic updates
export function useSourceMutations() {
  const { mutate: globalMutate } = useSWR('/source')

  const create = async (data: Parameters<typeof createSource>[0]) => {
    const newSource = await createSource(data)
    globalMutate()
    return newSource
  }

  const update = async (id: string, data: Partial<Source>) => {
    const updated = await updateSource(id, data)
    globalMutate()
    return updated
  }

  const remove = async (id: string) => {
    await deleteSource(id)
    globalMutate()
  }

  return {
    createSource: create,
    updateSource: update,
    deleteSource: remove,
  }
}

