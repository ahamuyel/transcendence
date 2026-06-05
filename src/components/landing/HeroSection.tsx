"use client"

import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n"
import { TheInfiniteGrid } from "@/components/ui/the-infinite-grid"
import { InfiniteSlider } from "@/components/ui/infinite-slider"
import { ProgressiveBlur } from "@/components/ui/progressive-blur"
import type { PlatformBranding, SchoolLogo } from "@/types/landing"

type Props = {
  branding: PlatformBranding
  schools: SchoolLogo[]
  locale?: string
}

export default function HeroSection({
  schools,
  locale = "pt",
}: Props) {
  const router = useRouter()
  const { t } = useTranslation(locale)

  const headline = t("landing.hero.headline")

  return (
    <TheInfiniteGrid className="min-h-screen pt-24 pb-20 md:pt-36 md:pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col min-h-[inherit]">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-background/80 backdrop-blur-sm text-xs text-muted-foreground mb-8">
              {t("landing.hero.badge")}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05] mb-6 whitespace-pre-line">
              {headline}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10">
              {t("landing.hero.subheadline")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => router.push("/registar-escola")}
                className="w-full sm:w-auto py-3 px-8 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer"
              >
                {t("landing.hero.cta")}
              </button>

              <button
                onClick={() => router.push("/signup")}
                className="w-full sm:w-auto py-3 px-8 rounded-lg text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all cursor-pointer"
              >
                {t("landing.hero.explore")}
              </button>
            </div>
          </div>
        </div>

        {schools.length > 0 && (
          <div className="mt-16 md:mt-24">
            <p className="text-center text-xs text-muted-foreground mb-6 uppercase tracking-widest">
              {t("landing.hero.trusted_by")}
            </p>

            <div className="relative h-[60px] w-full overflow-hidden">
              <InfiniteSlider duration={30} gap={64}>
                {schools.map((school, i) => (
                  <div
                    key={i}
                    className="flex h-[60px] w-40 items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all"
                  >
                    <img
                      src={school.logo}
                      alt={school.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ))}
              </InfiniteSlider>
              <ProgressiveBlur
                className="pointer-events-none absolute top-0 left-0 h-full w-[120px]"
                direction="left"
                blurIntensity={1}
              />
              <ProgressiveBlur
                className="pointer-events-none absolute top-0 right-0 h-full w-[120px]"
                direction="right"
                blurIntensity={1}
              />
            </div>
          </div>
        )}
      </div>
    </TheInfiniteGrid>
  )
}
