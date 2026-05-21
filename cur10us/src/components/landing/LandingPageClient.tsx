"use client"

import { useMemo, useState } from "react"
import LandingNavbar from "@/components/landing/LandingNavbar"
import HeroSection from "@/components/landing/HeroSection"
import StatsSection from "@/components/landing/StatsSection"
import HowItWorksSection from "@/components/landing/HowItWorksSection"
import FeaturesSection from "@/components/landing/FeaturesSection"
import ProfilesSection from "@/components/landing/ProfilesSection"
import CTASection from "@/components/landing/CTASection"
import Footer from "@/components/landing/Footer"
import SamacacaPattern from "@/components/landing/SamacacaPattern"
import type { PlatformBranding } from "@/types/landing"
import { landingCopy, type LandingLanguage } from "./landing-i18n"

type Props = {
  stats: {
    schools: number
    students: number
    teachers: number
    classes: number
  }
  branding: PlatformBranding
  topSchools: { name: string }[]
}

export default function LandingPageClient({ stats, branding, topSchools }: Props) {
  const [language, setLanguage] = useState<LandingLanguage>("pt")
  const copy = useMemo(() => landingCopy[language], [language])

  return (
    <>
      <SamacacaPattern />
      <LandingNavbar
        branding={branding}
        copy={copy.nav}
        language={language}
        onLanguageChange={setLanguage}
      />
      <HeroSection branding={branding} schools={topSchools} copy={copy.hero} />
      <StatsSection {...stats} copy={copy.stats} />
      <HowItWorksSection copy={copy.how} />
      <FeaturesSection copy={copy.features} />
      <ProfilesSection copy={copy.profiles} />
      <CTASection copy={copy.cta} />
      <Footer branding={branding} copy={copy.footer} />
    </>
  )
}
