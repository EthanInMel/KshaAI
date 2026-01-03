"use client"

import { useState, useEffect } from "react"
import {
    getNotificationChannels,
    createNotificationChannel,
    updateNotificationChannel,
    deleteNotificationChannel,
    NotificationChannel,
    ChannelType
} from "../../../lib/api"
import { toast } from "sonner"
import { Plus, Trash2, Edit2, Save, X, MessageCircle, Bell, Hash, Globe, Star } from "lucide-react"
import { useI18n } from "../../../lib/i18n-context"

const CHANNEL_TYPES: { type: ChannelType; nameKey: string; icon: React.ReactNode; color: string; fields: { key: string; labelKey: string; placeholder: string; type: string }[] }[] = [
    {
        type: 'telegram',
        nameKey: 'telegram',
        icon: <MessageCircle className="w-5 h-5" />,
        color: 'text-blue-500 bg-blue-500/10',
        fields: [
            { key: 'bot_token', labelKey: 'bot_token', placeholder: '123456789:ABCdef...', type: 'password' },
            { key: 'chat_id', labelKey: 'chat_id', placeholder: '-100...', type: 'text' },
        ]
    },
    {
        type: 'discord',
        nameKey: 'discord',
        icon: <Bell className="w-5 h-5" />,
        color: 'text-indigo-500 bg-indigo-500/10',
        fields: [
            { key: 'webhook_url', labelKey: 'webhook_url', placeholder: 'https://discord.com/api/webhooks/...', type: 'password' },
        ]
    },
    {
        type: 'slack',
        nameKey: 'slack',
        icon: <Hash className="w-5 h-5" />,
        color: 'text-purple-500 bg-purple-500/10',
        fields: [
            { key: 'webhook_url', labelKey: 'webhook_url', placeholder: 'https://hooks.slack.com/services/...', type: 'password' },
        ]
    },
    {
        type: 'webhook',
        nameKey: 'webhook',
        icon: <Globe className="w-5 h-5" />,
        color: 'text-gray-500 bg-gray-500/10',
        fields: [
            { key: 'webhook_url', labelKey: 'webhook_url', placeholder: 'https://your-api.com/webhook', type: 'password' },
        ]
    },
]

