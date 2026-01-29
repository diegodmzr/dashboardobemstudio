import * as Icons from "lucide-react";

type Props = {
    title: string;
    value: string;
    change?: number;
    subtitle?: string;
    icon: string;
    color?: "green" | "blue" | "purple" | "red" | "gray";
};

export default function KPICard({ title, value, change, subtitle, icon, color = "gray" }: Props) {
    const colorStyles: Record<string, string> = {
        green: "border-green-100 bg-green-50/50 dark:bg-green-900/10 dark:border-green-900/20",
        blue: "border-blue-100 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-900/20",
        purple: "border-purple-100 bg-purple-50/50 dark:bg-purple-900/10 dark:border-purple-900/20",
        red: "border-red-100 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/20",
        gray: "border-gray-100 bg-gray-50/50 dark:bg-[#1a1a1a] dark:border-[#333]",
    };

    const textColors: Record<string, string> = {
        green: "text-green-600 dark:text-green-400",
        blue: "text-blue-600 dark:text-blue-400",
        purple: "text-purple-600 dark:text-purple-400",
        red: "text-red-600 dark:text-red-400",
        gray: "text-gray-600 dark:text-gray-400",
    };

    const iconColors: Record<string, string> = {
        green: "text-green-500",
        blue: "text-blue-500",
        purple: "text-purple-500",
        red: "text-red-500",
        gray: "text-gray-500",
    };

    // Convert icon string to PascalCase for Lucide
    const iconName = icon
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");

    const IconComponent = (Icons as any)[iconName] || Icons.Circle;

    return (
        <div className={`p-6 rounded-2xl border ${colorStyles[color]}`}>
            <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{title}</span>
                <IconComponent className={`w-5 h-5 ${iconColors[color]}`} />
            </div>
            <div className={`text-3xl font-light ${textColors[color]} mb-1 dark:text-white`}>{value}</div>
            {change !== undefined && (
                <div className={`text-sm ${change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {change >= 0 ? "↗" : "↘"} {Math.abs(change).toFixed(1)}% vs période précédente
                </div>
            )}
            {subtitle && <div className="text-xs text-gray-500 mt-1 dark:text-gray-500">{subtitle}</div>}
        </div>
    );
}
