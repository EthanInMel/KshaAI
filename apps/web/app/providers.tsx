"use client"

import type React from "react"
import { ThemeProvider } from "next-themes"
import { I18nProvider } from "../lib/i18n-context"
import { SWRProvider } from "../lib/swr-config"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nProvider>
        <SWRProvider>
          {children}
          <Toaster richColors position="top-right" />
        </SWRProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}
