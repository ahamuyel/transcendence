"use client"

import { useTranslation } from "@/lib/i18n"

type Props = { locale?: string }

type BenefitItem = {
  role: string
  title: string
  description: string
  points: string[]
}

export default function BenefitsSection({ locale = "pt" }: Props) {
  const { t, tv } = useTranslation(locale)

  const items = tv("landing.benefits.items") as BenefitItem[]

  return (
    <section
      id="benefits"
      className="py-20 md:py-32 bg-[var(--landing-bg)] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16 md:mb-20">
          <span className="text-xs text-[var(--landing-text-dim)] uppercase tracking-widest block mb-3">
            {t("landing.benefits.tag")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--landing-text-primary)] leading-none mb-6">
            {t("landing.benefits.headline")}
          </h2>
          <p className="text-[var(--landing-text-secondary)] text-sm md:text-base leading-relaxed">
            {t("landing.benefits.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="border border-[var(--landing-border)] bg-[var(--landing-bg-elevated)] p-8 rounded-xl transition-all duration-300 hover:border-[var(--landing-border-strong)]"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center text-sm font-bold">
                  {item.role.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-[var(--landing-text-dim)] uppercase tracking-widest mb-0.5">
                    {item.role}
                  </p>
                  <h3 className="text-base font-bold text-[var(--landing-text-primary)]">
                    {item.title}
                  </h3>
                </div>
              </div>
              <p className="text-[var(--landing-text-secondary)] text-sm leading-relaxed mb-6">
                {item.description}
              </p>
              <ul className="space-y-2">
                {item.points.map((point, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-[var(--landing-text-muted)]"
                  >
                    <span className="w-1 h-1 rounded-full bg-neutral-400 mt-2 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
