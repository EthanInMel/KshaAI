"use client"

import { useI18n } from "../../lib/i18n-context"
import { Check } from "lucide-react"

export function PricingSection() {
  const { t } = useI18n()

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for getting started",
      features: ["5 Data Sources", "3 Active Streams", "Basic Analytics", "Community Support"],
    },
    {
      name: "Pro",
      price: "$99",
      description: "For growing businesses",
      features: [
        "Unlimited Sources",
        "50 Active Streams",
        "Advanced Analytics",
        "Priority Support",
        "Custom Integrations",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: ["Everything in Pro", "Dedicated Support", "SLA Guarantee", "Custom Deployment", "Team Management"],
    },
  ]

  return (
    <section id="pricing" className="py-20 md:py-32 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{t("landing.pricing")}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-xl border transition ${
                plan.highlighted
                  ? "border-primary bg-primary/5 ring-2 ring-primary"
                  : "border-border bg-background hover:border-primary"
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-foreground/60 text-sm mb-4">{plan.description}</p>
              <div className="text-4xl font-bold mb-6">
                {plan.price}
                {plan.price !== "Custom" && <span className="text-lg text-foreground/60">/mo</span>}
              </div>
              <button
                className={`w-full py-2 px-4 rounded-lg font-semibold mb-8 transition ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-primary text-primary hover:bg-primary/10"
                }`}
              >
                {t("common.getStarted")}
              </button>
              <div className="space-y-4">
                {plan.features.map((feature, fidx) => (
                  <div key={fidx} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
