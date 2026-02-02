"use client";

import { User } from "@prisma/client";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ProfileTab({ user }: { user: User }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Local state for form fields
    const [formData, setFormData] = useState(() => {
        const fName = (user as any).firstName;
        const lName = (user as any).lastName;
        let initialFirst = fName || "";
        let initialLast = lName || "";

        if (!fName && !lName && user.name) {
            const parts = user.name.split(" ");
            if (parts.length > 0) {
                initialFirst = parts[0];
                initialLast = parts.slice(1).join(" ");
            }
        }

        return {
            firstName: initialFirst,
            lastName: initialLast,
            email: user.email || "",
            phone: (user as any).phone || "",
            siret: (user as any).siret || "",
            address: (user as any).address || "",
        };
    });

    // Handle avatar upload
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert("L'image est trop volumineuse (max 2MB)");
            return;
        }

        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        try {
            setIsUploading(true);
            const res = await fetch("/api/upload/avatar", {
                method: "POST",
                body: formDataUpload,
            });

            if (!res.ok) throw new Error("Upload failed");

            // Reload to reflect changes
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'upload");
        } finally {
            setIsUploading(false);
        }
    };

    // Handle profile update
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/settings/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Update failed");

            alert("Profil mis à jour !");
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la mise à jour");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
                <div className="relative h-24 w-24 overflow-hidden rounded-full bg-[#f8f6fb] ring-1 ring-[#ece7ef] dark:bg-[#1a1a1a] dark:ring-[#333]">
                    {(user as any).avatar ? (
                        <img
                            src={(user as any).avatar}
                            alt="Avatar"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement?.querySelector('.fallback')?.classList.remove('hidden');
                            }}
                        />
                    ) : null}
                    <div className={cn(
                        "fallback flex h-full w-full items-center justify-center text-[#8a8a8a] dark:text-gray-400",
                        (user as any).avatar ? "hidden" : ""
                    )}>
                        <span className="text-2xl font-bold">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                    </div>
                </div>
                <div>
                    <input
                        type="file"
                        id="avatar-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <button
                        type="button"
                        className={cn(
                            "rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#2f2f2f] shadow-sm ring-1 ring-inset ring-[#ece7ef] transition-colors",
                            "hover:bg-[#f8f6fb]",
                            "dark:bg-[#1a1a1a] dark:text-white dark:ring-[#333] dark:hover:bg-[#222]"
                        )}
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? "Envoi..." : "Changer la photo"}
                    </button>
                    <p className="mt-2 text-xs leading-5 text-[#8a8a8a] dark:text-gray-500">JPG, GIF ou PNG. 2MB max.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                {/* Prénom */}
                <div className="sm:col-span-3">
                    <label htmlFor="firstName" className="block text-sm font-bold leading-6 text-[#2f2f2f] dark:text-white">
                        Prénom
                    </label>
                    <div className="mt-2">
                        <input
                            type="text"
                            name="firstName"
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="block w-full rounded-md border border-[#ece7ef] bg-[#f8f6fb] py-2 pl-3 text-[#2f2f2f] shadow-sm outline-none transition focus:border-[#2f2f2f] focus:ring-1 focus:ring-[#2f2f2f] sm:text-sm sm:leading-6 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white"
                        />
                    </div>
                </div>

                {/* Nom */}
                <div className="sm:col-span-3">
                    <label htmlFor="lastName" className="block text-sm font-bold leading-6 text-[#2f2f2f] dark:text-white">
                        Nom
                    </label>
                    <div className="mt-2">
                        <input
                            type="text"
                            name="lastName"
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="block w-full rounded-md border border-[#ece7ef] bg-[#f8f6fb] py-2 pl-3 text-[#2f2f2f] shadow-sm outline-none transition focus:border-[#2f2f2f] focus:ring-1 focus:ring-[#2f2f2f] sm:text-sm sm:leading-6 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white"
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="sm:col-span-4">
                    <label htmlFor="email" className="block text-sm font-bold leading-6 text-[#2f2f2f] dark:text-white">
                        Adresse email
                    </label>
                    <div className="mt-2">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="block w-full rounded-md border border-[#ece7ef] bg-[#f8f6fb] py-2 pl-3 text-[#2f2f2f] shadow-sm outline-none transition focus:border-[#2f2f2f] focus:ring-1 focus:ring-[#2f2f2f] sm:text-sm sm:leading-6 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white"
                        />
                    </div>
                </div>

                {/* Téléphone */}
                <div className="sm:col-span-3">
                    <label htmlFor="phone" className="block text-sm font-bold leading-6 text-[#2f2f2f] dark:text-white">
                        Téléphone
                    </label>
                    <div className="mt-2">
                        <input
                            id="phone"
                            name="phone"
                            type="text"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="block w-full rounded-md border border-[#ece7ef] bg-[#f8f6fb] py-2 pl-3 text-[#2f2f2f] shadow-sm outline-none transition focus:border-[#2f2f2f] focus:ring-1 focus:ring-[#2f2f2f] sm:text-sm sm:leading-6 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white"
                        />
                    </div>
                </div>

                {/* Siret */}
                <div className="sm:col-span-3">
                    <label htmlFor="siret" className="block text-sm font-bold leading-6 text-[#2f2f2f] dark:text-white">
                        SIRET
                    </label>
                    <div className="mt-2">
                        <input
                            id="siret"
                            name="siret"
                            type="text"
                            value={(formData as any).siret}
                            onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                            className="block w-full rounded-md border border-[#ece7ef] bg-[#f8f6fb] py-2 pl-3 text-[#2f2f2f] shadow-sm outline-none transition focus:border-[#2f2f2f] focus:ring-1 focus:ring-[#2f2f2f] sm:text-sm sm:leading-6 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white"
                        />
                    </div>
                </div>

                {/* Adresse */}
                <div className="col-span-full">
                    <label htmlFor="address" className="block text-sm font-bold leading-6 text-[#2f2f2f] dark:text-white">
                        Adresse postale
                    </label>
                    <div className="mt-2">
                        <input
                            type="text"
                            name="address"
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="block w-full rounded-md border border-[#ece7ef] bg-[#f8f6fb] py-2 pl-3 text-[#2f2f2f] shadow-sm outline-none transition focus:border-[#2f2f2f] focus:ring-1 focus:ring-[#2f2f2f] sm:text-sm sm:leading-6 dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white dark:focus:ring-white"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="col-span-full flex items-center justify-end gap-x-6 border-t border-[#ece7ef] dark:border-[#333] pt-8">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="rounded-full bg-black px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                        {isLoading ? "Enregistrement..." : "Enregistrer"}
                    </button>
                </div>
            </form>
        </div>
    );
}
