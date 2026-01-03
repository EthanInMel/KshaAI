"use client"

import { useI18n } from "../lib/i18n-context"

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n()

  return (
    <div className="flex items-center gap-2">
      {(["en", "zh"] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
            language === lang
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
