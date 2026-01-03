"use client"

import { useState, useEffect } from "react"
import { getProfile, User } from "../../../lib/api"
import { toast } from "sonner"
import { useI18n } from "../../../lib/i18n-context"

export function ProfileSettings() {
  const { t } = useI18n()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile()
        setUser(data)
      } catch (error) {
        console.error("Failed to load profile:", error)
        toast.error(t("settings.failed_load"))
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  if (loading) {
    return <div className="h-64 animate-pulse bg-muted rounded-lg"></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">{t("settings.profile_info")}</h2>
        <p className="text-foreground/60 mb-6">{t("settings.profile_desc")}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-2">{t("settings.full_name")}</label>
          <input
            type="text"
            defaultValue={user?.full_name || ""}
            className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">{t("settings.email")}</label>
          <input
            type="email"
            defaultValue={user?.email || ""}
            disabled
            className="w-full px-4 py-2 rounded-lg bg-muted border border-border outline-none cursor-not-allowed opacity-70"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">{t("settings.role")}</label>
          <input
            type="text"
            defaultValue={user?.role || ""}
            disabled
            className="w-full px-4 py-2 rounded-lg bg-muted border border-border outline-none cursor-not-allowed opacity-70 capitalize"
          />
        </div>

        <div className="pt-4 border-t border-border">
          <button className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition font-medium">
            {t("settings.save_changes")}
          </button>
        </div>
      </div>

      {/* Password Section */}
      <div className="space-y-4 pt-6 border-t border-border">
        <h3 className="text-lg font-bold">{t("settings.change_password")}</h3>
        <div>
          <label className="text-sm font-medium block mb-2">{t("settings.current_password")}</label>
          <input
            type="password"
            className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-2">{t("settings.new_password")}</label>
          <input
            type="password"
            className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-2">{t("settings.confirm_password")}</label>
          <input
            type="password"
            className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition"
          />
        </div>
        <button className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition font-medium">
          {t("settings.update_password")}
        </button>
      </div>
    </div>
  )
}
