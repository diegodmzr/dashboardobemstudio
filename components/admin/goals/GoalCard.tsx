import {
    Euro, Users, Briefcase, FileText, TrendingUp, Target,
    Calendar, CheckCircle, AlertTriangle, ArrowUpRight
} from "lucide-react";

type Goal = {
    id: string;
    title: string;
    type: string;
    targetValue: number;
    currentValue: number;
    startDate: string;
    endDate: string;
    progressPercent: number;
    daysRemaining: number;
    status: string;
};

type Props = {
    goal: Goal;
    onClick: () => void;
};

export default function GoalCard({ goal, onClick }: Props) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);

    const formatNumber = (val: number) =>
        new Intl.NumberFormat("fr-FR").format(val);

    const isFinancial = ["REVENUE", "PROFIT", "MRR", "AVERAGE_DEAL_SIZE"].includes(goal.type);
    const isPercentage = goal.type === "CONVERSION_RATE";

    const formatValue = (val: number) => {
        if (isFinancial) return formatCurrency(val);
        if (isPercentage) return val.toFixed(1) + "%";
        return formatNumber(val);
    };

    const getIcon = () => {
        switch (goal.type) {
            case "REVENUE": return <Euro className="w-5 h-5 text-green-600 dark:text-green-500" />;
            case "PROFIT": return <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-500" />;
            case "MRR": return <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-500" />;
            case "NEW_CLIENTS": return <Users className="w-5 h-5 text-orange-600 dark:text-orange-500" />;
            case "PROJECTS_CREATED": return <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />;
            case "QUOTES_SENT": return <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
            default: return <Target className="w-5 h-5 text-black dark:text-white" />;
        }
    };

    const getProgressColor = (percent: number) => {
        if (percent >= 100) return "bg-green-500";
        if (percent >= 75) return "bg-blue-500";
        if (percent >= 50) return "bg-yellow-500";
        return "bg-orange-500";
    };

    return (
        <div
            onClick={onClick}
            className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-black/5 transition-all cursor-pointer relative overflow-hidden dark:bg-[#1a1a1a] dark:border-[#333] dark:hover:border-gray-700 dark:hover:shadow-black/30"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors border border-gray-100/50 group-hover:border-gray-200 dark:bg-[#222] dark:border-[#333] dark:group-hover:bg-[#252525] dark:group-hover:border-[#444]">
                        {getIcon()}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-black transition-colors dark:text-white dark:group-hover:text-gray-200">{goal.title}</h3>
                        <p className="text-xs text-gray-400 capitalize dark:text-gray-500">{goal.type.replace(/_/g, " ").toLowerCase()}</p>
                    </div>
                </div>
                {goal.progressPercent >= 100 && (
                    <div className="bg-green-100 text-green-700 p-1 rounded-full dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                    </div>
                )}
            </div>

            <div className="mb-4">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-2xl font-light text-gray-900 dark:text-white">
                        {formatValue(goal.currentValue)}
                    </span>
                    <span className="text-xs font-medium text-gray-500 mb-1 dark:text-gray-500">
                        / {formatValue(goal.targetValue)}
                    </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden dark:bg-[#333]">
                    <div
                        className={`h-full ${getProgressColor(goal.progressPercent)} transition-all duration-1000 ease-out`}
                        style={{ width: `${Math.min(100, goal.progressPercent)}%` }}
                    />
                </div>
            </div>

            <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-50 pt-4 mt-2 dark:border-[#333] dark:text-gray-500">
                <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                        {goal.daysRemaining > 0
                            ? `${goal.daysRemaining} jours restants`
                            : "Terminé"}
                    </span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 font-medium dark:text-gray-400">
                    {goal.progressPercent.toFixed(0)}%
                </div>
            </div>
        </div>
    );
}
