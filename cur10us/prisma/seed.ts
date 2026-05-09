import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("=== Seed Cur10usX ===\n")

  // ─── 1. Super Admin ────────────────────────────────────────────
  const hashedPassword = await hash("cur10usx", 12)

  await prisma.user.upsert({
    where: { email: "super@cur10usx.com" },
    update: { hashedPassword, role: "super_admin", isActive: true, emailVerified: true, provider: "credentials" },
    create: {
      name: "Super Admin",
      email: "super@cur10usx.com",
      hashedPassword,
      role: "super_admin",
      isActive: true,
      emailVerified: true,
      provider: "credentials",
    },
  })
  console.log("✓ Super Admin: super@cur10usx.com / cur10usx")

  // ─── 2. Platform Config ────────────────────────────────────────
  await prisma.platformConfig.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      name: "Cur10usX",
      description: "Plataforma de Gestão Escolar",
      allowRegistration: true,
      maintenanceMode: false,
    },
  })
  console.log("✓ Platform Config")

  // ─── 3. Ciclos do Sistema Educativo Angolano ───────────────────
  const primario = await prisma.educationCycle.upsert({
    where: { name: "Ensino Primário" },
    update: {},
    create: {
      name: "Ensino Primário",
      level: "primario",
      startGrade: 1,
      endGrade: 6,
    },
  })

  const primeiroCiclo = await prisma.educationCycle.upsert({
    where: { name: "1.º Ciclo do Ensino Secundário" },
    update: {},
    create: {
      name: "1.º Ciclo do Ensino Secundário",
      level: "primeiro_ciclo",
      startGrade: 7,
      endGrade: 9,
    },
  })

  const segundoCiclo = await prisma.educationCycle.upsert({
    where: { name: "2.º Ciclo / Ensino Médio" },
    update: {},
    create: {
      name: "2.º Ciclo / Ensino Médio",
      level: "segundo_ciclo",
      startGrade: 10,
      endGrade: 13,
    },
  })
  console.log("✓ 3 Ciclos de Ensino")

  // ─── 4. 13 Classes Globais ─────────────────────────────────────
  const classNames = [
    { grade: 1, name: "1.ª Classe", cycleId: primario.id },
    { grade: 2, name: "2.ª Classe", cycleId: primario.id },
    { grade: 3, name: "3.ª Classe", cycleId: primario.id },
    { grade: 4, name: "4.ª Classe", cycleId: primario.id },
    { grade: 5, name: "5.ª Classe", cycleId: primario.id },
    { grade: 6, name: "6.ª Classe", cycleId: primario.id },
    { grade: 7, name: "7.ª Classe", cycleId: primeiroCiclo.id },
    { grade: 8, name: "8.ª Classe", cycleId: primeiroCiclo.id },
    { grade: 9, name: "9.ª Classe", cycleId: primeiroCiclo.id },
    { grade: 10, name: "10.ª Classe", cycleId: segundoCiclo.id },
    { grade: 11, name: "11.ª Classe", cycleId: segundoCiclo.id },
    { grade: 12, name: "12.ª Classe", cycleId: segundoCiclo.id },
    { grade: 13, name: "13.ª Classe", cycleId: segundoCiclo.id },
  ]

  for (const cls of classNames) {
    await prisma.globalClass.upsert({
      where: { grade: cls.grade },
      update: { cycleId: cls.cycleId },
      create: cls,
    })
  }
  console.log("✓ 13 Classes Globais")

  // ─── 5. Disciplinas Globais ────────────────────────────────────
  const subjects = [
    { name: "Língua Portuguesa", code: "LP" },
    { name: "Matemática", code: "MAT" },
    { name: "Ciências da Natureza", code: "CN" },
    { name: "Física", code: "FIS" },
    { name: "Química", code: "QUI" },
    { name: "Biologia", code: "BIO" },
    { name: "Geografia", code: "GEO" },
    { name: "História", code: "HIS" },
    { name: "Educação Moral e Cívica", code: "EMC" },
    { name: "Educação Física", code: "EF" },
    { name: "Educação Visual e Plástica", code: "EVP" },
    { name: "Educação Musical", code: "EM" },
    { name: "Inglês", code: "ING" },
    { name: "Francês", code: "FRA" },
    { name: "Filosofia", code: "FIL" },
    { name: "Informática", code: "INF" },
    { name: "Empreendedorismo", code: "EMP" },
  ]

  for (const sub of subjects) {
    await prisma.globalSubject.upsert({
      where: { code: sub.code },
      update: {},
      create: sub,
    })
  }
  console.log(`✓ ${subjects.length} Disciplinas Globais`)

  // ─── 6. Cursos Globais ─────────────────────────────────────────
  const courses = [
    { name: "Ciências Físicas e Biológicas", code: "CFB" },
    { name: "Ciências Económicas e Jurídicas", code: "CEJ" },
    { name: "Ciências Humanas", code: "CH" },
    { name: "Artes Visuais", code: "AV" },
    { name: "Informática", code: "CINF" },
    { name: "Ensino Geral", code: "EG" },
  ]

  for (const course of courses) {
    await prisma.globalCourse.upsert({
      where: { code: course.code },
      update: {},
      create: course,
    })
  }
  console.log(`✓ ${courses.length} Cursos Globais`)

  // ─── 7. Configuração Global de Avaliação ───────────────────────
  await prisma.globalGradingConfig.upsert({
    where: { classGrade_courseId: { classGrade: 0, courseId: "" } },
    update: {},
    create: {
      classGrade: null,
      courseId: null,
      passingGrade: 10,
      resourceMinGrade: 8,
      maxFailedSubjects: 2,
      trimesterWeights: [0.33, 0.33, 0.34],
      roundingMode: "arredondar",
      roundingScale: 1,
      recursoAllowed: true,
      active: true,
    },
  }).catch(() => {
    // If unique constraint fails, try create directly
    return prisma.globalGradingConfig.create({
      data: {
        classGrade: null,
        courseId: null,
        passingGrade: 10,
        resourceMinGrade: 8,
        maxFailedSubjects: 2,
        trimesterWeights: [0.33, 0.33, 0.34],
        roundingMode: "arredondar",
        roundingScale: 1,
        recursoAllowed: true,
        active: true,
      },
    }).catch(() => {
      console.log("  (config global já existe, ignorado)")
    })
  })
  console.log("✓ Configuração Global de Avaliação (default)")

  // ─── Fix: Ensure all existing users have emailVerified = true ────
  const updated = await prisma.user.updateMany({
    where: { emailVerified: false },
    data: { emailVerified: true },
  })
  if (updated.count > 0) {
    console.log(`✓ ${updated.count} utilizadores corrigidos (emailVerified → true)`)
  }

  console.log("\n=== Seed concluído com sucesso! ===")
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
