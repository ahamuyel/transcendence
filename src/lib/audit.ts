import { prisma } from "@/lib/prisma"

interface AuditEntry {
  userId: string
  userName: string
  userRole: string
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "ACTIVATE" | "DEACTIVATE" | "TRANSFER" | "IMPORT" | "FINALIZE"
  entity: string
  entityId?: string
  schoolId?: string | null
  description?: string
  oldValue?: unknown
  newValue?: unknown
  ipAddress?: string
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        userName: entry.userName,
        userRole: entry.userRole,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        schoolId: entry.schoolId ?? undefined,
        description: entry.description,
        oldValue: entry.oldValue ? JSON.parse(JSON.stringify(entry.oldValue)) : undefined,
        newValue: entry.newValue ? JSON.parse(JSON.stringify(entry.newValue)) : undefined,
        ipAddress: entry.ipAddress,
      },
    })
  } catch {
    // Audit logging should never break the main flow
    console.error("[AuditLog] Failed to log:", entry.action, entry.entity)
  }
}

/** Helper to extract session info for audit */
export function auditUser(session: { user: { id: string; name?: string | null; role?: string } }) {
  return {
    userId: session.user.id,
    userName: session.user.name || "Unknown",
    userRole: session.user.role || "unknown",
  }
}
