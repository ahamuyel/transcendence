import { revalidatePath } from "next/cache"

/**
 * Revalidate all paths and data related to a specific school
 * Call this after any admin updates to school data
 */
export function revalidateSchoolData(schoolId: string) {
  // Revalidate school-specific API routes
  revalidatePath("/api/school-settings")
  revalidatePath("/api/school-stats")
  revalidatePath("/api/school-catalog/subjects")
  revalidatePath("/api/school-catalog/courses")
  revalidatePath("/api/school-catalog/classes")

  // Revalidate admin school pages
  revalidatePath("/admin/schools")
  revalidatePath(`/admin/schools/${schoolId}`)

  // Revalidate dashboard pages that show school data
  revalidatePath("/dashboard")
  revalidatePath("/settings")
  revalidatePath("/settings/school")
  revalidatePath("/minha-area")

  // Revalidate public school listings
  revalidatePath("/aplicacao")

}

/**
 * Revalidate global platform settings
 */
export function revalidatePlatformData() {
  revalidatePath("/admin")
  revalidatePath("/admin/stats")
  revalidatePath("/admin/settings")
  revalidatePath("/api/admin/dashboard")
  revalidatePath("/api/admin/settings")

}

/**
 * Revalidate all data for a specific user
 */
export function revalidateUserData(userId: string) {
  revalidatePath("/api/user/schools")
  revalidatePath("/minha-area")

}
