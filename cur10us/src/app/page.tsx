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
      <LandingPageClient stats={stats} branding={branding} topSchools={topSchools} />
    </main>
  );
}
