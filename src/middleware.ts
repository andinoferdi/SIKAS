import { NextResponse, type NextRequest } from "next/server"
import { jwtVerify } from "jose"

const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || "keuangan-andino-sayu-secret-key-2026-very-secure-app"
)

async function verifySession(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, SECRET_KEY)
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value
  const isAuthPage = request.nextUrl.pathname === "/login"
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard")
  const isHomePage = request.nextUrl.pathname === "/"

  const isValidSession = session ? await verifySession(session) : false

  if (isHomePage) {
    if (isValidSession) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (!isValidSession && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isValidSession && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
  ],
}
