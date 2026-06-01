/**
 * Build Prisma orderBy from sortBy/sortDir query params.
 * Supports nested fields via dot notation (e.g. "student.name").
 */
export function buildOrderBy(
  searchParams: URLSearchParams,
  allowedFields: string[],
  defaultSort: Record<string, "asc" | "desc"> = { createdAt: "desc" }
): Record<string, unknown> {
  const sortBy = searchParams.get("sortBy") || ""
  const sortDir = (searchParams.get("sortDir") || "asc") as "asc" | "desc"

  if (sortBy && allowedFields.includes(sortBy)) {
    // Handle nested fields like "student.name"
    if (sortBy.includes(".")) {
      const [relation, field] = sortBy.split(".")
      return { [relation]: { [field]: sortDir } }
    }
    return { [sortBy]: sortDir }
  }

  return defaultSort
}
