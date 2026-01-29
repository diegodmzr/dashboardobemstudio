"use client";

import { ProjectRequestFormData } from "./ProjectRequestForm";
import {
    Home, Mail, Info, Scale, Lock, FileText, Briefcase, Image,
    MessageSquare, PenTool, HelpCircle, ShoppingBag, Tag, ShoppingCart,
    CreditCard, User, ClipboardList, Heart, Target, CheckCircle
} from "lucide-react";

type Props = {
    formData: ProjectRequestFormData;
    updateFormData: (data: Partial<ProjectRequestFormData>) => void;
    nextStep: () => void;
    prevStep: () => void;
};

export default function ProjectRequestStepPages({ formData, updateFormData, nextStep, prevStep }: Props) {
    // Pages adaptées selon le type de site
    const getAvailablePages = () => {
        const commonPages = [
            { id: "accueil", label: "Page d'accueil", icon: <Home className="h-6 w-6" />, description: "Page principale du site" },
            { id: "contact", label: "Contact", icon: <Mail className="h-6 w-6" />, description: "Formulaire de contact" },
            { id: "apropos", label: "À propos", icon: <Info className="h-6 w-6" />, description: "Présentation de l'entreprise" },
        ];

        const legalPages = [
            { id: "mentions", label: "Mentions légales", icon: <Scale className="h-6 w-6" />, description: "Informations légales" },
            { id: "confidentialite", label: "Politique de confidentialité", icon: <Lock className="h-6 w-6" />, description: "Gestion des données" },
            { id: "cgv", label: "CGV", icon: <FileText className="h-6 w-6" />, description: "Conditions générales de vente" },
        ];

        if (formData.websiteType === "vitrine") {
            return [
                ...commonPages,
                { id: "services", label: "Services", icon: <Briefcase className="h-6 w-6" />, description: "Vos prestations" },
                { id: "portfolio", label: "Portfolio", icon: <Image className="h-6 w-6" />, description: "Vos réalisations" },
                { id: "temoignages", label: "Témoignages", icon: <MessageSquare className="h-6 w-6" />, description: "Avis clients" },
                { id: "blog", label: "Blog", icon: <PenTool className="h-6 w-6" />, description: "Articles et actualités" },
                { id: "faq", label: "FAQ", icon: <HelpCircle className="h-6 w-6" />, description: "Questions fréquentes" },
                ...legalPages,
            ];
        }

        if (formData.websiteType === "ecommerce") {
            return [
                ...commonPages,
                { id: "catalogue", label: "Catalogue produits", icon: <ShoppingBag className="h-6 w-6" />, description: "Liste des produits" },
                { id: "produit", label: "Page produit", icon: <Tag className="h-6 w-6" />, description: "Détails d'un produit" },
                { id: "panier", label: "Panier", icon: <ShoppingCart className="h-6 w-6" />, description: "Gestion du panier" },
                { id: "checkout", label: "Paiement", icon: <CreditCard className="h-6 w-6" />, description: "Tunnel de commande" },
                { id: "compte", label: "Compte client", icon: <User className="h-6 w-6" />, description: "Espace personnel" },
                { id: "commandes", label: "Mes commandes", icon: <ClipboardList className="h-6 w-6" />, description: "Historique des achats" },
                { id: "wishlist", label: "Liste de souhaits", icon: <Heart className="h-6 w-6" />, description: "Produits favoris" },
                ...legalPages,
            ];
        }

        if (formData.websiteType === "landing") {
            return [
                { id: "landing", label: "Landing Page", icon: <Target className="h-6 w-6" />, description: "Page unique de conversion" },
                { id: "merci", label: "Page de remerciement", icon: <CheckCircle className="h-6 w-6" />, description: "Après conversion" },
                ...legalPages.slice(0, 2), // Juste mentions et confidentialité
            ];
        }

        return commonPages;
    };

    const availablePages = getAvailablePages();

    const togglePage = (pageId: string) => {
        const currentPages = formData.pages || [];
        const newPages = currentPages.includes(pageId)
            ? currentPages.filter((id) => id !== pageId)
            : [...currentPages, pageId];
        updateFormData({ pages: newPages });
    };

    const handleNext = () => {
        if (!formData.pages || formData.pages.length === 0) {
            alert("Veuillez sélectionner au moins une page");
            return;
        }
        nextStep();
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 text-2xl font-bold text-[#2f2f2f] dark:text-white">
                    Pages du site
                </h2>
                <p className="text-sm text-[#6a6a6a] dark:text-gray-400">
                    Sélectionnez les pages dont vous avez besoin (sélection multiple)
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {availablePages.map((page) => {
                    const isSelected = formData.pages?.includes(page.id) || false;
                    return (
                        <button
                            key={page.id}
                            type="button"
                            onClick={() => togglePage(page.id)}
                            className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition ${isSelected
                                ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                                : "border-[#ece7ef] bg-white hover:border-gray-300 dark:border-[#333] dark:bg-[#111] dark:hover:border-[#444]"
                                }`}
                        >
                            {isSelected && (
                                <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-black">
                                    <svg className="h-4 w-4 text-black dark:text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                            <div className="text-2xl mb-2">{page.icon}</div>
                            <div className={`text-sm font-bold mb-1 ${isSelected ? "text-white dark:text-black" : "text-[#2f2f2f] dark:text-white"
                                }`}>
                                {page.label}
                            </div>
                            <div className={`text-xs ${isSelected ? "text-gray-200 dark:text-gray-700" : "text-[#6a6a6a] dark:text-gray-400"
                                }`}>
                                {page.description}
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="flex justify-between">
                <button
                    onClick={prevStep}
                    className="flex items-center gap-2 rounded-full border border-[#ece7ef] bg-white px-8 py-3 text-sm font-semibold text-[#6a6a6a] transition hover:bg-gray-50 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-gray-400 dark:hover:bg-[#222]"
                >
                    <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Précédent
                </button>
                <button
                    onClick={nextStep}
                    disabled={!formData.pages || formData.pages.length === 0}
                    className="group flex items-center gap-2 rounded-xl bg-black px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black"
                >
                    Suivant
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
