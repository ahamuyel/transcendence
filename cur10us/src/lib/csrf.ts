import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createHash, randomBytes } from "crypto"

const CSRF_COOKIE_NAME = "csrf-token"
const CSRF_HEADER_NAME = "x-csrf-token"
const TOKEN_LENGTH = 32

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  return randomBytes(TOKEN_LENGTH).toString("hex")
}

/**
 * Hash a CSRF token for secure storage
 */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

/**
 * Set a CSRF token as an httponly cookie and return the plain token
 * to be sent in the response body (for double-submit pattern)
 */
export async function setCsrfCookie(): Promise<string> {
  const token = generateCsrfToken()
  const hashedToken = hashToken(token)

  const cookieStore = await cookies()
  cookieStore.set(CSRF_COOKIE_NAME, hashedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60, // 1 hour
    path: "/",
  })

  return token
}

/**
 * Validate a CSRF token from the request
 * Expects:
 * - Cookie with hashed token
 * - Header with plain token
 */
export async function validateCsrfToken(req: Request): Promise<boolean> {
  const cookieStore = await cookies()
  const hashedCookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value
  const headerToken = req.headers.get(CSRF_HEADER_NAME)

  if (!hashedCookieToken || !headerToken) {
    return false
  }

  const hashedHeaderToken = hashToken(headerToken)
  return hashedCookieToken === hashedHeaderToken
}

/**
 * Middleware to add CSRF protection to an API route
 * Usage: wrap your handler with this
 */
export function withCsrf<T>(
  handler: (req: Request, ctx: T) => Promise<NextResponse>
) {
  return async function csrfProtectedHandler(
    req: Request,
    ctx: T
  ): Promise<NextResponse> {
    // Only protect state-changing methods
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      return handler(req, ctx)
    }

    const isValid = await validateCsrfToken(req)
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or missing CSRF token" },
        { status: 403 }
      )
    }

    return handler(req, ctx)
  }
}

/**
 * Helper to create a CSRF-protected response with token
 */
export function csrfResponse(data: Record<string, unknown>, csrfToken: string): NextResponse {
  return NextResponse.json({
    ...data,
    csrfToken,
  })
}
