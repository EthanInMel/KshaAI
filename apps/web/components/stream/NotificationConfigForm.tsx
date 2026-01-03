'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Bell, Hash, Globe, Plus, Check, ChevronDown } from 'lucide-react';
import {
    getNotificationChannels,
    createNotificationChannel,
    NotificationChannel,
    ChannelType
} from '../../lib/api';
import { toast } from 'sonner';
import { useI18n } from '../../lib/i18n-context';

interface NotificationConfig {
    channel_ids: string[];  // Selected existing channel IDs
}

interface NotificationConfigFormProps {
    config: NotificationConfig;
    onChange: (config: NotificationConfig) => void;
}

const CHANNEL_TYPES: { type: ChannelType; name: string; icon: React.ReactNode; color: string }[] = [
    { type: 'telegram', name: 'Telegram', icon: <MessageCircle className="w-4 h-4" />, color: 'text-blue-500' },
    { type: 'discord', name: 'Discord', icon: <Bell className="w-4 h-4" />, color: 'text-indigo-500' },
    { type: 'slack', name: 'Slack', icon: <Hash className="w-4 h-4" />, color: 'text-purple-500' },
    { type: 'webhook', name: 'Webhook', icon: <Globe className="w-4 h-4" />, color: 'text-gray-500' },
];

