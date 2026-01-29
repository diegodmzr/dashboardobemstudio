export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f2eff3]">
      <div className="rounded-2xl bg-white px-8 py-10 text-center shadow-lg ring-1 ring-[#ebe7ee]">
        <h1 className="text-xl font-semibold text-[#2f2f2f]">Accès refusé</h1>
        <p className="mt-2 text-sm text-[#6e6a73]">
          Vous n&apos;avez pas les droits pour accéder à cette section.
        </p>
        <div className="mt-6 space-x-3">
          <a
            className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
            href="/login"
          >
            Revenir à la connexion
          </a>
        </div>
      </div>
    </div>
  );
}
