import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const authPages = ["/signin", "/signup", "/forgot-password", "/registar-escola", "/verify-email"]
// Pages that should be accessible by both authenticated and unauthenticated users
const alwaysAccessible = ["/reset-password"]
const publicPaths = ["/", "/aplicacao", "/aplicacao/status", "/maintenance"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public paths — always accessible
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // API routes — auth is enforced per-route via requireRole/requirePermission
  // Only allow explicitly public API endpoints without session check
  const publicApiPrefixes = ["/api/auth/", "/api/applications/status", "/api/platform/status", "/api/schools/public"]
  if (pathname.startsWith("/api/")) {
    if (publicApiPrefixes.some((p) => pathname.startsWith(p))) {
      return NextResponse.next()
    }
    // For protected API routes, check session cookie existence as a first gate
    const hasSession =
      req.cookies.has("authjs.session-token") ||
      req.cookies.has("next-auth.session-token")
    if (!hasSession) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Always accessible pages (e.g., reset-password)
  if (alwaysAccessible.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Check for session cookie existence (not the full session, to avoid Edge + Prisma issue)
  // Auth.js v5 uses "authjs.session-token" by default
  // Fallback to legacy "next-auth.session-token" if needed
  const hasSessionCookie =
    req.cookies.has("authjs.session-token") ||
    req.cookies.has("next-auth.session-token")

  // Auth pages — redirect to minha-area if already logged in
  if (authPages.some((p) => pathname.startsWith(p))) {
    if (hasSessionCookie) {
      // Check if there's a stored callback URL from OAuth flow (priority over default redirect)
      const storedCallbackUrl = req.cookies.get("next-auth-callback-url")?.value
      if (storedCallbackUrl && storedCallbackUrl.startsWith("/")) {
        const response = NextResponse.redirect(new URL(storedCallbackUrl, req.url))
        // Clear the cookie after using it
        response.cookies.set("next-auth-callback-url", "", { maxAge: 0, path: "/" })
        return response
      }
      return NextResponse.redirect(new URL("/minha-area", req.url))
    }
    return NextResponse.next()
  }

  // Not logged in — redirect to signin
  if (!hasSessionCookie) {
    const signinUrl = new URL("/signin", req.url)
    signinUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signinUrl)
  }

  // For authenticated users, let server-side handling take over
  // (session validation happens in API routes and page components)
  return NextResponse.next()
}

// Update matcher to ensure middleware doesn't interfere with Next.js internals
export const config = {
  matcher: ["/((?!_next/static|_next/image|_next/data|_next/font|favicon.ico|.*\\.png$|.*\\.svg$).*)"],
}
