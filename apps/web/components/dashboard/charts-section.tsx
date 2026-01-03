"use client"

import { motion } from "framer-motion"
import { useI18n } from "../../lib/i18n-context"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts"
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react"

interface ChartsSectionProps {
  contentTrend: { date: string; count: number }[]
  sourceDistribution: { sourceType: string; count: number }[]
  loading: boolean
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

export function ChartsSection({ contentTrend, sourceDistribution, loading }: ChartsSectionProps) {
  const { t } = useI18n()

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[350px] rounded-2xl bg-card border border-border animate-pulse" />
        <div className="h-[350px] rounded-2xl bg-card border border-border animate-pulse" />
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow-xl">
          <p className="text-sm font-medium text-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color || entry.payload.fill }}>
              {entry.name || entry.dataKey}: <span className="font-semibold">{entry.value}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Content Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-card border border-border"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-violet-500/10">
            <TrendingUp className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t("dashboard.content_trend")}</h3>
            <p className="text-xs text-foreground/50">{t("dashboard.content_trend_desc")}</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={contentTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--foreground))"
              opacity={0.4}
              fontSize={12}
              tickFormatter={(date) => date.split('-').slice(1).join('/')}
              tickLine={false}
              axisLine={false}
            />
            <YAxis stroke="hsl(var(--foreground))" opacity={0.4} fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              name="Content"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Source Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-2xl bg-card border border-border"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-cyan-500/10">
            <PieChartIcon className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t("dashboard.source_distribution")}</h3>
            <p className="text-xs text-foreground/50">{t("dashboard.source_distribution_desc")}</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={sourceDistribution}
              dataKey="count"
              nameKey="sourceType"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
            >
              {(sourceDistribution || []).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {(sourceDistribution || []).map((item, index) => (
            <div key={item.sourceType} className="flex items-center gap-1.5 text-xs font-medium">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-foreground/70">{item.sourceType}</span>
              <span className="text-foreground/40">{item.count}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
