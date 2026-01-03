"use client"

import { useI18n } from "../../lib/i18n-context"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

export function FAQSection() {
  const { t } = useI18n()
  const [open, setOpen] = useState<number | null>(0)

  const faqs = [
    {
      q: "What data sources are supported?",
      a: "We support RSS feeds, REST APIs, Webhooks, and custom integrations. More sources are added regularly.",
    },
    {
      q: "How does the AI analysis work?",
      a: "We integrate with leading LLM providers like OpenAI and Anthropic. You can customize prompts and analysis parameters.",
    },
    {
      q: "Is there a free trial?",
      a: "Yes! Start with our free plan which includes 5 data sources and 3 active streams.",
    },
    {
      q: "Can I export the analyzed data?",
      a: "Absolutely. Data can be exported in CSV, JSON, or via our API for seamless integration.",
    },
  ]

  return (
    <section id="faq" className="py-20 md:py-32 bg-card">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{t("landing.faq")}</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setOpen(open === idx ? null : idx)}
                className="w-full p-4 flex items-center justify-between hover:bg-background/50 transition font-semibold"
              >
                {faq.q}
                <ChevronDown className={`w-5 h-5 transition-transform ${open === idx ? "rotate-180" : ""}`} />
              </button>
              {open === idx && (
                <div className="p-4 border-t border-border bg-background/50 text-foreground/80">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
