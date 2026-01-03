"use client"

import { useI18n } from "../../../lib/i18n-context"
import { SettingsTabs } from "../../../components/dashboard/settings/settings-tabs"
import { motion } from "framer-motion"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  const { t } = useI18n()

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20">
          <Settings className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("common.settings")}</h1>
          <p className="text-foreground/60 mt-1">{t("common.settings_desc")}</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <SettingsTabs />
      </motion.div>
    </div>
  )
}
