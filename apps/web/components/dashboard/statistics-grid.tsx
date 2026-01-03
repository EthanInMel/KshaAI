"use client"

import { motion } from "framer-motion"
import { useI18n } from "../../lib/i18n-context"
import { TrendingUp, Zap, Activity, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react"
import type { DashboardStats } from "../../lib/api"

interface StatisticsGridProps {
  stats: DashboardStats | null
  loading: boolean
}

export function StatisticsGrid({ stats, loading }: StatisticsGridProps) {
  const { t } = useI18n()

  const statsList = [
    {
      label: t("dashboard.total_sources"),
      value: stats?.totalSources.toString() || "0",
      icon: TrendingUp,
      trend: "+12%",
      trendUp: true,
      gradient: "from-emerald-500/20 to-emerald-500/5",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
      borderColor: "group-hover:border-emerald-500/50",
    },
    {
      label: t("dashboard.total_streams"),
      value: stats?.totalStreams.toString() || "0",
      icon: Zap,
      trend: "+8%",
      trendUp: true,
      gradient: "from-cyan-500/20 to-cyan-500/5",
      iconBg: "bg-cyan-500/10",
      iconColor: "text-cyan-400",
      borderColor: "group-hover:border-cyan-500/50",
    },
    {
      label: t("dashboard.active_streams"),
      value: stats?.activeStreams.toString() || "0",
      icon: Activity,
      trend: "+24%",
      trendUp: true,
      gradient: "from-violet-500/20 to-violet-500/5",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-400",
      borderColor: "group-hover:border-violet-500/50",
    },
    {
      label: t("dashboard.today_llm"),
      value: stats?.todayLlmCalls.toString() || "0",
      icon: BarChart3,
      trend: "-3%",
      trendUp: false,
      gradient: "from-amber-500/20 to-amber-500/5",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
      borderColor: "group-hover:border-amber-500/50",
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="relative p-6 rounded-2xl bg-card border border-border overflow-hidden">
            <div className="animate-pulse space-y-4">
              <div className="flex justify-between">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-10 w-10 bg-muted rounded-xl" />
              </div>
              <div className="h-8 bg-muted rounded w-16" />
              <div className="h-3 bg-muted rounded w-12" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {statsList.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`group relative p-6 rounded-2xl bg-card border border-border ${stat.borderColor} transition-all duration-300 cursor-pointer overflow-hidden`}
          >
            {/* Gradient background */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />

            {/* Glow effect */}
            <div
              className={`absolute -top-24 -right-24 w-48 h-48 ${stat.iconBg} rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`}
            />

            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm text-foreground/60 font-medium">{stat.label}</p>
                <motion.div
                  className={`p-2.5 rounded-xl ${stat.iconBg} border border-white/5`}
                  whileHover={{ rotate: 12, scale: 1.1 }}
                >
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </motion.div>
              </div>

              <motion.p
                className="text-3xl font-bold tracking-tight"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 + 0.2 }}
              >
                {stat.value}
              </motion.p>

              {/* Trend indicator */}
              <div
                className={`flex items-center gap-1 mt-2 text-xs font-medium ${stat.trendUp ? "text-emerald-400" : "text-red-400"}`}
              >
                {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>{stat.trend}</span>
                <span className="text-foreground/40 ml-1">{t("dashboard.vs_last_week")}</span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
