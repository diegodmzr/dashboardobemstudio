"use client";

type Props = {
    formData: any;
    updateFormData: (data: any) => void;
    nextStep: () => void;
};

export default function ProjectRequestStepContact({ formData, updateFormData, nextStep }: Props) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.contactName && formData.contactEmail) {
            nextStep();
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Commençons par les présentations</h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Dites-nous qui vous êtes afin que nous puissions vous recontacter.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 mt-6">
                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1.5">
                            Nom complet <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="text"
                            value={formData.contactName || ""}
                            onChange={(e) => updateFormData({ contactName: e.target.value })}
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black dark:bg-[#222] dark:border-[#333] dark:text-white"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1.5">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="email"
                            value={formData.contactEmail || ""}
                            onChange={(e) => updateFormData({ contactEmail: e.target.value })}
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black dark:bg-[#222] dark:border-[#333] dark:text-white"
                            placeholder="john@example.com"
                        />
                    </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1.5">
                            Entreprise (Optionnel)
                        </label>
                        <input
                            type="text"
                            value={formData.contactCompany || ""}
                            onChange={(e) => updateFormData({ contactCompany: e.target.value })}
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black dark:bg-[#222] dark:border-[#333] dark:text-white"
                            placeholder="Acme Inc."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1.5">
                            Téléphone (Optionnel)
                        </label>
                        <input
                            type="tel"
                            value={formData.contactPhone || ""}
                            onChange={(e) => updateFormData({ contactPhone: e.target.value })}
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black dark:bg-[#222] dark:border-[#333] dark:text-white"
                            placeholder="+33 6 12 34 56 78"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={!formData.contactName || !formData.contactEmail}
                        className={`group flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all ${formData.contactName && formData.contactEmail
                            ? "bg-black shadow-lg hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 dark:bg-white dark:text-black"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none dark:bg-gray-800 dark:text-gray-600"
                            }`}
                    >
                        Suivant
                        <svg
                            className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
}
