"use client"

import { useI18n } from "../../lib/i18n-context"

export function TestimonialsSection() {
  const { t } = useI18n()

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      company: "TechStartup Inc",
      text: "Ksha Cloud transformed how we monitor market trends. Real-time AI analysis saved us thousands in research costs.",
    },
    {
      name: "Alex Rodriguez",
      role: "Data Engineer",
      company: "FinanceApp",
      text: "The flexibility and ease of setup is unmatched. We had production workflows running in hours, not days.",
    },
    {
      name: "Lisa Wang",
      role: "CEO",
      company: "MediaCorp",
      text: "Outstanding platform for aggregating news and analyzing sentiment. Highly recommend for any data-driven organization.",
    },
  ]

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{t("landing.testimonials")}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="p-8 rounded-xl bg-card border border-border">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-foreground/80 mb-4">"{testimonial.text}"</p>
              <div>
                <div className="font-bold">{testimonial.name}</div>
                <div className="text-sm text-foreground/60">
                  {testimonial.role} at {testimonial.company}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
