import { prisma } from "@/lib/prisma";
import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import StatsSection from "@/components/landing/StatsSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ProfilesSection from "@/components/landing/ProfilesSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { PlatformBranding } from "@/types/landing";

export const dynamic = "force-dynamic";

async function getData() {
  const [schoolsCount, students, teachers, classes, config, topSchools] =
    await Promise.all([
      prisma.school.count({ where: { status: "ativa" } }),
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.class.count(),
      prisma.platformConfig.findUnique({
        where: { id: "singleton" },
      }),
      prisma.school.findMany({
        where: { status: "ativa" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { name: true },
      }),
    ]);

  const branding = {
    name: config?.name || "Cur10usX",
    description: config?.description || null,
    logo: config?.logo || null,
    contactEmail: config?.contactEmail || "suporte@cur10usx.com",
    contactPhone: config?.contactPhone || null,
  };

  return {
    stats: { schools: schoolsCount, students, teachers, classes },
    branding,
    topSchools,
  };
}

export default async function Home() {
  const { stats, branding, topSchools } = await getData();

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 scroll-smooth">
      <LandingNavbar branding={branding} />
      <HeroSection branding={branding} schools={topSchools} />
      <StatsSection {...stats} />
      <HowItWorksSection />
      <FeaturesSection />
      <ProfilesSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer branding={branding} />
    </main>
  );
}
