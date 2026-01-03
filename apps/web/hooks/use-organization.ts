import useSWR from 'swr'
import { 
  Organization, 
  OrganizationLLMConfig,
  updateOrganization, 
  regenerateApiKey,
  updateOrganizationLLMConfig,
  deleteOrganizationLLMConfig,
} from '../lib/api'
import { fetcher } from '../lib/swr-config'

// Organization hook
export function useOrganization() {
  const { data, error, isLoading, mutate } = useSWR<Organization>(
    '/organization/current',
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    organization: data,
    isLoading,
    isError: error,
    mutate,
  }
}

// Organization LLM config hook
export function useOrganizationLLMConfig() {
  const { data, error, isLoading, mutate } = useSWR<OrganizationLLMConfig>(
    '/organization/llm-config',
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    config: data,
    isLoading,
    isError: error,
    mutate,
  }
}

// Organization mutations
export function useOrganizationMutations() {
  const { mutate: mutateOrg } = useSWR('/organization/current')
  const { mutate: mutateLLM } = useSWR('/organization/llm-config')

  const update = async (data: Parameters<typeof updateOrganization>[0]) => {
    const updated = await updateOrganization(data)
    mutateOrg()
    return updated
  }

  const regenerateKey = async () => {
    const updated = await regenerateApiKey()
    mutateOrg()
    return updated
  }

  const updateLLMConfig = async (provider: string, apiKey: string) => {
    const updated = await updateOrganizationLLMConfig(provider, apiKey)
    mutateLLM()
    return updated
  }

  const deleteLLMConfig = async (provider: string) => {
    await deleteOrganizationLLMConfig(provider)
    mutateLLM()
  }

  return {
    updateOrganization: update,
    regenerateApiKey: regenerateKey,
    updateLLMConfig,
    deleteLLMConfig,
  }
}

