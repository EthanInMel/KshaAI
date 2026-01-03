"use client"

import { useState, useEffect } from "react"
import { getProfile, updateProfile, User } from "../../../lib/api"
import { toast } from "sonner"
import { Save } from "lucide-react"
import { useI18n } from "../../../lib/i18n-context"

export function TwitterSettings() {
    const { t } = useI18n()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [config, setConfig] = useState<any>({})

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getProfile()
                setUser(data)
                // Set config from user settings
                setConfig(data.settings?.twitter || {})
            } catch (error) {
                toast.error(t("settings.failed_load"))
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    const handleSave = async () => {
        if (!user) return

        try {
            // Merge with existing settings
            const newSettings = {
                ...(user.settings || {}),
                twitter: config
            }

            await updateProfile({ settings: newSettings })
            toast.success(t("settings.twitter_saved"))
            setUser({ ...user, settings: newSettings })
        } catch (error) {
            toast.error(t("settings.failed_save"))
        }
    }

    const handleChange = (key: string, value: string) => {
        setConfig((prev: any) => ({ ...prev, [key]: value }))
    }

    if (loading) return <div className="h-64 animate-pulse bg-muted rounded-lg"></div>

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-4">{t("settings.twitter_title")}</h2>
                <p className="text-foreground/60 mb-6">{t("settings.twitter_desc")}</p>
            </div>

            <div className="text-sm bg-blue-500/10 text-blue-500 border border-blue-500/20 p-4 rounded-lg mb-6">
                <p>{t("settings.twitter_help")}</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium block mb-2">{t("settings.api_key")}</label>
                    <input
                        type="password"
                        value={config.api_key || ""}
                        onChange={(e) => handleChange("api_key", e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium block mb-2">{t("settings.api_secret")}</label>
                    <input
                        type="password"
                        value={config.api_secret || ""}
                        onChange={(e) => handleChange("api_secret", e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium block mb-2">{t("settings.access_token")}</label>
                    <input
                        type="password"
                        value={config.access_token || ""}
                        onChange={(e) => handleChange("access_token", e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium block mb-2">{t("settings.access_token_secret")}</label>
                    <input
                        type="password"
                        value={config.access_token_secret || ""}
                        onChange={(e) => handleChange("access_token_secret", e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium block mb-2">{t("settings.bearer_token")}</label>
                    <input
                        type="password"
                        value={config.bearer_token || ""}
                        onChange={(e) => handleChange("bearer_token", e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition"
                    />
                </div>

                <div className="border-t border-border pt-4 mt-4">
                    <h3 className="text-lg font-semibold mb-4">{t("settings.oauth2")}</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium block mb-2">{t("settings.client_id")}</label>
                            <input
                                type="text"
                                value={config.client_id || ""}
                                onChange={(e) => handleChange("client_id", e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium block mb-2">{t("settings.client_secret")}</label>
                            <input
                                type="password"
                                value={config.client_secret || ""}
                                onChange={(e) => handleChange("client_secret", e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-border">
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition font-medium"
                    >
                        <Save className="w-4 h-4" />
                        {t("settings.save_changes")}
                    </button>
                </div>
            </div>
        </div>
    )
}
