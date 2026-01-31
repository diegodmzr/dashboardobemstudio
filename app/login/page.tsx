
import Image from "next/image";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f2eff3] px-4 font-sans">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-xl ring-1 ring-black/5">
        <div className="text-center">
          <div className="mx-auto h-12 relative mb-6 flex justify-center">
            <img
              src="/logonoir.png"
              alt="Logo OBEM"
              className="h-full w-auto object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Connexion</h2>
          <p className="mt-2 text-sm text-gray-600">Connectez-vous à votre espace OBEM Studio</p>
        </div>

        {error === "invalid_credentials" && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 text-center border border-red-100">
            Email ou mot de passe incorrect.
          </div>
        )}

        <LoginForm />

      </div>
    </div>
  );
}
