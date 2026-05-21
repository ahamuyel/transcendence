import { prisma } from "@/lib/prisma";
import LandingPageClient from "@/components/landing/LandingPageClient";

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
    <main className="landing-shell min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 scroll-smooth">
      <div className="landing-bg" aria-hidden="true">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="geo" width="120" height="120" patternUnits="userSpaceOnUse">
              <polygon points="60,5 115,60 60,115 5,60" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
              <polygon points="60,25 95,60 60,95 25,60" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.15" />
              <polygon points="60,42 78,60 60,78 42,60" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.1" />
              <line x1="60" y1="0" x2="60" y2="120" stroke="currentColor" strokeWidth="0.3" opacity="0.08" />
              <line x1="0" y1="60" x2="120" y2="60" stroke="currentColor" strokeWidth="0.3" opacity="0.08" />
              <polyline points="0,15 15,0" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
              <polyline points="105,0 120,15" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
              <polyline points="0,105 15,120" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
              <polyline points="105,120 120,105" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
              <circle cx="60" cy="60" r="1.5" fill="currentColor" opacity="0.2" />
              <circle cx="5" cy="60" r="1" fill="currentColor" opacity="0.12" />
              <circle cx="115" cy="60" r="1" fill="currentColor" opacity="0.12" />
              <circle cx="60" cy="5" r="1" fill="currentColor" opacity="0.12" />
              <circle cx="60" cy="115" r="1" fill="currentColor" opacity="0.12" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#geo)" />
        </svg>
      </div>
      <div className="landing-bg-soft" aria-hidden="true" />
      <LandingPageClient stats={stats} branding={branding} topSchools={topSchools} />
    </main>
  );
}
