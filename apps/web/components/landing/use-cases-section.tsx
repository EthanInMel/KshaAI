"use client"

import { useI18n } from "../../lib/i18n-context"
import { TrendingUp, Radio, Eye } from "lucide-react"
import { motion } from "framer-motion"

export function UseCasesSection() {
  const { t } = useI18n()

  const useCases = [
    {
      icon: TrendingUp,
      title: "News Aggregation",
      description: "Aggregate news from multiple sources and analyze sentiment in real-time",
      color: "text-cyan-400",
      bgGradient: "from-cyan-500/10 to-blue-500/10",
    },
    {
      icon: Radio,
      title: "Market Monitoring",
      description: "Track market trends, competitor activities, and business opportunities",
      color: "text-purple-400",
      bgGradient: "from-purple-500/10 to-pink-500/10",
    },
    {
      icon: Eye,
      title: "Social Media Analysis",
      description: "Monitor brand mentions and analyze social media conversations",
      color: "text-pink-400",
      bgGradient: "from-pink-500/10 to-red-500/10",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section className="py-20 md:py-32 bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <motion.div
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY }}
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(0, 217, 255, 0.3) 1px, transparent 1px), linear-gradient(rgba(0, 217, 255, 0.3) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent"
          >
            {t("landing.use_cases")}
          </motion.h2>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {useCases.map((useCase, idx) => {
            const Icon = useCase.icon
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{
                  scale: 1.08,
                  y: -12,
                }}
                className={`relative p-8 rounded-2xl bg-gradient-to-br ${useCase.bgGradient} border border-cyan-500/20 hover:border-cyan-400/60 transition group overflow-hidden`}
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-white/10 via-transparent to-transparent" />

                <motion.div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${useCase.bgGradient} flex items-center justify-center mb-6 ${useCase.color} relative z-10`}
                  whileHover={{ rotate: 360, scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Icon className="w-8 h-8" />
                </motion.div>

                <h3 className="text-2xl font-bold mb-3 relative z-10">{useCase.title}</h3>
                <p className="text-foreground/70 relative z-10 leading-relaxed">{useCase.description}</p>

                <motion.div
                  className="absolute top-0 left-0 w-1 h-1 bg-cyan-400 rounded-full"
                  animate={{ scale: [1, 2, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
                <motion.div
                  className="absolute bottom-0 right-0 w-1 h-1 bg-cyan-400 rounded-full"
                  animate={{ scale: [1, 2, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
                />
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
