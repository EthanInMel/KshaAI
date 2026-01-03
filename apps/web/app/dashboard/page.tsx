"use client"

import { motion } from "framer-motion"
import { useI18n } from "../../lib/i18n-context"
import { StatisticsGrid } from "../../components/dashboard/statistics-grid"
import { ChartsSection } from "../../components/dashboard/charts-section"
import { RecentLogSection } from "../../components/dashboard/recent-log-section"
import { useDataOverview } from "../../hooks/use-analytics"

export default function DashboardPage() {
  const { t } = useI18n()
  const { overview, isLoading } = useDataOverview(7)

  // Map DataOverview to DashboardStats for grid
  const statsForGrid = overview ? {
    totalSources: overview.totalSources,
    totalStreams: overview.totalStreams || 0,
    activeStreams: overview.activeStreams,
    totalContents: overview.totalContent,
    todayContent: overview.todayContent || 0,
    todayLlmCalls: overview.todayLlmCalls || 0
  } : null

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
            {t("dashboard.welcome")}
          </h1>
          <p className="text-foreground/60 mt-2">
            {t("dashboard.welcome_desc")}
          </p>
        </motion.div>
      </div>

      {/* Statistics Grid */}
      <StatisticsGrid stats={statsForGrid} loading={isLoading} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Charts Area */}
        <div className="xl:col-span-3 space-y-6">
          <ChartsSection
            contentTrend={overview?.contentByDay || []}
            sourceDistribution={overview?.contentBySource || []}
            loading={isLoading}
          />
        </div>
      </div>

      {/* Recent Logs */}
      <div className="grid grid-cols-1">
        <RecentLogSection logs={overview?.recentActivity || []} />
      </div>
    </div>
  )
}
