"use client"

import { Star, Download } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import { MarketplaceSource, MarketplaceSubscription, subscribeToMarketplaceSource, unsubscribeFromMarketplaceSource } from "../../../lib/api"
import { toast } from "sonner"

interface MarketplaceGridProps {
  sources: MarketplaceSource[]
  subscriptions: MarketplaceSubscription[]
  search: string
  category: string
  loading: boolean
  onRefresh: () => void
}

export function MarketplaceGrid({
  sources,
  subscriptions,
  search,
  category,
  loading,
  onRefresh,
}: MarketplaceGridProps) {
  const [processingId, setProcessingId] = useState<string | null>(null)

  const filtered = sources.filter((source) => {
    const matchesSearch = source.name.toLowerCase().includes(search.toLowerCase()) ||
      source.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === "all" || source.category.toLowerCase() === category.toLowerCase()
    return matchesSearch && matchesCategory
  })

  // Mock featured logic for now, or use a field if available
  const featured = filtered.filter((s) => s.category === 'finance' || s.category === 'news').slice(0, 3)
  const regular = filtered.filter((s) => !featured.find(f => f.id === s.id))

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 },
    }),
  }

  const handleSubscribe = async (sourceId: string, isSubscribed: boolean) => {
    try {
      setProcessingId(sourceId)
      if (isSubscribed) {
        await unsubscribeFromMarketplaceSource(sourceId)
        toast.success("Unsubscribed successfully")
      } else {
        await subscribeToMarketplaceSource(sourceId)
        toast.success("Subscribed successfully")
      }
      onRefresh()
    } catch (error: any) {
      toast.error(error.message || "Operation failed")
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 bg-card border border-border rounded-xl animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Featured Section */}
      {featured.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-xl font-bold mb-4">Featured</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((source, idx) => (
              <motion.div key={source.id} custom={idx} variants={cardVariants} initial="hidden" animate="visible">
                <SourceCard
                  source={source}
                  isSubscribed={subscriptions.some(sub => sub.marketplace_source_id === source.id && sub.status === 'active')}
                  isProcessing={processingId === source.id}
                  onSubscribe={() => handleSubscribe(
                    source.id,
                    subscriptions.some(sub => sub.marketplace_source_id === source.id && sub.status === 'active')
                  )}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* All Sources */}
      {regular.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-xl font-bold mb-4">All Sources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regular.map((source, idx) => (
              <motion.div key={source.id} custom={idx} variants={cardVariants} initial="hidden" animate="visible">
                <SourceCard
                  source={source}
                  isSubscribed={subscriptions.some(sub => sub.marketplace_source_id === source.id && sub.status === 'active')}
                  isProcessing={processingId === source.id}
                  onSubscribe={() => handleSubscribe(
                    source.id,
                    subscriptions.some(sub => sub.marketplace_source_id === source.id && sub.status === 'active')
                  )}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-12 text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="text-4xl mb-4"
          >
            🔍
          </motion.div>
          <h3 className="text-lg font-bold mb-2">No sources found</h3>
          <p className="text-foreground/60">Try adjusting your search or filters</p>
        </motion.div>
      )}
    </div>
  )
}

function SourceCard({
  source,
  isSubscribed,
  isProcessing,
  onSubscribe,
}: {
  source: MarketplaceSource
  isSubscribed: boolean
  isProcessing: boolean
  onSubscribe: () => void
}) {
  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: "0 25px 40px -10px rgba(0, 0, 0, 0.15)" }}
      whileTap={{ scale: 0.98 }}
      className="p-6 rounded-xl bg-card border border-border flex flex-col transition h-full"
    >
      <div className="flex items-start justify-between mb-3">
        <motion.div whileHover={{ scale: 1.2, rotate: 10 }} className="text-4xl">
          {/* Use emoji based on category or default */}
          {source.category === 'finance' ? '📈' :
            source.category === 'news' ? '📰' :
              source.category === 'social-media' ? '🐦' : '📦'}
        </motion.div>
        {(source.category === 'finance' || source.category === 'news') && (
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="px-2 py-1 rounded text-xs font-bold bg-accent text-accent-foreground"
          >
            Featured
          </motion.span>
        )}
      </div>

      <h3 className="font-bold text-lg mb-1">{source.name}</h3>
      <p className="text-sm text-foreground/60 mb-3">{source.creator?.organization?.name || 'Unknown Author'}</p>
      <p className="text-sm text-foreground/70 mb-4 flex-1">{source.description}</p>

      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
        <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium">4.5</span>
        </motion.div>
        <div className="flex items-center gap-1 text-foreground/60">
          <Download className="w-4 h-4" />
          <span className="text-sm">{source._count?.subscriptions || 0}</span>
        </div>
      </div>

      <motion.button
        onClick={onSubscribe}
        disabled={isProcessing}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-full px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${isSubscribed
            ? "bg-background text-foreground border border-border hover:bg-muted"
            : "bg-primary text-primary-foreground hover:opacity-90"
          }`}
      >
        {isProcessing && <span className="loading loading-spinner loading-xs"></span>}
        {isSubscribed ? "Unsubscribe" : "Subscribe"}
      </motion.button>
    </motion.div>
  )
}
