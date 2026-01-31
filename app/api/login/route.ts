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

  const isValid = await bcrypt.compare(password, user.password);

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

  const redirectPath = "/dashboard";
  const res = NextResponse.json({ success: true, redirect: redirectPath });

  const isFirstLogin = !user.lastLoginAt;

  if (isFirstLogin && user.role === "CLIENT") {
    try {
      // Send Welcome Email
      const { sendEmail } = await import("@/lib/email");
      const welcomeHtml = `
              <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                  <div style="text-align: center; margin-bottom: 30px;">
                      <img src="https://obemstudio.com/logonoir.png" alt="Obem Studio" style="width: 150px;">
                  </div>
                  <h1 style="color: #000; font-size: 24px; margin-bottom: 20px;">Bienvenue chez Obem Studio, ${user.name} !</h1>
                  <p style="font-size: 16px; line-height: 1.6;">Nous sommes ravis de vous compter parmi nos clients. Voici un tour d'horizon rapide de votre nouvel espace :</p>
                  
                  <div style="background-color: #f8f6fb; border-radius: 12px; padding: 20px; margin: 25px 0;">
                      <ul style="list-style: none; padding: 0;">
                          <li style="margin-bottom: 15px;">
                              <strong>🚀 Tableau de bord</strong><br>
                              Une vue d'ensemble de vos projets et de vos dernières activités.
                          </li>
                          <li style="margin-bottom: 15px;">
                              <strong>📂 Mes Projets</strong><br>
                              Suivez l'avancement de vos projets en temps réel, étape par étape.
                          </li>
                          <li style="margin-bottom: 15px;">
                              <strong>📄 Devis & Factures</strong><br>
                              Consultez vos documents et effectuez vos règlements en toute sécurité.
                          </li>
                          <li style="margin-bottom: 15px;">
                              <strong>💬 Discussions</strong><br>
                              L'endroit idéal pour échanger avec notre équipe sur vos projets.
                          </li>
                      </ul>
                  </div>

                  <p style="font-size: 16px; line-height: 1.6;">Si vous avez la moindre question, n'hésitez pas à nous contacter directement via la section Support de votre tableau de bord.</p>
                  
                  <div style="text-align: center; margin-top: 40px;">
                      <a href="${request.url.split('/api/')[0]}/dashboard" style="background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold;">Accéder à mon espace</a>
                  </div>
              </div>
          `;
      await sendEmail(user.email, "Bienvenue chez Obem Studio 🚀", welcomeHtml);

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
