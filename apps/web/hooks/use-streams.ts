import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { Stream, createStream, updateStream, deleteStream, toggleStreamStatus, stopStream } from '../lib/api'
import { fetcher } from '../lib/swr-config'

// Streams list hook with caching
export function useStreams() {
  const { data, error, isLoading, mutate } = useSWR<Stream[]>('/stream', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  })

  return {
    streams: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Single stream hook
export function useStream(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Stream>(
    id ? `/stream/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    stream: data,
    isLoading,
    isError: error,
    mutate,
  }
}

// Stream mutations with optimistic updates
export function useStreamMutations() {
  const { mutate: globalMutate } = useSWR('/stream')

  const create = async (data: Parameters<typeof createStream>[0]) => {
    const newStream = await createStream(data)
    // Optimistically update the cache
    globalMutate()
    return newStream
  }

  const update = async (id: string, data: Partial<Stream>) => {
    const updated = await updateStream(id, data)
    globalMutate()
    return updated
  }

  const remove = async (id: string) => {
    await deleteStream(id)
    globalMutate()
  }

  const toggle = async (id: string) => {
    const updated = await toggleStreamStatus(id)
    globalMutate()
    return updated
  }

  const stop = async (id: string) => {
    const updated = await stopStream(id)
    globalMutate()
    return updated
  }

  return {
    createStream: create,
    updateStream: update,
    deleteStream: remove,
    toggleStatus: toggle,
    stopStream: stop,
  }
}

// Stream content stats hook
export function useStreamStats(streamId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    streamId ? `/stream/${streamId}/stats` : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  )

  return {
    stats: data,
    isLoading,
    isError: error,
    mutate,
  }
}

// Stream LLM outputs hook with pagination
export function useStreamOutputs(streamId: string | null, limit = 20, offset = 0) {
  const { data, error, isLoading, mutate } = useSWR(
    streamId ? `/stream/${streamId}/llm-outputs?limit=${limit}&offset=${offset}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    outputs: data?.data || [],
    total: data?.total || 0,
    isLoading,
    isError: error,
    mutate,
  }
}

