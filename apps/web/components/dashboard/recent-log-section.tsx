"use client"

import { motion } from "framer-motion"
import { Activity } from "lucide-react"
import { useI18n } from "../../lib/i18n-context"

interface Log {
    type: string
    message: string
    timestamp: string
    streamName?: string
}

interface RecentLogSectionProps {
    logs: Log[]
}

export function RecentLogSection({ logs }: RecentLogSectionProps) {
    const { t } = useI18n()
    if (!logs?.length) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-card border border-border mt-6"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <Activity className="w-5 h-5 text-violet-500" />
                </div>
                <h3 className="text-lg font-bold">{t("dashboard.recent_logs")}</h3>
            </div>

            <div className="space-y-3">
                {logs.slice(0, 10).map((activity, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition border border-transparent hover:border-border"
                    >
                        <div className={`w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 ${activity.type === 'error' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                            activity.type === 'success' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' :
                                activity.type === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                                    'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                            }`} />

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground/90">{activity.message}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                                {activity.streamName && (
                                    <span className="text-xs px-2 py-0.5 rounded-md bg-background border border-border text-foreground/60">
                                        {activity.streamName}
                                    </span>
                                )}
                                <span className="text-xs text-foreground/40">
                                    {new Date(activity.timestamp).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}
