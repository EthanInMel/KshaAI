"use client"

import type React from "react"

import { Search, Trash2, Database, AlertCircle, ExternalLink } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { type Source, deleteSource } from "../../../lib/api"
import { toast } from "sonner"
import { useI18n } from "../../../lib/i18n-context"

interface SourcesListProps {
  sources: Source[]
  loading: boolean
  onRefresh: () => void
}

export function SourcesList({ sources, loading, onRefresh }: SourcesListProps) {
  const { t } = useI18n()
  const [search, setSearch] = useState("")

  const filteredSources = sources.filter((s) =>
    (s.config?.name || s.identifier).toLowerCase().includes(search.toLowerCase()),
  )

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this source?")) return
    try {
      await deleteSource(id)
      toast.success("Source deleted")
      onRefresh()
    } catch (error) {
      toast.error("Failed to delete source")
    }
  }

  const getTypeConfig = (type: string) => {
    const configs: Record<string, { bg: string; color: string; border: string }> = {
      rss: { bg: "bg-orange-500/10", color: "text-orange-400", border: "border-orange-500/20" },
      x: { bg: "bg-sky-500/10", color: "text-sky-400", border: "border-sky-500/20" },
      telegram: { bg: "bg-blue-500/10", color: "text-blue-400", border: "border-blue-500/20" },
      discord: { bg: "bg-indigo-500/10", color: "text-indigo-400", border: "border-indigo-500/20" },
      reddit: { bg: "bg-orange-500/10", color: "text-orange-400", border: "border-orange-500/20" },
      newsnow: { bg: "bg-emerald-500/10", color: "text-emerald-400", border: "border-emerald-500/20" },
      github: { bg: "bg-violet-500/10", color: "text-violet-400", border: "border-violet-500/20" },
    }
    return configs[type.toLowerCase()] || { bg: "bg-muted", color: "text-foreground/60", border: "border-border" }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (sources.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16 bg-card border border-border rounded-2xl"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
          <Database className="w-8 h-8 text-cyan-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">{t("dashboard.no_sources")}</h3>
        <p className="text-foreground/60 text-sm">{t("dashboard.no_sources_desc")}</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
        <input
          type="text"
          placeholder={t("dashboard.search_sources")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-foreground placeholder:text-foreground/40"
        />
      </div>

      {/* Sources List */}
      <AnimatePresence mode="popLayout">
        <motion.div layout className="space-y-3">
          {filteredSources.map((source, idx) => {
            const typeConfig = getTypeConfig(source.type)
            return (
              <motion.div
                key={source.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.03 }}
                whileHover={{ x: 4 }}
                className="group p-4 rounded-xl bg-card border border-border hover:border-emerald-500/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {/* Type Badge */}
                  <div className={`px-3 py-1.5 rounded-lg ${typeConfig.bg} ${typeConfig.border} border`}>
                    <span className={`text-xs font-semibold uppercase ${typeConfig.color}`}>{source.type}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground group-hover:text-emerald-400 transition-colors truncate">
                      {source.config?.name || "Unnamed Source"}
                    </h4>
                    <p className="text-xs text-foreground/50 truncate mt-0.5 font-mono">{source.identifier}</p>
                  </div>

                  {/* Meta */}
                  <div className="hidden sm:block text-right">
                    <p className="text-xs text-foreground/40">Created</p>
                    <p className="text-sm text-foreground/60">{new Date(source.created_at).toLocaleDateString()}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-lg hover:bg-muted transition opacity-0 group-hover:opacity-100"
                      title="Open"
                    >
                      <ExternalLink className="w-4 h-4 text-foreground/40" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleDelete(source.id, e)}
                      className="p-2 rounded-lg hover:bg-red-500/10 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </AnimatePresence>

      {filteredSources.length === 0 && search && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
          <p className="text-foreground/50">No sources match your search</p>
        </motion.div>
      )}
    </div>
  )
}
