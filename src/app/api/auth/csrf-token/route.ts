import { NextResponse } from "next/server"
import { setCsrfCookie } from "@/lib/csrf"

/**
 * GET /api/auth/csrf-token
 * Returns a CSRF token to the client and sets it as an httponly cookie
 */
export async function GET() {
  const token = await setCsrfCookie()
  return NextResponse.json({ csrfToken: token })
}
