import { NextResponse } from "next/server";
import { auth } from "@/auth";

const ADMIN_PREFIX = "/admin";
const PROTECTED_PREFIXES = ["/dashboard", "/draft", "/account", "/admin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const user = req.auth?.user;
  if (!user) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith(ADMIN_PREFIX) && user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/draft/:path*", "/account/:path*", "/admin/:path*"],
};
