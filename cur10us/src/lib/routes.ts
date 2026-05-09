export function getDashboardPath(id?: string | null): string {
  return `/dashboard/${id || ""}`
}
