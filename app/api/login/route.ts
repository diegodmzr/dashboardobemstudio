import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
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
    return NextResponse.redirect(new URL("/login?error=invalid_credentials", request.url));
  }

  const redirectPath = user.role === "ADMIN" ? "/dashboard" : "/dashboard/client";

  const res = NextResponse.redirect(new URL(redirectPath, request.url));
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
