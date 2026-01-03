"use client"

import { useI18n } from "../../lib/i18n-context"
import Link from "next/link"
import { motion } from "framer-motion"
import { TypingText } from "./typing-text"
import { ArrowRight, Play, Copy, Check } from "lucide-react"
import { useState } from "react"

export function HeroSection() {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText("npm i ksha-cloud")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-dot-pattern opacity-30 dark:opacity-20" />

      {/* Subtle gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50" />

      <motion.div
        className="container mx-auto px-4 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
              {t("landing.hero_title_1")} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                {t("landing.hero_title_2")}
              </span>{" "}
              {t("landing.hero_title_3")}
            </h1>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10"
          >
            {t("landing.subtitle")}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
              >
                {t("landing.hero_cta")}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <motion.a
              href="https://github.com/EthanInMel/KshaAI"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-card border border-border rounded-xl font-medium text-lg hover:bg-muted/50 transition-colors"
            >
              {t("landing.hero_github")}
            </motion.a>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-16 border-t border-border/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-70">
              {[
                { label: t("landing.feature_self_hosted"), icon: "🏠" },
                { label: t("landing.feature_privacy"), icon: "🔒" },
                { label: t("landing.feature_mit"), icon: "📜" },
                { label: t("landing.feature_no_lockin"), icon: "🔓" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-center gap-2 text-sm font-medium">
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
