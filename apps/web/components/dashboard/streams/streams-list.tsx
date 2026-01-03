"use client"

import type React from "react"

import { Search, Trash2, PlayCircle, PauseCircle, StopCircle, Eye, Zap, AlertCircle } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { type Stream, deleteStream, toggleStreamStatus, stopStream } from "../../../lib/api"
import { toast } from "sonner"
import { useI18n } from "../../../lib/i18n-context"
import { useRouter } from "next/navigation"

interface StreamsListProps {
  streams: Stream[]
  loading: boolean
  onRefresh: () => void
}

export function StreamsList({ streams, loading, onRefresh }: StreamsListProps) {
  const { t } = useI18n()
  const [search, setSearch] = useState("")
  const router = useRouter()

  const filteredStreams = streams.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          dot: "bg-emerald-500",
          glow: "shadow-emerald-500/25",
        }
      case "paused":
        return {
          color: "text-amber-400",
          bg: "bg-amber-500/10",
          border: "border-amber-500/20",
          dot: "bg-amber-500",
          glow: "shadow-amber-500/25",
        }
      default:
        return {
          color: "text-red-400",
          bg: "bg-red-500/10",
          border: "border-red-500/20",
          dot: "bg-red-500",
          glow: "shadow-red-500/25",
        }
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this stream? This action cannot be undone.")) return
    try {
      await deleteStream(id)
      toast.success("Stream deleted successfully")
      onRefresh()
    } catch (error) {
      toast.error("Failed to delete stream")
    }
  }

  const handleToggle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await toggleStreamStatus(id)
      toast.success("Stream status updated")
      onRefresh()
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const handleStop = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to stop this stream?")) return
    try {
      await stopStream(id)
      toast.success("Stream stopped")
      onRefresh()
    } catch (error) {
      toast.error("Failed to stop stream")
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-2xl bg-card border border-border animate-pulse">
            <div className="flex justify-between mb-4">
              <div className="h-5 bg-muted rounded w-32" />
              <div className="h-3 w-3 bg-muted rounded-full" />
            </div>
            <div className="h-4 bg-muted rounded w-48 mb-6" />
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-12 bg-muted rounded-lg" />
              ))}
            </div>
            <div className="flex gap-2">
              <div className="h-10 bg-muted rounded-lg flex-1" />
              <div className="h-10 w-10 bg-muted rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (streams.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16 bg-card border border-border rounded-2xl"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
          <Zap className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">{t("streams.no_streams")}</h3>
        <p className="text-foreground/60 text-sm">{t("streams.no_streams_desc")}</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
        <input
          type="text"
          placeholder={t("streams.search_streams")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-foreground placeholder:text-foreground/40"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 transition text-foreground/60"
          >
            Clear
          </button>
        )}
      </div>

      {/* Streams Grid */}
      <AnimatePresence mode="popLayout">
        <motion.div layout className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStreams.map((stream, idx) => {
            const statusConfig = getStatusConfig(stream.status)
            return (
              <motion.div
                key={stream.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                onClick={() => router.push(`/dashboard/streams/${stream.id}`)}
                className="group relative p-6 rounded-2xl bg-card border border-border hover:border-emerald-500/30 transition-all cursor-pointer overflow-hidden"
              >
                {/* Gradient glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Status indicator */}
                <div className="absolute top-5 right-5">
                  <motion.div
                    animate={stream.status === "active" ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] } : {}}
                    transition={{ duration: 2, repeat: stream.status === "active" ? Number.POSITIVE_INFINITY : 0 }}
                    className={`w-2.5 h-2.5 rounded-full ${statusConfig.dot} shadow-lg ${statusConfig.glow}`}
                  />
                </div>

                <div className="relative">
                  {/* Header */}
                  <div className="mb-4 pr-8">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-emerald-400 transition-colors truncate">
                      {stream.name || "Unnamed Stream"}
                    </h3>
                    <p className="text-sm text-foreground/50 truncate mt-1">
                      {stream.source
                        ? `${stream.source.type.toUpperCase()} - ${stream.source.identifier.substring(0, 35)}${stream.source.identifier.length > 35 ? "..." : ""}`
                        : "No source"}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-xl bg-background/50 border border-border">
                    <div>
                      <p className="text-[10px] text-foreground/40 uppercase tracking-wider">{t("streams.step_2")}</p>
                      <p className="text-sm font-medium text-foreground capitalize mt-0.5">
                        {stream.aggregation_config?.type || "realtime"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-foreground/40 uppercase tracking-wider">{t("streams.model")}</p>
                      <p className="text-sm font-medium text-foreground truncate mt-0.5">
                        {stream.llm_config?.model?.split("/").pop() || "gpt-3.5"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-foreground/40 uppercase tracking-wider">{t("streams.status")}</p>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize mt-0.5 ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border`}
                      >
                        {stream.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] text-foreground/40 uppercase tracking-wider">{t("streams.step_1")}</p>
                      <p className="text-sm font-medium text-foreground mt-0.5">
                        {new Date(stream.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/dashboard/streams/${stream.id}`)
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition text-sm font-medium border border-emerald-500/20"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleToggle(stream.id, e)}
                      className="p-2.5 rounded-xl hover:bg-muted transition border border-transparent hover:border-border"
                      title={stream.status === "active" ? "Pause" : "Activate"}
                    >
                      {stream.status === "active" ? (
                        <PauseCircle className="w-5 h-5 text-amber-400" />
                      ) : (
                        <PlayCircle className="w-5 h-5 text-emerald-400" />
                      )}
                    </motion.button>

                    {stream.status !== "paused" && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleStop(stream.id, e)}
                        className="p-2.5 rounded-xl hover:bg-red-500/10 transition"
                        title="Stop"
                      >
                        <StopCircle className="w-5 h-5 text-red-400" />
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleDelete(stream.id, e)}
                      className="p-2.5 rounded-xl hover:bg-red-500/10 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </AnimatePresence>

      {filteredStreams.length === 0 && search && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
          <p className="text-foreground/50">No streams match your search</p>
        </motion.div>
      )}
    </div>
  )
}
