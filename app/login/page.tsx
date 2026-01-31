import Image from "next/image";
import LoginForm from "@/components/LoginForm";
import { AnimatedLoginBackground } from "@/components/login/AnimatedLoginBackground";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 font-sans overflow-hidden">
      <AnimatedLoginBackground />

      <div className="w-full max-w-md space-y-8 rounded-[2.5rem] bg-white/5 border border-white/10 p-8 shadow-2xl backdrop-blur-2xl ring-1 ring-white/5 animate-fadeIn">
        <div className="text-center">
          <div className="mx-auto h-12 relative mb-6 flex justify-center">
            <Image
              src="/logoblanc.png"
              alt="Logo OBEM"
              fill
              priority
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Connexion</h2>
          <p className="mt-2 text-sm text-gray-400">Connectez-vous à votre espace OBEM Studio</p>
        </div>

        {error === "invalid_credentials" && (
          <div className="rounded-2xl bg-rose-500/10 p-4 text-sm text-rose-400 text-center border border-rose-500/20 backdrop-blur-md">
            Email ou mot de passe incorrect.
          </div>
        )}

        <LoginForm />
      </div>
    </div>
  );
}
