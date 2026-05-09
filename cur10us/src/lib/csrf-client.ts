let csrfTokenCache: string | null = null

/**
 * Fetch and cache the CSRF token from the API
 */
export async function getCsrfToken(): Promise<string> {
  if (csrfTokenCache) {
    return csrfTokenCache
  }

  const res = await fetch("/api/auth/csrf-token", {
    credentials: "include",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch CSRF token")
  }

  const data = await res.json()
  csrfTokenCache = data.csrfToken
  return csrfTokenCache!
}

/**
 * Reset the CSRF token cache (e.g., after logout)
 */
export function resetCsrfToken() {
  csrfTokenCache = null
}

/**
 * Helper to make a CSRF-protected POST request
 */
export async function csrfPost(url: string, body: Record<string, unknown>) {
  const csrfToken = await getCsrfToken()

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-csrf-token": csrfToken,
    },
    credentials: "include",
    body: JSON.stringify(body),
  })

  return res
}
