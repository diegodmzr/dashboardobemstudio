"use client";

import { PublicProjectRequestFormData } from "./PublicProjectRequestForm";

type Props = {
    formData: PublicProjectRequestFormData;
    prevStep: () => void;
    goToStep: (step: number) => void;
    handleSubmit: () => void;
    isSubmitting: boolean;
};

export default function ProjectRequestStep5({ formData, prevStep, goToStep, handleSubmit, isSubmitting }: Props) {
    const highlightsLabel: Record<string, string> = {
        savoir_faire: "Savoir-faire",
        specialite: "Spécialité",
        histoire: "Histoire",
        valeur: "Valeur importante"
    };

    // Calculate step indices dynamically based on steps in parent
    // However, to keep it simple, we just show all filled info.

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 text-2xl font-bold text-[#2f2f2f] dark:text-white">
                    Récapitulatif
                </h2>
                <p className="text-sm text-[#6a6a6a] dark:text-gray-400">
                    Vérifiez vos réponses avant d'envoyer votre demande
                </p>
            </div>

            <div className="space-y-4">
                {/* Contact Info */}
                {(formData.contactSiret || formData.contactAddress || formData.contactPhone || formData.contactCompany) && (
                    <div className="rounded-xl border border-[#ece7ef] bg-[#f8f6fb] p-4 dark:bg-[#111] dark:border-[#333]">
                        <h3 className="mb-3 text-sm font-bold text-[#2f2f2f] dark:text-white">Informations de contact</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs font-semibold text-[#8a8a8a] dark:text-gray-500">Nom</div>
                                <div className="text-sm text-[#2f2f2f] dark:text-white">{formData.contactName}</div>
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-[#8a8a8a] dark:text-gray-500">Email</div>
                                <div className="text-sm text-[#2f2f2f] dark:text-white">{formData.contactEmail}</div>
                            </div>
                            {formData.contactSiret && (
                                <div>
                                    <div className="text-xs font-semibold text-[#8a8a8a] dark:text-gray-500">SIRET</div>
                                    <div className="text-sm text-[#2f2f2f] dark:text-white">{formData.contactSiret}</div>
                                </div>
                            )}
                            {formData.contactAddress && (
                                <div className="col-span-2">
                                    <div className="text-xs font-semibold text-[#8a8a8a] dark:text-gray-500">Adresse</div>
                                    <div className="text-sm text-[#2f2f2f] dark:text-white">{formData.contactAddress}</div>
                                </div>
                            )}
                            {formData.contactPhone && (
                                <div>
                                    <div className="text-xs font-semibold text-[#8a8a8a] dark:text-gray-500">Téléphone</div>
                                    <div className="text-sm text-[#2f2f2f] dark:text-white">{formData.contactPhone}</div>
                                </div>
                            )}
                            {formData.contactCompany && (
                                <div>
                                    <div className="text-xs font-semibold text-[#8a8a8a] dark:text-gray-500">Entreprise</div>
                                    <div className="text-sm text-[#2f2f2f] dark:text-white">{formData.contactCompany}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="rounded-xl border border-[#ece7ef] bg-[#f8f6fb] p-4 dark:bg-[#111] dark:border-[#333]">
                    <h3 className="mb-3 text-sm font-bold text-[#2f2f2f] dark:text-white">Le Projet</h3>
                    <div className="space-y-2">
                        <div>
                            <div className="text-xs font-semibold text-[#8a8a8a] dark:text-gray-500">Nom & Type</div>
                            <div className="text-sm text-[#2f2f2f] dark:text-white">
                                {formData.projectName} - {
                                    formData.websiteType === "vitrine" ? "Site Vitrine"
                                        : formData.websiteType === "ecommerce" ? "E-commerce"
                                            : "Landing Page"
                                }
                            </div>
                        </div>
                        {formData.websiteType === "ecommerce" && (
                            <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-2 dark:border-gray-800">
                                <div>
                                    <div className="text-xs font-semibold text-[#8a8a8a] dark:text-gray-500">Produit</div>
                                    <div className="text-sm text-[#2f2f2f] dark:text-white">{formData.productType}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-[#8a8a8a] dark:text-gray-500">Quantité</div>
                                    <div className="text-sm text-[#2f2f2f] dark:text-white">{formData.productCount}</div>
                                </div>
                            </div>
                        )}
                        <div>
                            <div className="text-xs font-semibold text-[#8a8a8a] dark:text-gray-500">Pages</div>
                            <div className="text-sm text-[#2f2f2f] dark:text-white">{formData.pages.join(", ")}</div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-[#ece7ef] bg-[#f8f6fb] p-4 dark:bg-[#111] dark:border-[#333]">
                    <h3 className="mb-3 text-sm font-bold text-[#2f2f2f] dark:text-white">Vision & Identité</h3>
                    <div className="space-y-2">
                        <div>
                            <div className="text-xs font-semibold text-[#8a8a8a] dark:text-gray-500">Valeurs mises en avant</div>
                            <div className="text-sm text-[#2f2f2f] dark:text-white">
                                {formData.highlights.map(h => highlightsLabel[h]).join(", ") || "Aucune"}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-[#8a8a8a] dark:text-gray-500">Public cible</div>
                            <div className="text-sm text-[#2f2f2f] dark:text-white">{formData.targetAudience || "Non renseigné"}</div>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-[#8a8a8a] dark:text-gray-500">Inspirations</div>
                            <div className="text-sm text-[#2f2f2f] dark:text-white line-clamp-1">{formData.competitors || "Aucune"}</div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-[#ece7ef] bg-[#f8f6fb] p-4 dark:bg-[#111] dark:border-[#333]">
                    <h3 className="mb-3 text-sm font-bold text-[#2f2f2f] dark:text-white">Design</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-xs font-semibold text-[#8a8a8a] dark:text-gray-500">Couleurs</div>
                            <div className="text-sm text-[#2f2f2f] dark:text-white">{formData.colors}</div>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-[#8a8a8a] dark:text-gray-500">Style</div>
                            <div className="text-sm text-[#2f2f2f] dark:text-white">{formData.designStyles.join(", ")}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border-2 border-[#ece7ef] bg-white p-4 dark:bg-[#1a1a1a] dark:border-[#333]">
                <p className="text-sm text-[#6a6a6a] dark:text-gray-400">
                    En envoyant cette demande, vous acceptez que notre équipe vous contacte pour discuter de votre projet. Nous reviendrons vers vous sous <strong className="text-[#2f2f2f] dark:text-white">24-48h</strong>.
                </p>
            </div>

            <div className="flex justify-between">
                <button
                    onClick={prevStep}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-full border border-[#ece7ef] bg-white px-8 py-3 text-sm font-semibold text-[#6a6a6a] transition hover:bg-gray-50 disabled:opacity-50 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-400 dark:hover:bg-[#222]"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Précédent
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="group flex items-center justify-center gap-2 rounded-xl bg-black px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black"
                >
                    {isSubmitting ? "Envoi en cours..." : "Envoyer ma demande"}
                    {!isSubmitting && (
                        <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    )}
                </button>
            </div>
        </div >
    );
}
