"use client"

import { useTranslation } from "@/lib/i18n"

type Props = { locale?: string }

export default function ProblemSection({ locale = "pt" }: Props) {
  const { t, tv } = useTranslation(locale)
  const items = tv("landing.problem.items") as {
    title: string
    description: string
  }[]

  return (
    <section
      id="problems"
      className="py-20 md:py-32 bg-[var(--landing-bg-secondary)] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16 md:mb-20">
          <span className="text-xs text-[var(--landing-text-dim)] uppercase tracking-widest block mb-3">
            {t("landing.problem.tag")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--landing-text-primary)] leading-tight mb-6">
            {t("landing.problem.headline")}
          </h2>
          <p className="text-[var(--landing-text-secondary)] text-sm md:text-base leading-relaxed">
            {t("landing.problem.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="border border-[var(--landing-border)] bg-[var(--landing-bg)] p-8 rounded-xl transition-colors hover:border-[var(--landing-border-strong)]"
            >
              <span className="text-sm font-bold text-[var(--landing-text-dim)] mb-3 block">
                0{idx + 1}
              </span>
              <h3 className="text-lg font-bold text-[var(--landing-text-primary)] tracking-tight mb-3">
                {item.title}
              </h3>
              <p className="text-[var(--landing-text-secondary)] text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
