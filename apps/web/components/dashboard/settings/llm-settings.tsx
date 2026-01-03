"use client"

import { useState, useEffect } from "react"
import { getProfile, updateProfile, User } from "../../../lib/api"
import { toast } from "sonner"
import { Save } from "lucide-react"
import { useI18n } from "../../../lib/i18n-context"

export function LLMSettings() {
    const { t } = useI18n()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [config, setConfig] = useState<any>({})

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getProfile()
                setUser(data)
                // Set config from user settings, default empty object if null
                setConfig(data.settings?.llm || {})
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
                llm: config
            }

            await updateProfile({ settings: newSettings })
            toast.success(t("settings.llm_saved"))

            // Update local state
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
                <h2 className="text-2xl font-bold mb-4">{t("settings.llm_title")}</h2>
                <p className="text-foreground/60 mb-6">{t("settings.llm_management_desc")}</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium block mb-2">{t("settings.openai_key")}</label>
                    <input
                        type="password"
                        value={config.openai_api_key || ""}
                        onChange={(e) => handleChange("openai_api_key", e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition"
                        placeholder="sk-..."
                    />
                </div>

                <div>
                    <label className="text-sm font-medium block mb-2">{t("settings.openai_base_url")}</label>
                    <input
                        type="text"
                        value={config.openai_base_url || ""}
                        onChange={(e) => handleChange("openai_base_url", e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition"
                        placeholder="https://api.openai.com/v1"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium block mb-2">{t("settings.default_model")}</label>
                    <input
                        type="text"
                        value={config.openai_model || ""}
                        onChange={(e) => handleChange("openai_model", e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition"
                        placeholder="gpt-4"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium block mb-2">{t("settings.anthropic_key")}</label>
                    <input
                        type="password"
                        value={config.anthropic_api_key || ""}
                        onChange={(e) => handleChange("anthropic_api_key", e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition"
                        placeholder="sk-ant-..."
                    />
                </div>

                <div>
                    <label className="text-sm font-medium block mb-2">{t("settings.gemini_key")}</label>
                    <input
                        type="password"
                        value={config.gemini_api_key || ""}
                        onChange={(e) => handleChange("gemini_api_key", e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition"
                    />
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
