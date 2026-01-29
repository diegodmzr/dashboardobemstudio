import { ProjectRequestFormData } from "./ProjectRequestForm";
import {
    Sparkles, Smartphone, Search, FileInput, Mail, Globe,
    Calendar, MapPin, Share2, MessageCircle, Film, MessageSquare,
    CreditCard, Package, Star, Heart, Scale, BarChart, Gift, Truck,
    Receipt, Timer, Maximize, TrendingUp, FlaskConical, Magnet
} from "lucide-react";

type Props = {
    formData: ProjectRequestFormData;
    updateFormData: (data: Partial<ProjectRequestFormData>) => void;
    nextStep: () => void;
    prevStep: () => void;
};

export default function ProjectRequestStepFeatures({ formData, updateFormData, nextStep, prevStep }: Props) {
    // Features adaptées selon le type de site
    const getAvailableFeatures = () => {
        const commonFeatures = [
            { id: "animations", label: "Animations modernes", icon: <Sparkles className="h-6 w-6" />, description: "Transitions fluides et effets wow" },
            { id: "responsive", label: "Design responsive", icon: <Smartphone className="h-6 w-6" />, description: "Adapté mobile/tablette/desktop" },
            { id: "seo", label: "Optimisation SEO", icon: <Search className="h-6 w-6" />, description: "Référencement naturel" },
            { id: "forms", label: "Formulaires avancés", icon: <FileInput className="h-6 w-6" />, description: "Contact, devis, inscription..." },
            { id: "newsletter", label: "Newsletter", icon: <Mail className="h-6 w-6" />, description: "Inscription à la newsletter" },
            { id: "multilingue", label: "Multi-langue", icon: <Globe className="h-6 w-6" />, description: "Plusieurs langues disponibles" },
        ];

        if (formData.websiteType === "vitrine") {
            return [
                ...commonFeatures,
                { id: "booking", label: "Système de réservation", icon: <Calendar className="h-6 w-6" />, description: "Prendre RDV en ligne" },
                { id: "maps", label: "Carte interactive", icon: <MapPin className="h-6 w-6" />, description: "Google Maps intégré" },
                { id: "socialmedia", label: "Intégration réseaux sociaux", icon: <Share2 className="h-6 w-6" />, description: "Flux Instagram, Facebook..." },
                { id: "testimonials", label: "Carrousel de témoignages", icon: <MessageCircle className="h-6 w-6" />, description: "Avis clients rotatifs" },
                { id: "gallery", label: "Galerie photos/vidéos", icon: <Film className="h-6 w-6" />, description: "Portfolio multimédia" },
                { id: "livechat", label: "Chat en direct", icon: <MessageSquare className="h-6 w-6" />, description: "Support client instantané" },
            ];
        }

        if (formData.websiteType === "ecommerce") {
            return [
                ...commonFeatures,
                { id: "payment", label: "Paiement en ligne", icon: <CreditCard className="h-6 w-6" />, description: "Stripe, PayPal..." },
                { id: "tracking", label: "Suivi de commande", icon: <Package className="h-6 w-6" />, description: "Tracker temps réel" },
                { id: "reviews", label: "Avis produits", icon: <Star className="h-6 w-6" />, description: "Notation et commentaires" },
                { id: "wishlist", label: "Liste de souhaits", icon: <Heart className="h-6 w-6" />, description: "Sauvegarder des produits" },
                { id: "comparison", label: "Comparateur produits", icon: <Scale className="h-6 w-6" />, description: "Comparer plusieurs articles" },
                { id: "search", label: "Recherche avancée", icon: <Search className="h-6 w-6" />, description: "Filtres et suggestions" },
                { id: "stock", label: "Gestion de stock", icon: <BarChart className="h-6 w-6" />, description: "Inventaire en temps réel" },
                { id: "promo", label: "Codes promo", icon: <Gift className="h-6 w-6" />, description: "Coupons de réduction" },
                { id: "shipping", label: "Calcul de livraison", icon: <Truck className="h-6 w-6" />, description: "Frais de port automatiques" },
                { id: "invoices", label: "Facturation automatique", icon: <Receipt className="h-6 w-6" />, description: "Génération de factures" },
            ];
        }

        if (formData.websiteType === "landing") {
            return [
                { id: "countdown", label: "Compte à rebours", icon: <Timer className="h-6 w-6" />, description: "Urgence et conversion" },
                { id: "popup", label: "Pop-up d'intention de sortie", icon: <Maximize className="h-6 w-6" />, description: "Capturer avant départ" },
                { id: "testimonials", label: "Témoignages clients", icon: <MessageCircle className="h-6 w-6" />, description: "Preuves sociales" },
                { id: "cta", label: "CTA optimisés", icon: <Magnet className="h-6 w-6" />, description: "Boutons de conversion" },
                { id: "analytics", label: "Analytics avancés", icon: <TrendingUp className="h-6 w-6" />, description: "Tracking conversions" },
                { id: "ab-testing", label: "A/B Testing", icon: <FlaskConical className="h-6 w-6" />, description: "Tests de versions" },
                { id: "lead-magnet", label: "Lead magnet", icon: <Magnet className="h-6 w-6" />, description: "PDF/ebook gratuit" },
                ...commonFeatures.slice(0, 3), // animations, responsive, forms
            ];
        }

        return commonFeatures;
    };

    const availableFeatures = getAvailableFeatures();

    const toggleFeature = (featureId: string) => {
        const currentFeatures = formData.features || [];
        const newFeatures = currentFeatures.includes(featureId)
            ? currentFeatures.filter((id) => id !== featureId)
            : [...currentFeatures, featureId];
        updateFormData({ features: newFeatures });
    };

    const handleNext = () => {
        if (!formData.features || formData.features.length === 0) {
            alert("Veuillez sélectionner au moins une fonctionnalité");
            return;
        }
        nextStep();
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mb-2 text-2xl font-bold text-[#2f2f2f] dark:text-white">
                    Fonctionnalités
                </h2>
                <p className="text-sm text-[#6a6a6a] dark:text-gray-400">
                    Choisissez les fonctionnalités que vous souhaitez intégrer
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {availableFeatures.map((feature) => {
                    const isSelected = formData.features?.includes(feature.id) || false;
                    return (
                        <button
                            key={feature.id}
                            type="button"
                            onClick={() => toggleFeature(feature.id)}
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
                            <div className="text-2xl mb-2">{feature.icon}</div>
                            <div className={`text-sm font-bold mb-1 ${isSelected ? "text-white dark:text-black" : "text-[#2f2f2f] dark:text-white"
                                }`}>
                                {feature.label}
                            </div>
                            <div className={`text-xs ${isSelected ? "text-gray-200 dark:text-gray-700" : "text-[#6a6a6a] dark:text-gray-400"
                                }`}>
                                {feature.description}
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
                    className="group flex items-center gap-2 rounded-xl bg-black px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 dark:bg-white dark:text-black"
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
