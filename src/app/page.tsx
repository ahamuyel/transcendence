import { prisma } from "@/lib/prisma"
import { getServerLocale } from "@/lib/i18n/server"
import LandingNavbar from "@/components/landing/LandingNavbar"
import HeroSection from "@/components/landing/HeroSection"
import ProblemSection from "@/components/landing/ProblemSection"
import TransformationSection from "@/components/landing/TransformationSection"
import ProductEcosystem from "@/components/landing/ProductEcosystem"
import BenefitsSection from "@/components/landing/BenefitsSection"
import VisionSection from "@/components/landing/VisionSection"
import TrustSection from "@/components/landing/TrustSection"
import CTASection from "@/components/landing/CTASection"
import Footer from "@/components/landing/Footer"
import AnimateOnScroll from "@/components/landing/AnimateOnScroll"
import type { PlatformBranding, LandingStats, SchoolLogo } from "@/types/landing"

export const dynamic = "force-dynamic"

async function getData(): Promise<{ stats: LandingStats; branding: PlatformBranding; schools: SchoolLogo[] }> {
  const [
    schoolsCount,
    students,
    teachers,
    classes,
    parents,
    enrollments,
    subjects,
    results,
    applications,
    config,
    schoolsWithLogos,
  ] = await Promise.all([
    prisma.school.count({ where: { status: "ativa" } }),
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.class.count(),
    prisma.parent.count(),
    prisma.enrollment.count(),
    prisma.subject.count(),
    prisma.result.count(),
    prisma.application.count({ where: { status: "aprovada" } }),
    prisma.platformConfig.findUnique({ where: { id: "singleton" } }),
    prisma.school.findMany({
      where: { status: "ativa", logo: { not: null } },
      select: { name: true, logo: true },
    }),
  ])

  const branding: PlatformBranding = {
    name: config?.name || "Cur10usX",
    description: config?.description || null,
    logo: config?.logo || null,
    contactEmail: config?.contactEmail || "suporte@cur10usx.com",
    contactPhone: config?.contactPhone || null,
  }

  return {
    stats: {
      schools: schoolsCount,
      students,
      teachers,
      classes,
      parents,
      enrollments,
      subjects,
      results,
      applications,
    },
    branding,
    schools: schoolsWithLogos as SchoolLogo[],
  }
}

export default async function Home() {
  const { stats, branding, schools } = await getData()
  const locale = await getServerLocale()

  return (
    <div className="min-h-screen bg-[var(--landing-bg)] text-[var(--landing-text-primary)] selection:bg-primary/20 landing-scrollbar pt-16">
      <LandingNavbar branding={branding} locale={locale} />
      <HeroSection branding={branding} schools={schools} locale={locale} />
      <AnimateOnScroll>
        <ProblemSection locale={locale} />
      </AnimateOnScroll>
      <AnimateOnScroll>
        <TransformationSection locale={locale} />
      </AnimateOnScroll>
      <AnimateOnScroll>
        <ProductEcosystem locale={locale} />
      </AnimateOnScroll>
      <AnimateOnScroll>
        <BenefitsSection locale={locale} />
      </AnimateOnScroll>
      <AnimateOnScroll>
        <VisionSection locale={locale} />
      </AnimateOnScroll>
      <AnimateOnScroll>
        <TrustSection locale={locale} />
      </AnimateOnScroll>
      <CTASection locale={locale} />
      <Footer locale={locale} />
    </div>
  )
}
