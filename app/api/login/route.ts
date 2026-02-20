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
    return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
  }

  console.log("Login attempt for user:", email);
  console.log("Password hash in DB:", user.password.substring(0, 20) + "...");

  const isValid = await bcrypt.compare(password, user.password);
  console.log("Password comparison result:", isValid);

  if (!isValid) {
    return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
  }

  // Check if 2FA is enabled
  if (user.twoFactorEnabled) {
    return NextResponse.json({
      requires2FA: true,
      userId: user.id
    });
  }

  const redirectPath = user.role === "PARTNER" ? "/partner/dashboard" : "/dashboard";
  const res = NextResponse.json({ success: true, redirect: redirectPath });

  const isFirstLogin = !user.lastLoginAt;

  if (isFirstLogin && user.role === "CLIENT") {
    try {
      // Send Welcome Email
      const { sendEmail } = await import("@/lib/email");
      const host = request.headers.get("host") || "dashboard.obemstudio.com";
      const protocol = host.includes("localhost") ? "http" : "https";
      const baseUrl = `${protocol}://${host}`;

      const welcomeHtml = `
                  <h2 style="color: #000; font-size: 22px; margin-top: 0;">Bienvenue, ${user.name} !</h2>
                  <p style="font-size: 16px; line-height: 1.6;">Nous sommes ravis de vous compter parmi nos clients. Voici un tour d'horizon rapide de votre nouvel espace :</p>
                  
                  <div style="background-color: #fcfcfc; border: 1px solid #f0f0f0; border-radius: 12px; padding: 25px; margin: 25px 0;">
                      <ul style="list-style: none; padding: 0; margin: 0;">
                          <li style="margin-bottom: 18px; display: flex; align-items: flex-start;">
                              <span style="font-size: 20px; margin-right: 12px;">🚀</span>
                              <span><strong>Tableau de bord</strong><br><span style="color: #666; font-size: 14px;">Une vue d'ensemble de vos projets et de vos dernières activités.</span></span>
                          </li>
                          <li style="margin-bottom: 18px; display: flex; align-items: flex-start;">
                              <span style="font-size: 20px; margin-right: 12px;">📂</span>
                              <span><strong>Mes Projets</strong><br><span style="color: #666; font-size: 14px;">Suivez l'avancement de vos projets en temps réel, étape par étape.</span></span>
                          </li>
                          <li style="margin-bottom: 0; display: flex; align-items: flex-start;">
                              <span style="font-size: 20px; margin-right: 12px;">💬</span>
                              <span><strong>Discussions</strong><br><span style="color: #666; font-size: 14px;">Échangez directement avec notre équipe sur vos projets en cours.</span></span>
                          </li>
                      </ul>
                  </div>

                  <p style="font-size: 15px; line-height: 1.6; color: #555;">Si vous avez la moindre question, n'hésitez pas à nous contacter directement via la section Support de votre tableau de bord.</p>
                  
                  <div style="text-align: center; margin-top: 40px;">
                      <a href="${baseUrl}/dashboard" style="background-color: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">Accéder à mon espace</a>
                  </div>
          `;
      await sendEmail(user.email, "Bienvenue 🚀", welcomeHtml);

      // Create Welcome Conversation
      const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      const adminId = admin?.id || "admin-system";

      await prisma.conversation.create({
        data: {
          subject: "Bienvenue sur votre espace client !",
          category: "AUTRE",
          participants: {
            create: [
              { userId: user.id, role: "OWNER" },
              ...(admin ? [{ userId: admin.id, role: "ADMIN" }] : [])
            ]
          },
          messages: {
            create: {
              senderId: adminId,
              content: `Bonjour ${user.name} !\n\nBienvenue sur votre espace client Obem Studio. Nous avons créé cet espace pour faciliter nos échanges et vous permettre de suivre vos projets en toute transparence.\n\nN'hésitez pas à utiliser cette discussion si vous avez des questions sur l'utilisation du dashboard ou sur vos projets en cours.\n\nÀ très vite !\n\nL'équipe Obem Studio`,
              isInternal: false
            }
          }
        }
      });
    } catch (err) {
      console.error("Welcome flow error:", err);
    }
  }

  // Update lastLoginAt using standard Prisma
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  // Force-delete existing cookies to ensure role update is picked up
  res.cookies.delete("userId");
  res.cookies.delete("role");

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
