"use client"

import { useI18n } from "../../../lib/i18n-context"
import { SourcesList } from "../../../components/dashboard/sources/sources-list"
import { useState, useEffect } from "react"
import { Plus, Rss, Globe, MessageSquare, Github, Radio, Send, Check, Loader2, RefreshCw, Users, Search, X } from "lucide-react"
import {
  getSources, createSource, Source,
  validateTelegramToken, TelegramChat, TelegramBotInfo,
  validateDiscordToken, getDiscordChannels, DiscordBotInfo, DiscordGuild, DiscordChannel,
  validateRedditSubreddits, searchRedditSubreddits, SubredditInfo,
  validateMastodonInstance, searchMastodonAccounts, MastodonAccount, MastodonInstanceInfo,
  validateBlueskyHandle, searchBlueskyUsers, BlueskyProfile,
} from "../../../lib/api"
import { toast } from "sonner"

// Icons for new platforms
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
)

const RedditIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
)

const MastodonIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.668 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z" />
  </svg>
)

const BlueskyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z" />
  </svg>
)

export default function SourcesPage() {
  const { t } = useI18n()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await getSources()
      setSources(data)
    } catch (error) {
      console.error("Failed to load sources:", error)
      toast.error("Failed to load sources")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateSuccess = () => {
    setShowCreateModal(false)
    loadData()
    toast.success("Source created successfully")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("common.sources")}</h1>
          <p className="text-foreground/60 mt-2">{t("sources.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition font-medium"
        >
          <Plus className="w-5 h-5" />
          {t("sources.add_btn")}
        </button>
      </div>

      <SourcesList sources={sources} loading={loading} onRefresh={loadData} />

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <CreateSourceModal onClose={() => setShowCreateModal(false)} onSuccess={handleCreateSuccess} />
        </div>
      )}
    </div>
  )
}

function CreateSourceModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const { t } = useI18n()
  const [type, setType] = useState("rss")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    identifier: "",
    description: "",
    twitterType: "search" as "user_timeline" | "user_mentions" | "search" | "hashtag",
    maxResults: "10",
  })

  // Telegram state
  const [telegramState, setTelegramState] = useState({
    botToken: "",
    validating: false,
    validated: false,
    botInfo: null as TelegramBotInfo | null,
    chats: [] as TelegramChat[],
    selectedChatIds: [] as number[],
    error: "",
  })

  // Discord state
  const [discordState, setDiscordState] = useState({
    botToken: "",
    validating: false,
    validated: false,
    botInfo: null as DiscordBotInfo | null,
    guilds: [] as DiscordGuild[],
    selectedGuild: null as DiscordGuild | null,
    channels: [] as DiscordChannel[],
    selectedChannelIds: [] as string[],
    loadingChannels: false,
    error: "",
  })

  // Reddit state
  const [redditState, setRedditState] = useState({
    subredditInput: "",
    subreddits: [] as SubredditInfo[],
    validating: false,
    searchResults: [] as SubredditInfo[],
    searching: false,
    error: "",
  })

  // Mastodon state
  const [mastodonState, setMastodonState] = useState({
    instance: "mastodon.social",
    validating: false,
    validated: false,
    instanceInfo: null as MastodonInstanceInfo | null,
    accountInput: "",
    accounts: [] as MastodonAccount[],
    hashtags: [] as string[],
    hashtagInput: "",
    searching: false,
    searchResults: [] as MastodonAccount[],
    error: "",
  })

  // Bluesky state
  const [blueskyState, setBlueskyState] = useState({
    handleInput: "",
    handles: [] as BlueskyProfile[],
    searchQuery: "",
    validating: false,
    searching: false,
    searchResults: [] as BlueskyProfile[],
    error: "",
  })

  const sourceTypes = [
    { id: "rss", label: "RSS Feed", icon: Rss, color: "orange" },
    { id: "newsnow", label: "NewsNow", icon: Globe, color: "blue" },
    { id: "x", label: "X (Twitter)", icon: MessageSquare, color: "sky" },
    { id: "telegram", label: "Telegram", icon: Send, color: "sky" },
    { id: "discord", label: "Discord", icon: DiscordIcon, color: "indigo" },
    { id: "reddit", label: "Reddit", icon: RedditIcon, color: "orange" },
    { id: "mastodon", label: "Mastodon", icon: MastodonIcon, color: "purple" },
    { id: "bluesky", label: "Bluesky", icon: BlueskyIcon, color: "blue" },
  ]

  const newsNowPlatforms = [
    { value: "zhihu", label: "知乎 (Zhihu)" },
    { value: "weibo", label: "微博 (Weibo)" },
    { value: "douyin", label: "抖音 (Douyin)" },
    { value: "bilibili", label: "Bilibili" },
    { value: "baidu", label: "百度热搜 (Baidu)" },
    { value: "36kr", label: "36Kr" },
    { value: "sspai", label: "少数派 (SSPAI)" },
    { value: "ithome", label: "IT之家 (ITHome)" },
    { value: "thepaper", label: "澎湃新闻 (ThePaper)" },
    { value: "toutiao", label: "今日头条 (Toutiao)" },
  ]

  const twitterTypes = [
    { value: "user_timeline", label: "User Timeline", description: "Get tweets from a user's timeline" },
    { value: "user_mentions", label: "User Mentions", description: "Get tweets mentioning a user" },
    { value: "search", label: "Search Query", description: "Search tweets by keyword or phrase" },
    { value: "hashtag", label: "Hashtag", description: "Monitor a specific hashtag" },
  ]

  // ========== TELEGRAM HANDLERS ==========
  const handleValidateTelegramToken = async () => {
    if (!telegramState.botToken.trim()) return
    setTelegramState(prev => ({ ...prev, validating: true, error: "" }))
    try {
      const result = await validateTelegramToken(telegramState.botToken)
      if (result.success && result.bot) {
        setTelegramState(prev => ({
          ...prev, validating: false, validated: true,
          botInfo: result.bot!, chats: result.chats || [],
        }))
        toast.success(`Connected to bot: @${result.bot.username}`)
      }
    } catch (error: any) {
      setTelegramState(prev => ({ ...prev, validating: false, error: error.message }))
      toast.error(error.message)
    }
  }

  // ========== DISCORD HANDLERS ==========
  const handleValidateDiscordToken = async () => {
    if (!discordState.botToken.trim()) return
    setDiscordState(prev => ({ ...prev, validating: true, error: "" }))
    try {
      const result = await validateDiscordToken(discordState.botToken)
      if (result.success && result.bot) {
        setDiscordState(prev => ({
          ...prev, validating: false, validated: true,
          botInfo: result.bot!, guilds: result.guilds || [],
        }))
        toast.success(`Connected to bot: ${result.bot.username}`)
      }
    } catch (error: any) {
      setDiscordState(prev => ({ ...prev, validating: false, error: error.message }))
      toast.error(error.message)
    }
  }

  const handleSelectDiscordGuild = async (guild: DiscordGuild) => {
    setDiscordState(prev => ({ ...prev, selectedGuild: guild, loadingChannels: true, channels: [], selectedChannelIds: [] }))
    try {
      const result = await getDiscordChannels(discordState.botToken, guild.id)
      setDiscordState(prev => ({ ...prev, channels: result.channels, loadingChannels: false }))
    } catch (error: any) {
      setDiscordState(prev => ({ ...prev, loadingChannels: false, error: error.message }))
    }
  }

  // ========== REDDIT HANDLERS ==========
  const handleSearchReddit = async () => {
    if (!redditState.subredditInput.trim()) return
    setRedditState(prev => ({ ...prev, searching: true }))
    try {
      const result = await searchRedditSubreddits(redditState.subredditInput)
      setRedditState(prev => ({ ...prev, searchResults: result.subreddits, searching: false }))
    } catch (error: any) {
      setRedditState(prev => ({ ...prev, searching: false }))
      toast.error(error.message)
    }
  }

  const handleAddRedditSubreddit = (sub: SubredditInfo) => {
    if (!redditState.subreddits.find(s => s.name === sub.name)) {
      setRedditState(prev => ({ ...prev, subreddits: [...prev.subreddits, sub], searchResults: [] }))
    }
  }

  // ========== MASTODON HANDLERS ==========
  const handleValidateMastodonInstance = async () => {
    if (!mastodonState.instance.trim()) return
    setMastodonState(prev => ({ ...prev, validating: true, error: "" }))
    try {
      const result = await validateMastodonInstance(mastodonState.instance)
      if (result.success && result.info) {
        setMastodonState(prev => ({ ...prev, validating: false, validated: true, instanceInfo: result.info! }))
        toast.success(`Connected to ${result.info.name}`)
      }
    } catch (error: any) {
      setMastodonState(prev => ({ ...prev, validating: false, error: error.message }))
      toast.error(error.message)
    }
  }

  const handleSearchMastodonAccounts = async () => {
    if (!mastodonState.accountInput.trim()) return
    setMastodonState(prev => ({ ...prev, searching: true }))
    try {
      const result = await searchMastodonAccounts(mastodonState.instance, mastodonState.accountInput)
      setMastodonState(prev => ({ ...prev, searchResults: result.accounts, searching: false }))
    } catch (error: any) {
      setMastodonState(prev => ({ ...prev, searching: false }))
    }
  }

  const handleAddMastodonAccount = (account: MastodonAccount) => {
    if (!mastodonState.accounts.find(a => a.id === account.id)) {
      setMastodonState(prev => ({ ...prev, accounts: [...prev.accounts, account], searchResults: [] }))
    }
  }

  const handleAddMastodonHashtag = () => {
    const tag = mastodonState.hashtagInput.replace(/^#/, '').trim()
    if (tag && !mastodonState.hashtags.includes(tag)) {
      setMastodonState(prev => ({ ...prev, hashtags: [...prev.hashtags, tag], hashtagInput: "" }))
    }
  }

  // ========== BLUESKY HANDLERS ==========
  const handleValidateBlueskyHandle = async () => {
    if (!blueskyState.handleInput.trim()) return
    setBlueskyState(prev => ({ ...prev, validating: true }))
    try {
      const result = await validateBlueskyHandle(blueskyState.handleInput)
      if (result.success && result.profile) {
        if (!blueskyState.handles.find(h => h.handle === result.profile!.handle)) {
          setBlueskyState(prev => ({ ...prev, handles: [...prev.handles, result.profile!], handleInput: "", validating: false }))
          toast.success(`Added @${result.profile.handle}`)
        }
      }
    } catch (error: any) {
      setBlueskyState(prev => ({ ...prev, validating: false }))
      toast.error(error.message)
    }
  }

  const handleSearchBlueskyUsers = async () => {
    if (!blueskyState.handleInput.trim()) return
    setBlueskyState(prev => ({ ...prev, searching: true }))
    try {
      const result = await searchBlueskyUsers(blueskyState.handleInput)
      setBlueskyState(prev => ({ ...prev, searchResults: result.users, searching: false }))
    } catch (error: any) {
      setBlueskyState(prev => ({ ...prev, searching: false }))
    }
  }

  // ========== SUBMIT ==========
  const handleSubmit = async () => {
    try {
      setLoading(true)
      let payload: any = {
        type: type.toLowerCase(),
        identifier: formData.identifier || `${type}-${Date.now()}`,
        config: { name: formData.name, description: formData.description }
      }

      if (type === 'x') {
        payload.config = { ...payload.config, type: formData.twitterType, query: formData.identifier, maxResults: parseInt(formData.maxResults) || 10 }
      } else if (type === 'telegram') {
        if (!telegramState.validated || telegramState.selectedChatIds.length === 0) {
          toast.error("Please validate token and select chats"); setLoading(false); return
        }
        const chatNames: Record<number, string> = {}
        telegramState.chats.filter(c => telegramState.selectedChatIds.includes(c.id)).forEach(c => { chatNames[c.id] = c.title })
        payload = {
          type: 'telegram', identifier: `telegram-${telegramState.botInfo?.username || Date.now()}`,
          config: { name: formData.name || `Telegram - @${telegramState.botInfo?.username}`, description: formData.description, botToken: telegramState.botToken, chatIds: telegramState.selectedChatIds, chatNames }
        }
      } else if (type === 'discord') {
        if (!discordState.validated || discordState.selectedChannelIds.length === 0) {
          toast.error("Please validate token and select channels"); setLoading(false); return
        }
        const channelNames: Record<string, string> = {}
        discordState.channels.filter(c => discordState.selectedChannelIds.includes(c.id)).forEach(c => { channelNames[c.id] = c.name })
        payload = {
          type: 'discord', identifier: `discord-${discordState.selectedGuild?.id || Date.now()}`,
          config: { name: formData.name || `Discord - ${discordState.selectedGuild?.name}`, description: formData.description, botToken: discordState.botToken, guildId: discordState.selectedGuild?.id, channelIds: discordState.selectedChannelIds, channelNames }
        }
      } else if (type === 'reddit') {
        if (redditState.subreddits.length === 0) {
          toast.error("Please add at least one subreddit"); setLoading(false); return
        }
        payload = {
          type: 'reddit', identifier: `reddit-${Date.now()}`,
          config: { name: formData.name || `Reddit - ${redditState.subreddits.map(s => s.name).join(', ')}`, description: formData.description, subreddits: redditState.subreddits.map(s => s.name), sort: 'new', limit: 25 }
        }
      } else if (type === 'mastodon') {
        if (!mastodonState.validated || (mastodonState.accounts.length === 0 && mastodonState.hashtags.length === 0)) {
          toast.error("Please validate instance and add accounts or hashtags"); setLoading(false); return
        }
        payload = {
          type: 'mastodon', identifier: `mastodon-${mastodonState.instance}-${Date.now()}`,
          config: { name: formData.name || `Mastodon - ${mastodonState.instance}`, description: formData.description, instance: mastodonState.instance, accounts: mastodonState.accounts.map(a => a.id), accountNames: Object.fromEntries(mastodonState.accounts.map(a => [a.id, a.acct])), hashtags: mastodonState.hashtags }
        }
      } else if (type === 'bluesky') {
        if (blueskyState.handles.length === 0 && !blueskyState.searchQuery) {
          toast.error("Please add handles or a search query"); setLoading(false); return
        }
        payload = {
          type: 'bluesky', identifier: `bluesky-${Date.now()}`,
          config: { name: formData.name || `Bluesky - ${blueskyState.handles.map(h => h.handle).join(', ') || blueskyState.searchQuery}`, description: formData.description, handles: blueskyState.handles.map(h => h.handle), handleNames: Object.fromEntries(blueskyState.handles.map(h => [h.handle, h.displayName || h.handle])), searchQuery: blueskyState.searchQuery }
        }
      }

      await createSource(payload)
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || "Failed to create source")
    } finally {
      setLoading(false)
    }
  }

  const selectedType = sourceTypes.find(t => t.id === type)

  return (
    <div className="bg-card border border-border rounded-xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
      <div>
        <h2 className="text-2xl font-bold">{t("sources.add_title")}</h2>
        <p className="text-foreground/60">{t("sources.select_type_desc")}</p>
      </div>

      {/* Source Type Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {sourceTypes.map((st) => (
          <button
            key={st.id}
            onClick={() => setType(st.id)}
            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition ${type === st.id ? "border-primary bg-primary/10 text-primary ring-1 ring-primary" : "border-border hover:border-primary hover:bg-muted/50"}`}
          >
            <st.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{st.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        {/* RSS / NewsNow / Twitter / Webhook / WebSocket - Common fields */}
        {['rss', 'newsnow', 'x', 'webhook', 'wss', 'github'].includes(type) && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("sources.source_name")}</label>
                <input type="text" placeholder="e.g., Tech News" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none transition text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{type === 'newsnow' ? t("sources.platform") : t("sources.identifier")}</label>
                {type === 'newsnow' ? (
                  <select value={formData.identifier} onChange={(e) => setFormData({ ...formData, identifier: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none transition text-sm">
                    <option value="">{t("sources.select_platform")}</option>
                    {newsNowPlatforms.map((p) => (<option key={p.value} value={p.value}>{p.label}</option>))}
                  </select>
                ) : (
                  <input type="text" placeholder={type === 'rss' ? 'https://example.com/feed.xml' : type === 'x' ? '@username or keyword' : 'Identifier'} value={formData.identifier} onChange={(e) => setFormData({ ...formData, identifier: e.target.value })} disabled={type === 'webhook'} className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none transition text-sm disabled:opacity-60" />
                )}
              </div>
            </div>
            {type === 'x' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fetch Type</label>
                  <select value={formData.twitterType} onChange={(e) => setFormData({ ...formData, twitterType: e.target.value as any })} className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none transition text-sm">
                    {twitterTypes.map((tt) => (<option key={tt.value} value={tt.value}>{tt.label}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Results</label>
                  <input type="number" min="1" max="100" value={formData.maxResults} onChange={(e) => setFormData({ ...formData, maxResults: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none transition text-sm" />
                </div>
              </div>
            )}
          </>
        )}

        {/* TELEGRAM */}
        {type === 'telegram' && (
          <div className="space-y-4 p-4 rounded-lg bg-sky-500/5 border border-sky-500/20">
            <div className="flex items-center gap-2"><Send className="w-5 h-5 text-sky-500" /><h3 className="font-medium">{t("sources.telegram_config")}</h3></div>
            <div className="flex gap-2">
              <input type="password" placeholder={t("sources.telegram_token_placeholder")} value={telegramState.botToken} onChange={(e) => setTelegramState(prev => ({ ...prev, botToken: e.target.value, validated: false }))} className="flex-1 px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition text-sm" />
              <button onClick={handleValidateTelegramToken} disabled={telegramState.validating} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${telegramState.validated ? "bg-green-500/10 text-green-500" : "bg-sky-500/10 text-sky-500 hover:bg-sky-500/20"}`}>
                {telegramState.validating ? <Loader2 className="w-4 h-4 animate-spin" /> : telegramState.validated ? <Check className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                {telegramState.validated ? t("sources.connected") : t("sources.validate")}
              </button>
            </div>
            {telegramState.validated && telegramState.chats.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {telegramState.chats.map((chat) => (
                  <label key={chat.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${telegramState.selectedChatIds.includes(chat.id) ? "border-sky-500 bg-sky-500/10" : "border-border bg-background"}`}>
                    <input type="checkbox" checked={telegramState.selectedChatIds.includes(chat.id)} onChange={() => setTelegramState(prev => ({ ...prev, selectedChatIds: prev.selectedChatIds.includes(chat.id) ? prev.selectedChatIds.filter(id => id !== chat.id) : [...prev.selectedChatIds, chat.id] }))} className="accent-sky-500" />
                    <div><p className="font-medium text-sm">{chat.title}</p><p className="text-xs text-foreground/60">{chat.type === 'channel' ? '📢 Channel' : '👥 Group'}</p></div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DISCORD */}
        {type === 'discord' && (
          <div className="space-y-4 p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
            <div className="flex items-center gap-2"><DiscordIcon className="w-5 h-5 text-indigo-500" /><h3 className="font-medium">{t("sources.discord_config")}</h3></div>
            <div className="flex gap-2">
              <input type="password" placeholder={t("sources.discord_token_placeholder")} value={discordState.botToken} onChange={(e) => setDiscordState(prev => ({ ...prev, botToken: e.target.value, validated: false }))} className="flex-1 px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition text-sm" />
              <button onClick={handleValidateDiscordToken} disabled={discordState.validating} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${discordState.validated ? "bg-green-500/10 text-green-500" : "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20"}`}>
                {discordState.validating ? <Loader2 className="w-4 h-4 animate-spin" /> : discordState.validated ? <Check className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                {discordState.validated ? t("sources.connected") : t("sources.validate")}
              </button>
            </div>
            {discordState.validated && discordState.guilds.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("sources.select_server")}</label>
                <select value={discordState.selectedGuild?.id || ''} onChange={(e) => { const g = discordState.guilds.find(x => x.id === e.target.value); if (g) handleSelectDiscordGuild(g) }} className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition text-sm">
                  <option value="">{t("sources.select_server_placeholder")}</option>
                  {discordState.guilds.map((g) => (<option key={g.id} value={g.id}>{g.name}</option>))}
                </select>
              </div>
            )}
            {discordState.selectedGuild && discordState.channels.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <label className="text-sm font-medium">Select Channels</label>
                {discordState.channels.map((ch) => (
                  <label key={ch.id} className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer ${discordState.selectedChannelIds.includes(ch.id) ? "border-indigo-500 bg-indigo-500/10" : "border-border bg-background"}`}>
                    <input type="checkbox" checked={discordState.selectedChannelIds.includes(ch.id)} onChange={() => setDiscordState(prev => ({ ...prev, selectedChannelIds: prev.selectedChannelIds.includes(ch.id) ? prev.selectedChannelIds.filter(id => id !== ch.id) : [...prev.selectedChannelIds, ch.id] }))} className="accent-indigo-500" />
                    <span className="text-sm">#{ch.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REDDIT */}
        {type === 'reddit' && (
          <div className="space-y-4 p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
            <div className="flex items-center gap-2"><RedditIcon className="w-5 h-5 text-orange-500" /><h3 className="font-medium">{t("sources.reddit_config")}</h3></div>
            <div className="flex gap-2">
              <input type="text" placeholder={t("sources.search_placeholder")} value={redditState.subredditInput} onChange={(e) => setRedditState(prev => ({ ...prev, subredditInput: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && handleSearchReddit()} className="flex-1 px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition text-sm" />
              <button onClick={handleSearchReddit} disabled={redditState.searching} className="px-4 py-2 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 text-sm font-medium flex items-center gap-2">
                {redditState.searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {t("common.search")}
              </button>
            </div>
            {redditState.searchResults.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {redditState.searchResults.map((sub) => (
                  <button key={sub.name} onClick={() => handleAddRedditSubreddit(sub)} className="w-full text-left p-2 rounded-lg border border-border hover:border-orange-500 bg-background text-sm">
                    <span className="font-medium">r/{sub.name}</span> <span className="text-foreground/60">· {sub.subscribers?.toLocaleString()} members</span>
                  </button>
                ))}
              </div>
            )}
            {redditState.subreddits.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {redditState.subreddits.map((sub) => (
                  <span key={sub.name} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 text-orange-500 text-sm">
                    r/{sub.name}
                    <button onClick={() => setRedditState(prev => ({ ...prev, subreddits: prev.subreddits.filter(s => s.name !== sub.name) }))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MASTODON */}
        {type === 'mastodon' && (
          <div className="space-y-4 p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
            <div className="flex items-center gap-2"><MastodonIcon className="w-5 h-5 text-purple-500" /><h3 className="font-medium">{t("sources.mastodon_config")}</h3></div>
            <div className="flex gap-2">
              <input type="text" placeholder="Instance (e.g., mastodon.social)" value={mastodonState.instance} onChange={(e) => setMastodonState(prev => ({ ...prev, instance: e.target.value, validated: false }))} className="flex-1 px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition text-sm" />
              <button onClick={handleValidateMastodonInstance} disabled={mastodonState.validating} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${mastodonState.validated ? "bg-green-500/10 text-green-500" : "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"}`}>
                {mastodonState.validating ? <Loader2 className="w-4 h-4 animate-spin" /> : mastodonState.validated ? <Check className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                {mastodonState.validated ? t("sources.connected") : t("sources.validate")}
              </button>
            </div>
            {mastodonState.validated && (
              <>
                <div className="flex gap-2">
                  <input type="text" placeholder={t("sources.search_placeholder")} value={mastodonState.accountInput} onChange={(e) => setMastodonState(prev => ({ ...prev, accountInput: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && handleSearchMastodonAccounts()} className="flex-1 px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition text-sm" />
                  <button onClick={handleSearchMastodonAccounts} disabled={mastodonState.searching} className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 text-sm font-medium"><Search className="w-4 h-4" /></button>
                </div>
                {mastodonState.searchResults.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {mastodonState.searchResults.map((acc) => (
                      <button key={acc.id} onClick={() => handleAddMastodonAccount(acc)} className="w-full text-left p-2 rounded-lg border border-border hover:border-purple-500 bg-background text-sm">
                        <span className="font-medium">@{acc.acct}</span> {acc.display_name && <span className="text-foreground/60">({acc.display_name})</span>}
                      </button>
                    ))}
                  </div>
                )}
                {mastodonState.accounts.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {mastodonState.accounts.map((acc) => (
                      <span key={acc.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/10 text-purple-500 text-sm">
                        @{acc.acct}
                        <button onClick={() => setMastodonState(prev => ({ ...prev, accounts: prev.accounts.filter(a => a.id !== acc.id) }))}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input type="text" placeholder="Add hashtag (e.g., #tech)" value={mastodonState.hashtagInput} onChange={(e) => setMastodonState(prev => ({ ...prev, hashtagInput: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && handleAddMastodonHashtag()} className="flex-1 px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition text-sm" />
                  <button onClick={handleAddMastodonHashtag} className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 text-sm font-medium"><Plus className="w-4 h-4" /></button>
                </div>
                {mastodonState.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {mastodonState.hashtags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/10 text-purple-500 text-sm">
                        #{tag}
                        <button onClick={() => setMastodonState(prev => ({ ...prev, hashtags: prev.hashtags.filter(t => t !== tag) }))}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* BLUESKY */}
        {type === 'bluesky' && (
          <div className="space-y-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <div className="flex items-center gap-2"><BlueskyIcon className="w-5 h-5 text-blue-500" /><h3 className="font-medium">{t("sources.bluesky_config")}</h3></div>
            <div className="flex gap-2">
              <input type="text" placeholder="Handle (e.g., alice.bsky.social)" value={blueskyState.handleInput} onChange={(e) => setBlueskyState(prev => ({ ...prev, handleInput: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && handleValidateBlueskyHandle()} className="flex-1 px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition text-sm" />
              <button onClick={handleValidateBlueskyHandle} disabled={blueskyState.validating} className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 text-sm font-medium flex items-center gap-2">
                {blueskyState.validating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {t("common.add")}
              </button>
              <button onClick={handleSearchBlueskyUsers} disabled={blueskyState.searching} className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 text-sm font-medium">
                {blueskyState.searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>
            {blueskyState.searchResults.length > 0 && (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {blueskyState.searchResults.map((user) => (
                  <button key={user.did} onClick={() => { if (!blueskyState.handles.find(h => h.handle === user.handle)) setBlueskyState(prev => ({ ...prev, handles: [...prev.handles, user], searchResults: [] })) }} className="w-full text-left p-2 rounded-lg border border-border hover:border-blue-500 bg-background text-sm">
                    <span className="font-medium">@{user.handle}</span> {user.displayName && <span className="text-foreground/60">({user.displayName})</span>}
                  </button>
                ))}
              </div>
            )}
            {blueskyState.handles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blueskyState.handles.map((h) => (
                  <span key={h.handle} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm">
                    @{h.handle}
                    <button onClick={() => setBlueskyState(prev => ({ ...prev, handles: prev.handles.filter(x => x.handle !== h.handle) }))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("sources.or_search_keyword")}</label>
              <input type="text" placeholder={t("sources.search_query_optional")} value={blueskyState.searchQuery} onChange={(e) => setBlueskyState(prev => ({ ...prev, searchQuery: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none transition text-sm" />
            </div>
          </div>
        )}

        {/* Description - show for all types */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("sources.description_optional")}</label>
          <textarea placeholder={t("sources.description_placeholder")} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary outline-none transition resize-none text-sm" rows={2} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button onClick={onClose} disabled={loading} className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted transition font-medium">{t("common.cancel")}</button>
        <button onClick={handleSubmit} disabled={loading} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {t("sources.create_submit")}
        </button>
      </div>
    </div>
  )
}
