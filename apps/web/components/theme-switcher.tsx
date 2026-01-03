"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Define theme colors for the palette
  const themeColors = [
    { name: "light", color: "#f0f4f8", icon: "☀️" },
    { name: "dark", color: "#1a1f2e", icon: "🌙" },
    { name: "system", color: "#6b7280", icon: "⚙️" },
  ]

  return (
    <div className="flex items-center gap-1">
      {themeColors.map((t) => (
        <button
          key={t.name}
          onClick={() => setTheme(t.name)}
          className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
            theme === t.name ? "border-primary ring-2 ring-primary" : "border-border hover:border-primary"
          }`}
          style={{ backgroundColor: t.color }}
          title={t.name.charAt(0).toUpperCase() + t.name.slice(1)}
        >
          <span className="text-xs">{t.icon}</span>
        </button>
      ))}
    </div>
  )
}
