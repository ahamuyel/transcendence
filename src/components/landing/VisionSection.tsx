"use client"

import { useTranslation } from "@/lib/i18n"

type Props = { locale?: string }

type PointData = {
  title: string
  description: string
}

export default function VisionSection({ locale = "pt" }: Props) {
  const { t, tv } = useTranslation(locale)

  const points = tv("landing.vision.points") as PointData[]

  return (
    <section
      id="vision"
      className="py-20 md:py-32 bg-[var(--landing-bg-secondary)] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16 md:mb-20">
          <span className="text-xs text-[var(--landing-text-dim)] uppercase tracking-widest block mb-3">
            {t("landing.vision.tag")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--landing-text-primary)] leading-none mb-6">
            {t("landing.vision.headline")}
          </h2>
          <p className="text-[var(--landing-text-secondary)] text-sm md:text-base leading-relaxed">
            {t("landing.vision.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {points.map((point, idx) => (
            <div
              key={idx}
              className="border border-[var(--landing-border)] bg-[var(--landing-bg)] p-8 rounded-xl transition-all duration-300 hover:border-[var(--landing-border-strong)] relative"
            >
              <span className="text-5xl font-bold text-[var(--landing-text-dim)]/10 absolute top-4 right-4 select-none">
                0{idx + 1}
              </span>
              <h3 className="text-lg font-bold text-[var(--landing-text-primary)] tracking-tight mb-4">
                {point.title}
              </h3>
              <p className="text-[var(--landing-text-secondary)] text-sm leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
