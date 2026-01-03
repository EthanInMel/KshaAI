"use client"

import { useI18n } from "../../../lib/i18n-context"
import { BacktestsList } from "../../../components/dashboard/backtests/backtests-list"
import { useState, useEffect } from "react"
import { Plus, Play } from "lucide-react"
import { getBacktests, createBacktest, getStreams, Backtest, Stream } from "../../../lib/api"
import { toast } from "sonner"

export default function BacktestsPage() {
  const { t } = useI18n()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [backtests, setBacktests] = useState<Backtest[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await getBacktests()
      setBacktests(data)
    } catch (error) {
      console.error("Failed to load backtests:", error)
      toast.error(t("backtests.failed_load"))
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
    toast.success(t("backtests.started_success"))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("backtests.title")}</h1>
          <p className="text-foreground/60 mt-2">{t("backtests.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition font-medium"
        >
          <Plus className="w-5 h-5" />
          {t("backtests.run_btn")}
        </button>
      </div>

      <BacktestsList backtests={backtests} loading={loading} onRefresh={loadData} />

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <CreateBacktestModal onClose={() => setShowCreateModal(false)} onSuccess={handleCreateSuccess} />
        </div>
      )}
    </div>
  )
}

function CreateBacktestModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const { t } = useI18n()
  const [streams, setStreams] = useState<Stream[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    streamId: "",
    name: "",
    startDate: "",
    endDate: "",
    description: "",
  })

  useEffect(() => {
    const loadStreams = async () => {
      try {
        const data = await getStreams()
        setStreams(data)
      } catch (error) {
        console.error("Failed to load streams:", error)
      }
    }
    loadStreams()

    // Set default dates
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 7)

    setFormData(prev => ({
      ...prev,
      startDate: start.toISOString().slice(0, 16),
      endDate: end.toISOString().slice(0, 16),
      name: t("backtests.default_name").replace("{date}", new Date().toLocaleDateString())
    }))
  }, [])

  const handleSubmit = async () => {
    if (!formData.streamId) {
      toast.error(t("backtests.select_stream_error"))
      return
    }

    try {
      setLoading(true)
      await createBacktest({
        streamId: formData.streamId,
        name: formData.name,
        description: formData.description,
        startTime: new Date(formData.startDate).toISOString(),
        endTime: new Date(formData.endDate).toISOString(),
      })
      onSuccess()
    } catch (error: any) {
      console.error("Failed to create backtest:", error)
      toast.error(error.message || t("backtests.failed_create"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4">
      <h2 className="text-2xl font-bold">{t("backtests.create_title")}</h2>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t("backtests.stream_label")}</label>
        <select
          value={formData.streamId}
          onChange={(e) => setFormData({ ...formData, streamId: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none transition"
        >
          <option value="">{t("backtests.select_stream")}</option>
          {streams.map((stream) => (
            <option key={stream.id} value={stream.id}>
              {stream.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t("backtests.name_label")}</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none transition"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("backtests.start_time")}</label>
          <input
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none transition text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("backtests.end_time")}</label>
          <input
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none transition text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t("backtests.desc_label")}</label>
        <textarea
          placeholder={t("backtests.desc_placeholder")}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none transition resize-none"
          rows={3}
        />
      </div>

      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-sm">
          <span className="font-semibold">{t("backtests.estimated_time")}</span> {t("backtests.estimated_desc")}
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted transition font-medium"
        >
          {t("common.cancel")}
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition font-medium flex items-center justify-center gap-2"
        >
          {loading ? <span className="loading loading-spinner loading-sm"></span> : <Play className="w-4 h-4" />}
          {t("backtests.run")}
        </button>
      </div>
    </div>
  )
}
