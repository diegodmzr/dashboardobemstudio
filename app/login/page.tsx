
import Image from "next/image";

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

        <form className="mt-8 space-y-6" action="/api/login" method="POST">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1.5">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-black focus:bg-white text-sm outline-none transition-all"
                placeholder="nom@exemple.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1.5">Mot de passe</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-black focus:bg-white text-sm outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="group relative flex w-full justify-center rounded-xl bg-black px-4 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all shadow-lg shadow-black/20 hover:shadow-xl hover:-translate-y-0.5"
          >
            Se connecter
          </button>
        </form>

        {/* Test Accounts Helpers */}
        <div className="mt-10 border-t border-gray-100 pt-8">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Comptes de Démonstration</h3>
          <div className="grid gap-3">
            <div className="group flex items-center justify-between rounded-xl bg-gray-50 p-3 border border-gray-100 hover:border-gray-300 transition-colors cursor-pointer select-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">A</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Admin</p>
                  <p className="text-xs text-gray-500">admin@obemstudio.com</p>
                </div>
              </div>
              <div className="text-xs font-mono bg-white px-2 py-1 rounded border border-gray-200 text-gray-600 group-hover:border-gray-300">
                password123
              </div>
            </div>
            <div className="group flex items-center justify-between rounded-xl bg-gray-50 p-3 border border-gray-100 hover:border-gray-300 transition-colors cursor-pointer select-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">C</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Client</p>
                  <p className="text-xs text-gray-500">client@demo.com</p>
                </div>
              </div>
              <div className="text-xs font-mono bg-white px-2 py-1 rounded border border-gray-200 text-gray-600 group-hover:border-gray-300">
                password123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
