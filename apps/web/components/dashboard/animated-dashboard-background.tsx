"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function AnimatedDashboardBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-dot-pattern opacity-30 dark:opacity-10" />

      <motion.div
        animate={{
          x: mousePosition.x * 0.02,
          y: mousePosition.y * 0.02,
        }}
        transition={{ type: "spring", damping: 50, stiffness: 100 }}
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-30 dark:opacity-20"
        style={{
          background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
        }}
      />

      <motion.div
        animate={{
          x: mousePosition.x * -0.015,
          y: mousePosition.y * -0.015,
        }}
        transition={{ type: "spring", damping: 50, stiffness: 100 }}
        className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full opacity-20 dark:opacity-15"
        style={{
          background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
        }}
      />

      <motion.div
        animate={{
          x: mousePosition.x * 0.01,
          y: mousePosition.y * -0.01,
        }}
        transition={{ type: "spring", damping: 60, stiffness: 80 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 dark:opacity-5"
        style={{
          background: "radial-gradient(circle, var(--primary) 0%, transparent 60%)",
        }}
      />
    </div>
  )
}
