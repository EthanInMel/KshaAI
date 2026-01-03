"use client"

import { useI18n } from "../../lib/i18n-context"
import { motion } from "framer-motion"

export function WorkflowSection() {
  const { t } = useI18n()

  const steps = [
    { title: "Data Sources", desc: "RSS, APIs, Webhooks", icon: "📡" },
    { title: "Process", desc: "Real-time/Batch", icon: "⚙️" },
    { title: "LLM Analysis", desc: "OpenAI, Claude, etc.", icon: "🧠" },
    { title: "Notifications", desc: "Slack, Email, Custom", icon: "🔔" },
  ]

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

  const stepVariants = {
    hidden: { opacity: 0, scale: 0.7, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  }

  const arrowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 },
    },
    animate: {
      x: [0, 12, 0],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
      },
    },
  }

  const pulseVariants = {
    pulse: {
      scale: [1, 1.08, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
      },
    },
  }

  return (
    <section className="py-20 md:py-40 bg-gradient-to-b from-background via-blue-500/5 to-background relative overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY }}
        style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(0, 217, 255, 0.1), transparent 50%)",
          backgroundSize: "200% 200%",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
          >
            {t("landing.workflow")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-foreground/60 max-w-2xl mx-auto"
          >
            Watch your data flow through our intelligent platform with real-time AI analysis and instant notifications
          </motion.p>
        </div>

        {/* Desktop layout */}
        <div className="hidden md:block">
          <motion.div
            className="flex items-center justify-center gap-8 flex-wrap"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {steps.map((step, idx) => (
              <motion.div key={idx} className="flex items-center gap-8">
                <motion.div
                  variants={stepVariants}
                  whileHover={{ scale: 1.12, rotateY: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative group"
                >
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/30 to-blue-500/30 blur-xl"
                    variants={pulseVariants}
                    animate="pulse"
                  />

                  <div className="relative flex flex-col items-center p-8 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/40 shadow-2xl hover:border-cyan-400/60 transition">
                    <motion.div
                      className="text-6xl mb-4 relative z-10"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: idx * 0.2 }}
                    >
                      {step.icon}
                    </motion.div>
                    <div className="relative z-10 font-bold text-lg text-center">{step.title}</div>
                    <div className="relative z-10 text-sm text-foreground/60 text-center">{step.desc}</div>

                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition translate-x-[-200%] group-hover:translate-x-[200%] duration-1000" />
                  </div>
                </motion.div>

                {idx < steps.length - 1 && (
                  <motion.div
                    variants={arrowVariants}
                    initial="hidden"
                    whileInView="visible"
                    animate="animate"
                    viewport={{ once: true }}
                    className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
                  >
                    →
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Mobile layout */}
        <motion.div
          className="md:hidden space-y-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {steps.map((step, idx) => (
            <motion.div key={idx} className="space-y-4">
              <motion.div variants={stepVariants} whileHover={{ scale: 1.05 }} className="relative group">
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/30 to-blue-500/30 blur-lg"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
                <div className="relative flex flex-col items-center p-8 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/40">
                  <div className="text-5xl mb-3">{step.icon}</div>
                  <div className="font-bold text-lg text-center">{step.title}</div>
                  <div className="text-sm text-foreground/60 text-center">{step.desc}</div>
                </div>
              </motion.div>
              {idx < steps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  viewport={{ once: true }}
                  className="text-4xl text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
                >
                  ↓
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
