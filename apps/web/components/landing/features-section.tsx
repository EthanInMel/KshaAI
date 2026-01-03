"use client"

import { useI18n } from "../../lib/i18n-context"
import { Zap, Clock, Settings, Bell } from "lucide-react"
import { motion } from "framer-motion"

export function FeaturesSection() {
  const { t } = useI18n()

  const features = [
    {
      icon: Zap,
      title: t("landing.feature_1"),
      description: t("landing.feature_1_desc"),
    },
    {
      icon: Clock,
      title: t("landing.feature_2"),
      description: t("landing.feature_2_desc"),
    },
    {
      icon: Settings,
      title: t("landing.feature_3"),
      description: t("landing.feature_3_desc"),
    },
    {
      icon: Bell,
      title: t("landing.feature_4"),
      description: t("landing.feature_4_desc"),
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section id="features" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-muted/30" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
          >
            {t("landing.features_title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground"
          >
            Everything you need to build AI-powered data products
          </motion.p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                className={`group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 ${idx === 0 ? "md:col-span-2 md:row-span-2" : ""
                  }`}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className={`font-semibold mb-2 ${idx === 0 ? "text-2xl" : "text-lg"}`}>{feature.title}</h3>
                  <p className={`text-muted-foreground leading-relaxed ${idx === 0 ? "text-base" : "text-sm"}`}>
                    {feature.description}
                  </p>

                  {/* Preview illustration for first card */}
                  {idx === 0 && (
                    <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-destructive" />
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 w-3/4 rounded bg-border" />
                        <div className="h-3 w-1/2 rounded bg-border" />
                        <div className="h-3 w-2/3 rounded bg-primary/30" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
