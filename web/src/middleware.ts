import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_STUDIO_COOKIE = "2gtechlab_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdmin = pathname.startsWith("/admin");
  const isStudio = pathname.startsWith("/studio");

  if (!isAdmin && !isStudio) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_STUDIO_COOKIE)?.value;
  if (!token) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("login", "1");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/studio/:path*"],
};
