"use client"

import { useI18n } from "../../../lib/i18n-context"
import { useState } from "react"
import { ProfileSettings } from "./profile-settings"
import { LLMSettings } from "./llm-settings"
import { NotificationSettings } from "./notification-settings"
import { TwitterSettings } from "./twitter-settings"
import { motion, AnimatePresence } from "framer-motion"
import { User, Brain, Twitter, Bell } from "lucide-react"

export function SettingsTabs() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState("profile")

  const tabs = [
    { id: "profile", label: t("settings.profile"), icon: User, component: ProfileSettings },
    { id: "notifications", label: t("settings.notifications"), icon: Bell, component: NotificationSettings },
    { id: "llm", label: t("settings.llm_config"), icon: Brain, component: LLMSettings },
    { id: "twitter", label: t("settings.twitter_api"), icon: Twitter, component: TwitterSettings },
  ]

  const activeTabData = tabs.find((t) => t.id === activeTab)
  const ActiveComponent = activeTabData?.component || ProfileSettings

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Tab Navigation */}
      <div className="lg:col-span-1">
        <div className="p-2 rounded-2xl bg-card border border-border">
          <nav className="space-y-1">
            {tabs.map((tab, idx) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all ${isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-foreground/60 hover:text-foreground hover:bg-muted border border-transparent"
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-foreground/40"}`} />
                  <span className="text-sm">{tab.label}</span>
                </motion.button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="lg:col-span-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
