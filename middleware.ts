import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/login", "/api/logout", "/forbidden", "/", "/f", "/api/forms", "/forgot-password", "/reset-password", "/api/forgot-password", "/api/reset-password"];

// Routes accessible uniquement aux ADMIN
const ADMIN_ONLY_ROUTES = [
  "/dashboard/clients",
  "/dashboard/stats",
];

// Routes partagées (accessible aux deux rôles, permissions gérées dans la page)
const SHARED_ROUTES = [
  "/dashboard/parametres",
  "/dashboard/notifications",
  "/dashboard/projets",
  "/dashboard/finances/devis",       // Client voit SES devis
  "/dashboard/finances/paiements",   // Client voit SES paiements
  "/dashboard/discussion",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip public paths and static assets
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/health")
  ) {
    return NextResponse.next();
  }

  const role = req.cookies.get("role")?.value;
  const userId = req.cookies.get("userId")?.value;

  if (!userId || !role) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Check if route is shared (allow both roles)
  const isSharedRoute = SHARED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isSharedRoute) {
    return NextResponse.next();
  }

  // Check if route is admin-only
  const isAdminOnlyRoute = ADMIN_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isAdminOnlyRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/forbidden", req.url));
  }

  // Check if accessing /dashboard/finances root (admin only)
  if (pathname === "/dashboard/finances" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/forbidden", req.url));
  }

  // All other /dashboard routes are allowed (permissions checked in pages)
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
