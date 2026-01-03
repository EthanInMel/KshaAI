"use client"

import { useI18n } from "../../lib/i18n-context"
import { ThemeSwitcher } from "..//theme-switcher"
import { LanguageSwitcher } from "..//language-switcher"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Menu, X, ArrowRight } from "lucide-react"

export function LandingHeader() {
  const { t } = useI18n()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass-heavy shadow-lg bg-background/80 backdrop-blur-md" : "bg-transparent"
        }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-primary-foreground font-bold text-lg relative z-10">K</span>
              <div className="absolute inset-0 bg-gradient-to-tr from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
            <span className="font-bold text-xl tracking-tight">{t("common.product_name")}</span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://github.com/EthanInMel/KshaAI"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                {t("common.github")}
              </a>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  {t("common.dashboard")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