export function NotificationSettings() {
    const { t } = useI18n()
    const [channels, setChannels] = useState<NotificationChannel[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingChannel, setEditingChannel] = useState<NotificationChannel | null>(null)

    useEffect(() => {
        loadChannels()
    }, [])

    const loadChannels = async () => {
        try {
            const data = await getNotificationChannels()
            setChannels(data)
        } catch (error) {
            toast.error(t("settings.failed_load"))
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm(t("settings.confirm_delete"))) return
        try {
            await deleteNotificationChannel(id)
            toast.success(t("settings.channel_deleted"))
            loadChannels()
        } catch (error) {
            toast.error(t("settings.failed_save"))
        }
    }

    const handleSetDefault = async (channel: NotificationChannel) => {
        try {
            await updateNotificationChannel(channel.id, { is_default: true })
            toast.success(t("settings.set_default_success"))
            loadChannels()
        } catch (error) {
            toast.error(t("settings.failed_save"))
        }
    }

    if (loading) return <div className="h-64 animate-pulse bg-muted rounded-lg"></div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">{t("settings.notifications_title")}</h2>
                    <p className="text-foreground/60 mt-1">{t("settings.notifications_desc")}</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition font-medium"
                >
                    <Plus className="w-4 h-4" />
                    {t("settings.add_channel")}
                </button>
            </div>

            {/* Channels List */}
            {channels.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
                    <Bell className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t("settings.no_channels")}</h3>
                    <p className="text-foreground/60 mb-4">{t("settings.notifications_desc")}</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
                    >
                        <Plus className="w-4 h-4" />
                        {t("settings.add_channel")}
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {channels.map((channel) => {
                        const typeInfo = CHANNEL_TYPES.find(t => t.type === channel.type)
                        return (
                            <div
                                key={channel.id}
                                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${typeInfo?.color || 'bg-muted'}`}>
                                        {typeInfo?.icon}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{channel.name}</span>
                                            {channel.is_default && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                                                    <Star className="w-3 h-3" />
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm text-foreground/60">{typeInfo ? t(`settings.${typeInfo.nameKey}`) : channel.type}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!channel.is_default && (
                                        <button
                                            onClick={() => handleSetDefault(channel)}
                                            className="p-2 rounded-lg hover:bg-muted transition text-foreground/60 hover:text-primary"
                                            title={t("settings.default_channel")}
                                        >
                                            <Star className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setEditingChannel(channel)}
                                        className="p-2 rounded-lg hover:bg-muted transition text-foreground/60 hover:text-foreground"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(channel.id)}
                                        className="p-2 rounded-lg hover:bg-red-500/10 transition text-foreground/60 hover:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            {(showAddModal || editingChannel) && (
                <ChannelModal
                    channel={editingChannel}
                    onClose={() => {
                        setShowAddModal(false)
                        setEditingChannel(null)
                    }}
                    onSuccess={() => {
                        setShowAddModal(false)
                        setEditingChannel(null)
                        loadChannels()
                    }}
                />
            )}
        </div>
    )
}

function ChannelModal({
    channel,
    onClose,
    onSuccess
}: {
    channel: NotificationChannel | null
    onClose: () => void
    onSuccess: () => void
}) {
    const { t } = useI18n()
    const [selectedType, setSelectedType] = useState<ChannelType>(channel?.type || 'telegram')
    const [name, setName] = useState(channel?.name || '')
    const [config, setConfig] = useState<Record<string, string>>(channel?.config || {})
    const [isDefault, setIsDefault] = useState(channel?.is_default || false)
    const [saving, setSaving] = useState(false)

    const typeInfo = CHANNEL_TYPES.find(t => t.type === selectedType)

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error(t("settings.name_required"))
            return
        }

        setSaving(true)
        try {
            if (channel) {
                await updateNotificationChannel(channel.id, { name, config, is_default: isDefault })
                toast.success(t("settings.channel_updated"))
            } else {
                await createNotificationChannel({ name, type: selectedType, config, is_default: isDefault })
                toast.success(t("settings.channel_created"))
            }
            onSuccess()
        } catch (error) {
            toast.error(t("settings.failed_save"))
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">{channel ? t("settings.edit_channel") : t("settings.add_channel")}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Channel Type */}
                    {!channel && (
                        <div>
                            <label className="text-sm font-medium block mb-2">{t("settings.channel_type")}</label>
                            <div className="grid grid-cols-2 gap-2">
                                {CHANNEL_TYPES.map((type) => (
                                    <button
                                        key={type.type}
                                        onClick={() => {
                                            setSelectedType(type.type)
                                            setConfig({})
                                        }}
                                        className={`flex items-center gap-3 p-3 rounded-lg border transition ${selectedType === type.type
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg ${type.color}`}>
                                            {type.icon}
                                        </div>
                                        <span className="font-medium">{t(`settings.${type.nameKey}`)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="text-sm font-medium block mb-2">{t("settings.name")}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition"
                            placeholder="e.g., My Telegram Bot"
                        />
                    </div>

                    {/* Config Fields */}
                    {typeInfo?.fields.map((field) => (
                        <div key={field.key}>
                            <label className="text-sm font-medium block mb-2">{t(`settings.${field.labelKey}`)}</label>
                            <input
                                type={field.type}
                                value={config[field.key] || ''}
                                onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition"
                                placeholder={field.placeholder}
                            />
                        </div>
                    ))}

                    {/* Default Toggle */}
                    <label className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div>
                            <div className="font-medium">{t("settings.default_channel")}</div>
                            <div className="text-sm text-foreground/60">{t("settings.default_help")}</div>
                        </div>
                        <input
                            type="checkbox"
                            checked={isDefault}
                            onChange={(e) => setIsDefault(e.target.checked)}
                            className="w-5 h-5 rounded border-border"
                        />
                    </label>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition font-medium disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? t("settings.saving") : channel ? t("settings.update") : t("settings.create")}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition"
                    >
                        {t("settings.cancel")}
                    </button>
                </div>
            </div>
        </div>
    )
}
