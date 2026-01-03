import useSWR from 'swr'
import { User, inviteUser, updateUserRole, toggleUserActive, deleteUser } from '../lib/api'
import { fetcher } from '../lib/swr-config'

// Users list hook
export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR<User[]>('/user', fetcher, {
    revalidateOnFocus: false,
  })

  return {
    users: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Single user hook
export function useUser(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<User>(
    id ? `/user/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    user: data,
    isLoading,
    isError: error,
    mutate,
  }
}

// User mutations
export function useUserMutations() {
  const { mutate: globalMutate } = useSWR('/user')

  const invite = async (data: Parameters<typeof inviteUser>[0]) => {
    const result = await inviteUser(data)
    globalMutate()
    return result
  }

  const updateRole = async (id: string, role: string) => {
    const updated = await updateUserRole(id, role)
    globalMutate()
    return updated
  }

  const toggleActive = async (id: string) => {
    const updated = await toggleUserActive(id)
    globalMutate()
    return updated
  }

  const remove = async (id: string) => {
    await deleteUser(id)
    globalMutate()
  }

  return {
    inviteUser: invite,
    updateRole,
    toggleActive,
    deleteUser: remove,
  }
}

