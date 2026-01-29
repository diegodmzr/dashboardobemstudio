import React from "react";

type Props = {
    label: string;
    value: string | null;
    options: string[];
    onSelect: (val: string | null) => void;
};

export default function FilterPill({ label, value, options, onSelect }: Props) {
    return (
        <div className="flex items-center gap-2 rounded-full border border-[#ece7ef] bg-white px-4 py-2 text-sm shadow-sm transition hover:border-[#dcd6e2] dark:bg-[#1a1a1a] dark:border-[#333] dark:shadow-none dark:hover:border-gray-500">
            <span className="font-semibold text-[#8a8a8a] dark:text-gray-400">{label}:</span>
            <select
                className="cursor-pointer bg-transparent font-medium text-[#2f2f2f] outline-none dark:text-white"
                value={value || ""}
                onChange={(e) => onSelect(e.target.value || null)}
            >
                <option value="">Tous</option>
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </div>
    );
}
