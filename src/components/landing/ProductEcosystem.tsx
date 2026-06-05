"use client"

import { useTranslation } from "@/lib/i18n"

type Props = { locale?: string }

type ModuleData = {
  id: string
  title: string
  description: string
}

export default function ProductEcosystem({ locale = "pt" }: Props) {
  const { t, tv } = useTranslation(locale)

  const modules = tv("landing.ecosystem.modules") as ModuleData[]

  return (
    <section className="py-20 md:py-32 bg-[var(--landing-bg-dark)] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-800/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mb-16 md:mb-20">
          <span className="text-xs text-[var(--landing-text-dark-secondary)] uppercase tracking-widest block mb-3">
            {t("landing.ecosystem.tag")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--landing-text-dark-primary)] leading-none mb-6">
            {t("landing.ecosystem.headline")}
          </h2>
          <p className="text-[var(--landing-text-dark-secondary)] text-sm md:text-base leading-relaxed">
            {t("landing.ecosystem.description")}
          </p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map((mod, idx) => (
              <div
                key={mod.id}
                className="group border border-[var(--landing-border-dark)] bg-[var(--landing-bg-dark-elevated)] p-6 rounded-xl transition-all duration-300 hover:border-neutral-600"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 text-xs font-bold">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--landing-text-dark-primary)]">
                    {mod.title}
                  </h3>
                </div>
                <p className="text-xs text-[var(--landing-text-dark-secondary)] leading-relaxed">
                  {mod.description}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <div className="inline-flex items-center gap-3 px-4 py-3 rounded-full border border-[var(--landing-border-dark)] bg-[var(--landing-bg-dark-elevated)]">
              <div className="w-6 h-6 rounded-lg bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-300">
                C
              </div>
              <span className="text-xs text-[var(--landing-text-dark-secondary)]">
                Cur10usX — {t("landing.ecosystem.capabilities")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
