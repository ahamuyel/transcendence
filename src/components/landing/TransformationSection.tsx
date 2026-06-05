"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useTranslation } from "@/lib/i18n"

type Props = { locale?: string }

export default function TransformationSection({ locale = "pt" }: Props) {
  const { t, tv } = useTranslation(locale)
  const [activeTab, setActiveTab] = useState<"legacy" | "curious">("curious")

  const steps = tv("landing.transformation.steps") as {
    title: string
    before: { title: string; items: string[]; status: string }
    after: { title: string; items: string[]; status: string }
  }[]

  return (
    <section
      id="transformation"
      className="py-20 md:py-32 bg-[var(--landing-bg)] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16 md:mb-20">
          <span className="text-xs text-[var(--landing-text-dim)] uppercase tracking-widest block mb-3">
            {t("landing.transformation.tag")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--landing-text-primary)] tracking-tight leading-none mb-6">
            {t("landing.transformation.headline")}
          </h2>
          <p className="text-[var(--landing-text-secondary)] text-sm md:text-base leading-relaxed">
            {t("landing.transformation.description")}
          </p>

          <div className="inline-flex p-1 bg-neutral-100 rounded-lg mt-8">
            <button
              onClick={() => setActiveTab("legacy")}
              className={`py-2 px-5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === "legacy"
                  ? "bg-white text-neutral-900 shadow-sm border border-neutral-200"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {t("landing.transformation.legacy")}
            </button>
            <button
              onClick={() => setActiveTab("curious")}
              className={`py-2 px-5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === "curious"
                  ? "bg-white text-neutral-900 shadow-sm border border-neutral-200"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {t("landing.transformation.platform")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="border border-[var(--landing-border)] bg-[var(--landing-bg-elevated)] p-6 md:p-8 rounded-xl transition-all duration-300 hover:border-[var(--landing-border-strong)]"
            >
              <span className="text-xs text-[var(--landing-text-dim)] uppercase tracking-widest block mb-6">
                0{idx + 1} / {step.title}
              </span>

              <AnimatePresence mode="wait">
                {activeTab === "legacy" ? (
                  <motion.div
                    key="legacy-view"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <h4 className="text-sm font-bold text-red-600 mb-4">
                      {step.before.title}
                    </h4>
                    <ul className="space-y-3">
                      {step.before.items.map((item, i) => (
                        <li
                          key={i}
                          className="text-[var(--landing-text-muted)] text-sm leading-relaxed flex items-start gap-2"
                        >
                          <span className="text-red-300 mt-0.5 select-none">−</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ) : (
                  <motion.div
                    key="curious-view"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <h4 className="text-sm font-bold text-emerald-600 mb-4">
                      {step.after.title}
                    </h4>
                    <ul className="space-y-3">
                      {step.after.items.map((item, i) => (
                        <li
                          key={i}
                          className="text-[var(--landing-text-primary)] text-sm leading-relaxed flex items-start gap-2"
                        >
                          <span className="text-emerald-500 font-bold mt-0.5 select-none">
                            ✓
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
