"use client"

import { useI18n } from "../../lib/i18n-context"
import { X, Sparkles, ArrowRight, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function WelcomeBanner() {
  const { t } = useI18n()
  const [visible, setVisible] = useState(true)
  const [userName, setUserName] = useState("User")

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      try {
        const parsed = JSON.parse(user)
        setUserName(parsed.fullName || parsed.email?.split("@")[0] || "User")
      } catch {
        // ignore
      }
    }
  }, [])

  if (!visible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative p-6 rounded-2xl overflow-hidden group"
      >
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 animate-pulse" />
        <div className="absolute inset-[1px] rounded-2xl bg-card/95 backdrop-blur-xl" />

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Icon container */}
            <motion.div
              className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </motion.div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {t("dashboard.welcome")}, <span className="text-emerald-400">{userName}</span>!
              </h2>
              <p className="text-foreground/60 mt-1 text-sm">
                You have <span className="text-cyan-400 font-medium">3 active streams</span> processing data in
                real-time
              </p>

              {/* Quick stats */}
              <div className="flex items-center gap-4 mt-3">
                <motion.a
                  href="/dashboard/streams"
                  className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors group/link"
                  whileHover={{ x: 4 }}
                >
                  <Zap className="w-4 h-4" />
                  <span>View Streams</span>
                  <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                </motion.a>
              </div>
            </div>
          </div>

          <motion.button
            onClick={() => setVisible(false)}
            className="p-2 rounded-lg hover:bg-foreground/5 text-foreground/40 hover:text-foreground/60 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
