"use client"

import { TrendingUp, CheckCircle, Clock, AlertCircle, MoreVertical } from "lucide-react"
import { Backtest } from "../../../lib/api"
import { useRouter } from "next/navigation"

interface BacktestsListProps {
  backtests: Backtest[]
  loading: boolean
  onRefresh: () => void
}

import { useI18n } from "../../../lib/i18n-context"

export function BacktestsList({ backtests, loading, onRefresh }: BacktestsListProps) {
  const router = useRouter()
  const { t } = useI18n()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "RUNNING":
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />
      case "FAILED":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500/20 text-green-700 dark:text-green-400"
      case "RUNNING":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400"
      case "FAILED":
        return "bg-red-500/20 text-red-700 dark:text-red-400"
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-400"
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 bg-card border border-border rounded-xl animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {backtests.length === 0 ? (
        <div className="py-12 text-center bg-card border border-border rounded-xl">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold mb-2">{t("backtests.no_backtests")}</h3>
          <p className="text-foreground/60">{t("backtests.no_backtests_desc")}</p>
        </div>
      ) : (
        backtests.map((backtest) => (
          <div
            key={backtest.id}
            className="p-6 rounded-xl bg-card border border-border hover:border-primary transition cursor-pointer"
            onClick={() => router.push(`/dashboard/backtests/${backtest.id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="mt-1">{getStatusIcon(backtest.status)}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{backtest.name}</h3>
                  <p className="text-sm text-foreground/60">{backtest.stream?.name || t("backtests.unknown_stream")}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-muted rounded-lg transition">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 rounded-lg bg-background">
              <div>
                <div className="text-xs text-foreground/60">{t("backtests.date_range")}</div>
                <div className="font-semibold text-sm">
                  {new Date(backtest.range_start).toLocaleDateString()} - {new Date(backtest.range_end).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground/60">{t("backtests.status")}</div>
                <div
                  className={`font-semibold capitalize text-sm px-2 py-1 rounded w-fit ${getStatusColor(backtest.status)}`}
                >
                  {backtest.status}
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground/60">{t("backtests.total_items")}</div>
                <div className="font-semibold text-sm">{backtest.total_items}</div>
              </div>
              <div>
                <div className="text-xs text-foreground/60">{t("backtests.processed")}</div>
                <div className="font-semibold text-sm">{backtest.processed_items}</div>
              </div>
            </div>

            {backtest.status === "COMPLETED" && (
              <button className="w-full px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition font-medium text-sm">
                {t("backtests.view_report")}
              </button>
            )}
          </div>
        ))
      )}
    </div>
  )
}
