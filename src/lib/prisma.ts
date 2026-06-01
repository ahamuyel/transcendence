import { PrismaClient } from "@prisma/client"
import { config } from "dotenv"
import path from "path"

config({ path: path.resolve(process.cwd(), "..", ".env") })

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
