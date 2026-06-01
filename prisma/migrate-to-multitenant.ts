/**
 * Migration script: single-tenant → multi-tenant
 *
 * Run AFTER `npx prisma migrate dev` has applied the schema changes.
 * Usage: npx tsx prisma/migrate-to-multitenant.ts
 */
import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting multi-tenant migration...")

  // 1. Create default school
  const school = await prisma.school.upsert({
    where: { slug: "demo-escola" },
    update: {},
    create: {
      name: "Colégio Esperança",
      slug: "colegio-esperanca",
      email: "contacto@colegio-esperanca.ao",
      phone: "923456789",
      address: "Rua da Missão, 45",
      city: "Luanda",
      provincia: "Luanda",
      status: "ativa",
    },
  })
  console.log(`  School created/found: ${school.name} (${school.id})`)

  // 2. Assign schoolId to all Teachers
  const teacherResult = await prisma.teacher.updateMany({
    where: { schoolId: school.id }, // no-op filter to avoid type error — we use raw below
    data: {},
  })
  // Use raw SQL to update teachers without schoolId
  await prisma.$executeRaw`UPDATE "Teacher" SET "schoolId" = ${school.id} WHERE "schoolId" IS NULL OR "schoolId" = ''`
  console.log("  Teachers assigned to demo school")

  // 3. Assign schoolId to all Students
  await prisma.$executeRaw`UPDATE "Student" SET "schoolId" = ${school.id} WHERE "schoolId" IS NULL OR "schoolId" = ''`
  console.log("  Students assigned to demo school")

  // 4. Assign schoolId to all Parents
  await prisma.$executeRaw`UPDATE "Parent" SET "schoolId" = ${school.id} WHERE "schoolId" IS NULL OR "schoolId" = ''`
  console.log("  Parents assigned to demo school")

  // 5. Convert admin → school_admin and assign schoolId
  await prisma.$executeRaw`UPDATE "User" SET "role" = 'school_admin', "schoolId" = ${school.id} WHERE "role" = 'admin'`
  console.log("  admin users converted to school_admin")

  // 6. Assign schoolId to remaining users (teacher/student/parent) without one
  await prisma.$executeRaw`UPDATE "User" SET "schoolId" = ${school.id} WHERE "schoolId" IS NULL AND "role" NOT IN ('super_admin')`
  console.log("  Remaining users assigned to demo school")

  // 7. Set isActive = true for all existing users
  await prisma.$executeRaw`UPDATE "User" SET "isActive" = true WHERE "isActive" = false`
  console.log("  All existing users activated")

  // 8. Create super_admin user
  const hashedPassword = await hash("cur10usx", 12)
  await prisma.user.upsert({
    where: { email: "super@cur10usx.com" },
    update: { role: "super_admin", isActive: true },
    create: {
      name: "Super Admin",
      email: "super@cur10usx.com",
      hashedPassword,
      role: "super_admin",
      isActive: true,
    },
  })
  console.log("  Super admin created: super@cur10usx.com")

  console.log("\nMigration complete!")
}

main()
  .catch((e) => {
    console.error("Migration failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
