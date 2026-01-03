"use client"

import { useI18n } from "../../../lib/i18n-context"
import { StreamsList } from "../../../components/dashboard/streams/streams-list"
import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { getStreams, getAvailableSources, createStream, getLLMModels, Stream, AvailableSource, ModelInfo } from "../../../lib/api"
import { toast } from "sonner"
import AggregationConfigForm from "../../../components/stream/AggregationConfigForm"

const MODELS: Record<string, { value: string; label: string }[]> = {
  openai: [
    { value: 'gpt-5.2', label: 'GPT-5.2 (Latest)' },
    { value: 'gpt-5.1', label: 'GPT-5.1' },
    { value: 'gpt-5', label: 'GPT-5' },
    { value: 'gpt-4.1', label: 'GPT-4.1' },
    { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'o4-mini', label: 'o4 Mini' },
    { value: 'o3', label: 'o3' },
    { value: 'o3-mini', label: 'o3 Mini' },
    { value: 'o1', label: 'o1' },
    { value: 'o1-mini', label: 'o1 Mini' },
  ],
  anthropic: [
    { value: 'claude-opus-4.5-20251124', label: 'Claude Opus 4.5 (Latest)' },
    { value: 'claude-sonnet-4.5-20250929', label: 'Claude Sonnet 4.5' },
    { value: 'claude-haiku-4.5-20251015', label: 'Claude Haiku 4.5' },
    { value: 'claude-opus-4-20250523', label: 'Claude Opus 4' },
    { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
  ],
  google: [
    { value: 'gemini-3-pro', label: 'Gemini 3 Pro (Latest)' },
    { value: 'gemini-3-flash', label: 'Gemini 3 Flash' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-2.0-pro', label: 'Gemini 2.0 Pro' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  ],
  siliconflow: [
    { value: 'deepseek-ai/DeepSeek-V3.2', label: 'DeepSeek V3.2 (Latest)' },
    { value: 'deepseek-ai/DeepSeek-V3', label: 'DeepSeek V3' },
    { value: 'deepseek-ai/DeepSeek-R1-0528', label: 'DeepSeek R1 (0528)' },
    { value: 'Qwen/Qwen3-235B-A22B', label: 'Qwen3 235B' },
    { value: 'Qwen/Qwen3-Max', label: 'Qwen3 Max' },
    { value: 'Qwen/Qwen2.5-72B-Instruct', label: 'Qwen 2.5 72B' },
    { value: 'Qwen/Qwen2.5-7B-Instruct', label: 'Qwen 2.5 7B' },
    { value: 'THUDM/GLM-4.7', label: 'GLM-4.7' },
    { value: 'THUDM/GLM-4.5', label: 'GLM-4.5' },
    { value: 'meta-llama/Meta-Llama-3.1-70B-Instruct', label: 'Llama 3.1 70B' },
    { value: 'meta-llama/Meta-Llama-3.1-8B-Instruct', label: 'Llama 3.1 8B' },
  ],
  custom: [],
}


export default function StreamsPage() {
  const { t } = useI18n()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [streams, setStreams] = useState<Stream[]>([])
  const [sources, setSources] = useState<AvailableSource[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const [streamsData, sourcesData] = await Promise.all([
        getStreams(),
        getAvailableSources()
      ])
      setStreams(streamsData)
      setSources(sourcesData)
    } catch (error) {
      console.error("Failed to load data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateSuccess = () => {
    setShowCreateModal(false)
    loadData()
    toast.success("Stream created successfully")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("common.streams")}</h1>
          <p className="text-foreground/60 mt-2">{t("sources.subtitle").replace("data sources", "streams")}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition font-medium"
        >
          <Plus className="w-5 h-5" />
          {t("streams.create_submit")}
        </button>
      </div>

      <StreamsList streams={streams} loading={loading} onRefresh={loadData} />

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <CreateStreamModal
            sources={sources}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCreateSuccess}
          />
        </div>
      )}
    </div>
  )
}

