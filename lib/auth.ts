import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CLIENT" | "SUPER_ADMIN" | "PARTNER";
  avatar?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  siret?: string | null;
  phone?: string | null;
  companyName?: string | null;
};

const USER_ID_COOKIE = "userId";
const USER_ROLE_COOKIE = "role";

async function readCookie(name: string): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(name);
    return cookie?.value || null;
  } catch (error) {
    console.error("Error reading cookie:", error);
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const userId = await readCookie(USER_ID_COOKIE);
  // console.log("DEBUG: getCurrentUser - userId from cookie:", userId);

  if (!userId) {
    // console.log("DEBUG: No userId in cookie");
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      firstName: true,
      lastName: true,
      siret: true,
      phone: true,
      companyName: true
    },
  });

  // console.log("DEBUG: getCurrentUser - user found in DB:", user ? "YES" : "NO");

  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: (user.role as SessionUser["role"]) ?? "CLIENT",
    avatar: user.avatar,
    firstName: user.firstName,
    lastName: user.lastName,
    siret: user.siret,
    phone: user.phone,
    companyName: user.companyName
  };
}

export type AllowedRole = SessionUser["role"];

export async function hasRole(role: AllowedRole): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user && user.role === role;
}

export async function getRoleFromCookies(): Promise<AllowedRole | null> {
  const role = await readCookie(USER_ROLE_COOKIE);
  if (role === "ADMIN" || role === "CLIENT" || role === "SUPER_ADMIN" || role === "PARTNER") return role as AllowedRole;
  return null;
}
