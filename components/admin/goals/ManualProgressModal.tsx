"use client";

import { useState } from "react";
import { X, Check, Calculator } from "lucide-react";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    currentValue: number;
    onSubmit: (value: number, note: string) => void;
};

export default function ManualProgressModal({ isOpen, onClose, currentValue, onSubmit }: Props) {
    const [value, setValue] = useState(currentValue.toString());
    const [note, setNote] = useState("");

    const handleSubmit = () => {
        const num = parseFloat(value);
        if (isNaN(num)) return;
        onSubmit(num, note);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-scaleIn dark:bg-[#111] border border-transparent dark:border-[#333]">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ajustement manuel</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Mettre à jour la progression actuelle</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 dark:hover:bg-[#222]">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 dark:text-gray-500">Nouvelle Valeur</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-xl font-mono text-lg focus:outline-none focus:border-black transition dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 dark:text-gray-500">Note (Optionnel)</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Raison de l'ajustement..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition resize-none dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white dark:focus:border-white"
                            rows={3}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg flex items-center justify-center gap-2 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                        <Check className="w-4 h-4" />
                        Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
}