function CreateStreamModal({
  sources,
  onClose,
  onSuccess
}: {
  sources: AvailableSource[]
  onClose: () => void
  onSuccess: () => void
}) {
  const { t } = useI18n()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingModels, setLoadingModels] = useState(false)
  const [siliconflowModels, setSiliconflowModels] = useState<{ value: string; label: string }[]>([])
  const [useCustomModel, setUseCustomModel] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    source_mode: "existing" as "existing" | "new",
    source_id: "",
    source_type: "rss",
    source_identifier: "",
    aggregation_config: {
      type: "realtime" as "realtime" | "digest",
      dailyReport: {
        enabled: false,
        time: "08:00",
        timezone: "Asia/Shanghai",
      },
      digest: {
        enabled: false,
        interval: "daily",
        time: "18:00",
      },
    },
    skipLlm: false,
    llmProvider: "openai",
    model: "gpt-4o-mini",
    temperature: 0.7,
    prompt: "",
  })

  // Store dynamically loaded models per provider
  const [dynamicModels, setDynamicModels] = useState<Record<string, { value: string; label: string }[]>>({})

  // Get models for current provider (prefer dynamic, fall back to static)
  const currentModels = dynamicModels[formData.llmProvider] || MODELS[formData.llmProvider] || []

  // Load models when provider changes
  useEffect(() => {
    const provider = formData.llmProvider
    // Skip if already loaded or is custom provider
    if (provider === 'custom' || dynamicModels[provider]) {
      return
    }

    setLoadingModels(true)
    getLLMModels(provider)
      .then(data => {
        const models = data.models || []
        if (models.length > 0) {
          const formattedModels = models.map((m: ModelInfo) => ({
            value: m.id,
            label: m.name
          }))
          setDynamicModels(prev => ({ ...prev, [provider]: formattedModels }))
          // Also update siliconflowModels for backwards compatibility
          if (provider === 'siliconflow') {
            setSiliconflowModels(formattedModels)
          }
          // Set first model as default if current model is not in list
          if (!models.find((m: ModelInfo) => m.id === formData.model)) {
            setFormData(prev => ({ ...prev, model: models[0].id }))
          }
        } else {
          // API returned empty, use static fallback
          setDynamicModels(prev => ({ ...prev, [provider]: MODELS[provider] || [] }))
        }
      })
      .catch(error => {
        console.error(`Failed to load ${provider} models:`, error)
        // Fall back to static MODELS list
        setDynamicModels(prev => ({ ...prev, [provider]: MODELS[provider] || [] }))
      })
      .finally(() => setLoadingModels(false))
  }, [formData.llmProvider])

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handlePrev = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const payload: any = {
        name: formData.name,
        aggregation_config: formData.aggregation_config,
      }

      // Only include LLM config if not skipping
      if (!formData.skipLlm) {
        payload.llm_config = {
          provider: formData.llmProvider,
          model: formData.model,
          temperature: formData.temperature,
        }
        payload.prompt_template = {
          template: formData.prompt,
        }
      } else {
        // Empty prompt signals backend to skip LLM processing
        payload.prompt_template = {
          template: "",
        }
      }

      if (formData.source_mode === "existing") {
        if (!formData.source_id) {
          toast.error("Please select a source")
          return
        }
        payload.source_id = formData.source_id
      } else {
        if (!formData.source_identifier) {
          toast.error("Please enter source identifier")
          return
        }
        payload.source_type = formData.source_type
        payload.source_identifier = formData.source_identifier
      }

      await createStream(payload)
      onSuccess()
    } catch (error: any) {
      console.error("Failed to create stream:", error)
      toast.error(error.message || "Failed to create stream")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{t("streams.create_title")}</h2>
        <div className="text-sm text-foreground/60">{t("streams.step_indicator").replace("{current}", step.toString()).replace("{total}", "3")}</div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${(step / 3) * 100}%` }}></div>
      </div>

      {/* Step 1: Basic Info & Source */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t("streams.stream_name")}</label>
            <input
              type="text"
              placeholder={t("streams.stream_name_placeholder")}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none transition mt-2"
            />
          </div>

          {/* Source Mode Selection */}
          <div>
            <label className="text-sm font-medium block mb-2">{t("dashboard.add_source")}</label>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, source_mode: "existing", source_id: "" })}
                className={`flex-1 px-4 py-2 rounded-lg transition font-medium ${formData.source_mode === "existing"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
                  }`}
              >
                {t("streams.select_existing")}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, source_mode: "new", source_identifier: "" })}
                className={`flex-1 px-4 py-2 rounded-lg transition font-medium ${formData.source_mode === "new"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
                  }`}
              >
                {t("streams.create_new")}
              </button>
            </div>

            {formData.source_mode === "existing" ? (
              <div className="space-y-3">
                <select
                  value={formData.source_id}
                  onChange={(e) => {
                    const selectedSource = sources.find(s => s.id === e.target.value)
                    setFormData({
                      ...formData,
                      source_id: e.target.value,
                      // Auto-populate prompt from marketplace source if available
                      prompt: selectedSource?.marketplace_info?.recommended_prompt || formData.prompt
                    })
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none transition"
                >
                  <option value="">{t("streams.select_source_placeholder")}</option>
                  {/* Own sources */}
                  <optgroup label={t("streams.your_sources")}>
                    {sources.filter(s => s.type !== 'market').map((source) => (
                      <option key={source.id} value={source.id}>
                        {source.type.toUpperCase()} - {source.identifier.substring(0, 50)}
                        {source.identifier.length > 50 && "..."}
                      </option>
                    ))}
                  </optgroup>
                  {/* Market sources from subscriptions */}
                  {sources.filter(s => s.type === 'market').length > 0 && (
                    <optgroup label={t("streams.subscribed_sources")}>
                      {sources.filter(s => s.type === 'market').map((source) => (
                        <option key={source.id} value={source.id}>
                          🛒 {source.marketplace_info?.name || source.identifier}
                          {source._count && ` (${source._count.contents} items)`}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                {/* Show marketplace source info if selected */}
                {formData.source_id && sources.find(s => s.id === formData.source_id)?.type === 'market' && (
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">📦</span>
                      <span className="font-medium text-primary">{t("streams.market_source")}</span>
                    </div>
                    <p className="text-sm text-foreground/70">
                      {sources.find(s => s.id === formData.source_id)?.marketplace_info?.description}
                    </p>
                    {sources.find(s => s.id === formData.source_id)?.marketplace_info?.recommended_prompt && (
                      <p className="text-xs text-foreground/50 mt-2">
                        {t("streams.recommended_prompt")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-foreground/80 block mb-1">{t("streams.source_type")}</label>
                  <select
                    value={formData.source_type}
                    onChange={(e) => setFormData({ ...formData, source_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none transition"
                  >
                    <option value="rss">RSS Feed</option>
                    <option value="newsnow">NewsNow</option>
                    <option value="x">X (Twitter)</option>
                    <option value="github">GitHub</option>
                    <option value="webhook">Webhook</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/80 block mb-1">{t("streams.identifier_url")}</label>
                  <input
                    type="text"
                    placeholder={formData.source_type === "rss" ? "https://example.com/feed.xml" : t("streams.identifier_placeholder")}
                    value={formData.source_identifier}
                    onChange={(e) => setFormData({ ...formData, source_identifier: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none transition"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Aggregation & Reports */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="mb-2">
            <h3 className="text-lg font-semibold">{t("streams.aggregation_reports_title")}</h3>
            <p className="text-sm text-foreground/60 mt-1">
              {t("streams.aggregation_reports_desc")}
            </p>
          </div>
          <AggregationConfigForm
            initialConfig={formData.aggregation_config}
            onChange={(config) => setFormData({ ...formData, aggregation_config: config })}
          />
        </div>
      )}

      {/* Step 3: LLM Configuration */}
      {step === 3 && (
        <div className="space-y-4">
          {/* Skip LLM Toggle */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{t("streams.skip_llm_title")}</h4>
                <p className="text-sm text-foreground/60 mt-1">
                  {t("streams.skip_llm_desc")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, skipLlm: !formData.skipLlm })}
                className={`relative w-12 h-6 rounded-full transition-colors ${formData.skipLlm ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.skipLlm ? 'translate-x-7' : 'translate-x-1'
                  }`} />
              </button>
            </div>
            {formData.skipLlm && (
              <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  ⚠️ {t("streams.skip_llm_warning")}
                </p>
              </div>
            )}
          </div>

          {/* LLM Settings - only show if not skipping */}
          {!formData.skipLlm && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{t("streams.provider")}</label>
                  <select
                    value={formData.llmProvider}
                    onChange={(e) => {
                      const provider = e.target.value
                      const models = MODELS[provider] || []
                      setFormData({
                        ...formData,
                        llmProvider: provider,
                        model: models[0]?.value || ''
                      })
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none transition mt-2"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="google">Google Gemini</option>
                    <option value="siliconflow">SiliconFlow</option>
                    <option value="custom">Custom (OpenAI Compatible)</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">{t("streams.model")}</label>
                    <button
                      type="button"
                      onClick={() => {
                        setUseCustomModel(!useCustomModel)
                        if (!useCustomModel) {
                          // Keep current model when switching to custom
                        }
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      {useCustomModel ? t("dashboard.select_preset") : t("dashboard.manual_entry")}
                    </button>
                  </div>
                  {useCustomModel || formData.llmProvider === 'custom' ? (
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder={t("streams.model_placeholder")}
                      className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none transition mt-2"
                    />
                  ) : (
                    <select
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      disabled={loadingModels}
                      className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none transition mt-2 disabled:opacity-50"
                    >
                      {loadingModels ? (
                        <option>{t("dashboard.loading_models")}</option>
                      ) : currentModels.length > 0 ? (
                        currentModels.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))
                      ) : (
                        <option>{t("dashboard.no_models")}</option>
                      )}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">{t("streams.temperature")} ({formData.temperature})</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                  className="w-full mt-2"
                />
                <div className="flex justify-between text-xs text-foreground/60 mt-1">
                  <span>{t("streams.temp_precise")}</span>
                  <span>{t("streams.temp_balanced")}</span>
                  <span>{t("streams.temp_creative")}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">{t("streams.prompt_template")}</label>
                <textarea
                  placeholder={t("streams.prompt_placeholder").replace("\\n", "\n")}
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none transition resize-none mt-2"
                  rows={6}
                />
                <p className="text-xs text-foreground/60 mt-1">{t("streams.prompt_help")}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        {step > 1 && (
          <button
            onClick={handlePrev}
            className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted transition font-medium"
          >
            {t("streams.prev_btn")}
          </button>
        )}
        {step < 3 ? (
          <button
            onClick={handleNext}
            className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition font-medium"
          >
            {t("streams.next_btn")}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition font-medium flex items-center justify-center gap-2"
          >
            {loading && <span className="loading loading-spinner loading-sm"></span>}
            {t("streams.create_submit")}
          </button>
        )}
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition font-medium"
        >
          {t("common.cancel")}
        </button>
      </div>
    </div >
  )
}
