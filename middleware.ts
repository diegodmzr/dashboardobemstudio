import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/login", "/api/logout", "/forbidden", "/", "/f", "/api/forms", "/forgot-password", "/reset-password", "/api/forgot-password", "/api/reset-password", "/api/login/2fa"];

// Routes accessible aux ADMIN et SUPER_ADMIN
const ADMIN_ROUTES = [
  "/dashboard/clients",
  "/dashboard/stats",
  "/dashboard/demandes",
  "/dashboard/forms",
  "/dashboard/objectifs",
  "/dashboard/paiements",
  "/dashboard/statistiques",
];

// Routes accessible uniquement aux SUPER_ADMIN
const SUPER_ADMIN_ONLY_ROUTES = [
  "/dashboard/equipe",
];

// Routes partagées (accessible aux trois rôles, permissions gérées dans la page)
const SHARED_ROUTES = [
  "/dashboard/parametres",
  "/dashboard/notifications",
  "/dashboard/projets",
  "/dashboard/finances/devis",       // Client voit SES devis
  "/dashboard/finances/paiements",   // Client voit SES paiements
  "/dashboard/discussion",
  "/dashboard/client/devis",         // Vue détaillée du devis (pour signature)
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip public paths and static assets
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") || // Skip files with extensions (images, manifest, etc.)
    pathname.startsWith("/api/health")
  ) {
    return NextResponse.next();
  }

  const role = req.cookies.get("role")?.value;
  const userId = req.cookies.get("userId")?.value;

  if (!userId || !role) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Check if route is shared (allow all roles)
  const isSharedRoute = SHARED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isSharedRoute) {
    return NextResponse.next();
  }

  // Check if route is super-admin only
  const isSuperAdminOnlyRoute = SUPER_ADMIN_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isSuperAdminOnlyRoute && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/forbidden", req.url));
  }

  // Check if route is admin-accessible
  const isAdminRoute = ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isAdminRoute && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/forbidden", req.url));
  }

  // Check if accessing /dashboard/finances root (admin only)
  if (pathname === "/dashboard/finances" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/forbidden", req.url));
  }

  // All other /dashboard routes are allowed (permissions checked in pages)
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads/).*)"],
};
