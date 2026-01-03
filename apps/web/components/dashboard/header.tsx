"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useI18n } from "../../lib/i18n-context"
import { useAuth } from "../../lib/use-auth"
import { ThemeSwitcher } from "../theme-switcher"
import { LanguageSwitcher } from "../language-switcher"
import { Bell, User, LogOut, Settings, ChevronDown } from "lucide-react"
import { useState } from "react"

export function DashboardHeader() {
  const { t } = useI18n()
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-20"
    >
      <div className="h-full px-4 md:px-6 flex items-center justify-end gap-4">
        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <motion.button
            className="relative p-2.5 rounded-xl hover:bg-muted transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
          </motion.button>

          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          <ThemeSwitcher />

          <div className="relative ml-2">
            <motion.button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-muted transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium leading-tight">{user?.full_name || "User"}</div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${showUserMenu ? "rotate-180" : ""}`}
              />
            </motion.button>

            <AnimatePresence>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-40"
                  >
                    <div className="p-4 border-b border-border">
                      <div className="font-medium">{user?.full_name || "User"}</div>
                      <div className="text-sm text-muted-foreground truncate">{user?.email}</div>
                      <div className="mt-2 inline-flex px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">
                        {user?.role}
                      </div>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          window.location.href = "/dashboard/settings"
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition flex items-center gap-3"
                      >
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        {t("common.settings")}
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          logout()
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition flex items-center gap-3 text-destructive"
                      >
                        <LogOut className="w-4 h-4" />
                        {t("common.logout")}
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

