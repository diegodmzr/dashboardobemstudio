import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  console.log("DEBUG: DATABASE_URL =", process.env.DATABASE_URL);
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    // Fallback for clearer error or redirect back to login?
    // Returning JSON for form submission might be tricky if it's a standard form submit
    // But sticking to standard behavior:
    return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) {
    return NextResponse.redirect(new URL("/login?error=invalid_credentials", request.url));
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
  }

  // Check if 2FA is enabled using Raw SQL to bypass stale Prisma Client on Windows
  const dbUsers = await (prisma as any).$queryRawUnsafe(
    `SELECT twoFactorEnabled FROM User WHERE id = ? LIMIT 1`,
    user.id
  );

  // Note: on SQLite/MariaDB, boolean might be returned as 1/0 or true/false
  if (dbUsers[0]?.twoFactorEnabled && (dbUsers[0].twoFactorEnabled === true || dbUsers[0].twoFactorEnabled === 1)) {
    return NextResponse.json({
      requires2FA: true,
      userId: user.id
    });
  }

  const redirectPath = "/dashboard";
  const res = NextResponse.json({ success: true, redirect: redirectPath });
  res.cookies.set({
    name: "userId",
    value: user.id,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  });
  res.cookies.set({
    name: "role",
    value: user.role,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
