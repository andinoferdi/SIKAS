import { NextRequest, NextResponse } from "next/server"

export function proxy(request: NextRequest) {
  // Proxy hanya menangani routing dasar
  // Auth checks dilakukan di Server Components (layouts)

  const { pathname } = request.nextUrl

  // Homepage langsung dilanjutkan
  if (pathname === "/") {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
}
