"use client"

import { motion } from "framer-motion"
import { useI18n } from "../../lib/i18n-context"

export function FooterSection() {
  const { t } = useI18n()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  const linkHoverVariants = {
    hover: {
      x: 4,
      color: "rgb(var(--color-primary))",
      transition: { duration: 0.2 },
    },
  }

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="border-t border-border bg-card/80 backdrop-blur-sm py-12 relative z-20"
    >
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8"
        >
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-4">
              <motion.div
                className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-lg"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.6 }}
              />
              <span className="font-bold">Ksha Cloud</span>
            </div>
            <p className="text-sm text-foreground/60">AI-powered data stream management</p>
          </motion.div>

          {["Product", "Company", "Legal"].map((category, idx) => (
            <motion.div key={category} variants={itemVariants}>
              <h4 className="font-bold mb-4">{category}</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                {["Features", "Pricing", "Docs"].slice(0, 3).map((item, i) => (
                  <motion.li key={item} variants={linkHoverVariants} whileHover="hover">
                    <a href="#" className="transition">
                      {item}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="border-t border-border pt-8 origin-left"
        >
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center text-sm text-foreground/60"
          >
            &copy; 2025 Ksha Cloud. All rights reserved.
          </motion.p>
        </motion.div>
      </div>
    </motion.footer>
  )
}
