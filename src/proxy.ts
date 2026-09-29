import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export default function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAdminPath = path.startsWith("/admin") && path !== "/admin/login";

  const token = request.cookies.get("admin_auth")?.value;

  if (isAdminPath && token !== "authenticated") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (path === "/admin/login" && token === "authenticated") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
