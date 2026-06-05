"use client"

import { useTranslation } from "@/lib/i18n"

type Props = {
  locale?: string
  onRequestDemo?: () => void
}

export default function CTASection({ locale = "pt", onRequestDemo }: Props) {
  const { t } = useTranslation(locale)

  return (
    <section className="py-20 md:py-32 bg-[var(--landing-bg-dark)] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs text-[var(--landing-text-dark-secondary)] uppercase tracking-widest block mb-3">
            {t("landing.cta.tag")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--landing-text-dark-primary)] leading-none mb-6">
            {t("landing.cta.headline")}
          </h2>
          <p className="text-[var(--landing-text-dark-secondary)] text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-10">
            {t("landing.cta.description")}
          </p>
          <button
            onClick={onRequestDemo}
            className="inline-flex py-3 px-8 rounded-lg text-sm font-semibold bg-white text-neutral-900 hover:bg-neutral-100 transition-all cursor-pointer"
          >
            {t("landing.cta.button")}
          </button>
        </div>
      </div>
    </section>
  )
}