export default function NotificationConfigForm({ config, onChange }: NotificationConfigFormProps) {
    const { t } = useI18n();
    const [channels, setChannels] = useState<NotificationChannel[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [quickAddType, setQuickAddType] = useState<ChannelType>('telegram');
    const [quickAddName, setQuickAddName] = useState('');
    const [quickAddConfig, setQuickAddConfig] = useState<Record<string, string>>({});

    const safeConfig: NotificationConfig = {
        channel_ids: config?.channel_ids || [],
    };

    useEffect(() => {
        loadChannels();
    }, []);

    const loadChannels = async () => {
        try {
            const data = await getNotificationChannels();
            setChannels(data);
        } catch (error) {
            console.error('Failed to load channels:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleChannel = (channelId: string) => {
        const currentIds = safeConfig.channel_ids;
        if (currentIds.includes(channelId)) {
            onChange({ channel_ids: currentIds.filter(id => id !== channelId) });
        } else {
            onChange({ channel_ids: [...currentIds, channelId] });
        }
    };

    const handleQuickAdd = async () => {
        if (!quickAddName.trim()) {
            toast.error(t("settings.name_required"));
            return;
        }

        try {
            const newChannel = await createNotificationChannel({
                name: quickAddName,
                type: quickAddType,
                config: quickAddConfig,
            });
            toast.success(t("settings.channel_created"));
            setChannels([...channels, newChannel]);
            // Auto-select the new channel
            onChange({ channel_ids: [...safeConfig.channel_ids, newChannel.id] });
            setShowQuickAdd(false);
            setQuickAddName('');
            setQuickAddConfig({});
        } catch (error) {
            toast.error(t("streams.failed_create_channel"));
        }
    };

    const getTypeInfo = (type: string) => CHANNEL_TYPES.find(t => t.type === type);

    const selectedChannels = channels.filter(c => safeConfig.channel_ids.includes(c.id));

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-foreground/60">
                    {t("streams.select_desc")}
                </p>
                {selectedChannels.length > 0 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {t("streams.selected_count").replace("{count}", selectedChannels.length.toString())}
                    </span>
                )}
            </div>

            {loading ? (
                <div className="h-20 animate-pulse bg-muted rounded-lg"></div>
            ) : channels.length === 0 ? (
                <div className="text-center py-6 bg-muted/30 rounded-lg border border-dashed border-border">
                    <Bell className="w-8 h-8 mx-auto text-foreground/30 mb-2" />
                    <p className="text-sm text-foreground/60 mb-3">{t("settings.no_channels")}</p>
                    <button
                        onClick={() => setShowQuickAdd(true)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
                    >
                        <Plus className="w-3 h-3" />
                        {t("settings.add_channel")}
                    </button>
                </div>
            ) : (
                <>
                    {/* Selected Channels */}
                    {selectedChannels.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedChannels.map(channel => {
                                const typeInfo = getTypeInfo(channel.type);
                                return (
                                    <div
                                        key={channel.id}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                                    >
                                        <span className={typeInfo?.color}>{typeInfo?.icon}</span>
                                        <span className="text-sm font-medium">{channel.name}</span>
                                        <button
                                            onClick={() => toggleChannel(channel.id)}
                                            className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                                        >
                                            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M2 2l8 8M2 10l8-8" />
                                            </svg>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Channel Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-background hover:border-primary/50 transition"
                        >
                            <span className="text-foreground/60">
                                {selectedChannels.length === 0 ? t("streams.select_placeholder") : t("streams.add_more")}
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                                <div className="max-h-60 overflow-y-auto">
                                    {channels.map(channel => {
                                        const typeInfo = getTypeInfo(channel.type);
                                        const isSelected = safeConfig.channel_ids.includes(channel.id);
                                        return (
                                            <button
                                                key={channel.id}
                                                onClick={() => {
                                                    toggleChannel(channel.id);
                                                }}
                                                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-muted transition ${isSelected ? 'bg-primary/5' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={typeInfo?.color}>{typeInfo?.icon}</span>
                                                    <div className="text-left">
                                                        <div className="font-medium">{channel.name}</div>
                                                        <div className="text-xs text-foreground/60">{typeInfo?.name}</div>
                                                    </div>
                                                </div>
                                                {isSelected && <Check className="w-4 h-4 text-primary" />}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="border-t border-border">
                                    <button
                                        onClick={() => {
                                            setShowDropdown(false);
                                            setShowQuickAdd(true);
                                        }}
                                        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-muted transition text-primary"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>{t("streams.create_new_action")}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Quick Add Modal */}
            {showQuickAdd && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4">
                        <h3 className="text-lg font-bold">{t("streams.quick_add_title")}</h3>

                        <div>
                            <label className="text-sm font-medium block mb-2">{t("settings.type")}</label>
                            <div className="grid grid-cols-2 gap-2">
                                {CHANNEL_TYPES.map(type => (
                                    <button
                                        key={type.type}
                                        onClick={() => {
                                            setQuickAddType(type.type);
                                            setQuickAddConfig({});
                                        }}
                                        className={`flex items-center gap-2 p-2 rounded-lg border transition ${quickAddType === type.type
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <span className={type.color}>{type.icon}</span>
                                        <span className="text-sm">{type.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium block mb-2">{t("settings.name")}</label>
                            <input
                                type="text"
                                value={quickAddName}
                                onChange={(e) => setQuickAddName(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary outline-none transition"
                                placeholder="e.g., My Telegram"
                            />
                        </div>

                        {quickAddType === 'telegram' && (
                            <>
                                <div>
                                    <label className="text-sm font-medium block mb-2">{t("settings.bot_token")}</label>
                                    <input
                                        type="password"
                                        value={quickAddConfig.bot_token || ''}
                                        onChange={(e) => setQuickAddConfig({ ...quickAddConfig, bot_token: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary outline-none transition"
                                        placeholder="123456789:ABCdef..."
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium block mb-2">{t("settings.chat_id")}</label>
                                    <input
                                        type="text"
                                        value={quickAddConfig.chat_id || ''}
                                        onChange={(e) => setQuickAddConfig({ ...quickAddConfig, chat_id: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary outline-none transition"
                                        placeholder="-100..."
                                    />
                                </div>
                            </>
                        )}

                        {(quickAddType === 'discord' || quickAddType === 'slack' || quickAddType === 'webhook') && (
                            <div>
                                <label className="text-sm font-medium block mb-2">{t("settings.webhook_url")}</label>
                                <input
                                    type="password"
                                    value={quickAddConfig.webhook_url || ''}
                                    onChange={(e) => setQuickAddConfig({ ...quickAddConfig, webhook_url: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary outline-none transition"
                                    placeholder="https://..."
                                />
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleQuickAdd}
                                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
                            >
                                {t("streams.create_select")}
                            </button>
                            <button
                                onClick={() => setShowQuickAdd(false)}
                                className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition"
                            >
                                {t("settings.cancel")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {safeConfig.channel_ids.length === 0 && !loading && channels.length > 0 && (
                <div className="text-center py-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                        {t("streams.no_selection_warning")}
                    </p>
                </div>
            )}
        </div>
    );
}
