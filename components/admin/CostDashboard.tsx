"use client";

import { CostAnalysis, formatCost, formatPercentage, getServiceDisplayName, getServiceColor } from "@/lib/costAnalytics";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface CostDashboardProps {
    analysis: CostAnalysis;
    currentMonth: string;
    budgetWarnings: Array<{ service: string; spent: number; limit: number }>;
}

export default function CostDashboard({
    analysis,
    currentMonth,
    budgetWarnings = [],
}: CostDashboardProps) {
    const getTrendIcon = () => {
        if (analysis.costTrend === 'INCREASING') {
            return <TrendingUp className="h-5 w-5 text-red-400" />;
        } else if (analysis.costTrend === 'DECREASING') {
            return <TrendingDown className="h-5 w-5 text-green-400" />;
        }
        return <div className="h-5 w-5" />;
    };

    return (
        <div className="space-y-6">
            {/* Budget Warnings */}
            {budgetWarnings.length > 0 && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                    <div className="flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-red-300 mb-2">Budget Alerts</h3>
                            <div className="space-y-1 text-sm text-red-200/80">
                                {budgetWarnings.map((warning, idx) => (
                                    <div key={idx}>
                                        {warning.service} has exceeded {Math.round((warning.spent / warning.limit) * 100)}% of budget ({formatCost(warning.spent)} / {formatCost(warning.limit)})
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Current Month Cost */}
                <div className="rounded-lg border border-white/10 bg-[#10131b] p-4">
                    <div className="text-[11px] font-black uppercase tracking-[0.08em] text-[#8a93a7]">
                        {currentMonth} Cost
                    </div>
                    <div className="mt-2 text-2xl font-black text-white">
                        {formatCost(analysis.currentMonthCost)}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-sm text-white/50">
                        {getTrendIcon()}
                        <span className="capitalize">{analysis.costTrend.toLowerCase()}</span>
                    </div>
                </div>

                {/* Monthly Average */}
                <div className="rounded-lg border border-white/10 bg-[#10131b] p-4">
                    <div className="text-[11px] font-black uppercase tracking-[0.08em] text-[#8a93a7]">
                        Monthly Average
                    </div>
                    <div className="mt-2 text-2xl font-black text-white">
                        {formatCost(analysis.monthlyAverage)}
                    </div>
                    <div className="mt-1 text-sm text-white/50">
                        Last {analysis.forecast.length || 12} months
                    </div>
                </div>

                {/* YTD Cost */}
                <div className="rounded-lg border border-white/10 bg-[#10131b] p-4">
                    <div className="text-[11px] font-black uppercase tracking-[0.08em] text-[#8a93a7]">
                        Year-to-Date
                    </div>
                    <div className="mt-2 text-2xl font-black text-white">
                        {formatCost(analysis.yTDCost)}
                    </div>
                    <div className="mt-1 text-sm text-white/50">
                        Cumulative 2026
                    </div>
                </div>

                {/* Projected Annual */}
                <div className="rounded-lg border border-white/10 bg-[#10131b] p-4">
                    <div className="text-[11px] font-black uppercase tracking-[0.08em] text-[#8a93a7]">
                        Projected Annual
                    </div>
                    <div className="mt-2 text-2xl font-black text-white">
                        {formatCost(analysis.projectedAnnualCost)}
                    </div>
                    <div className="mt-1 text-sm text-white/50">
                        At current rate
                    </div>
                </div>
            </div>

            {/* Top Services */}
            <div className="rounded-lg border border-white/10 bg-[#10131b] p-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.08em] text-[#8a93a7] mb-4">
                    Top Services by Cost
                </h3>
                <div className="space-y-3">
                    {analysis.topServices.map((service) => (
                        <div key={service.service} className="flex items-center gap-3">
                            <div
                                className="h-3 w-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: getServiceColor(service.service as any) }}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between gap-2 mb-1">
                                    <span className="text-sm font-medium text-white">
                                        {getServiceDisplayName(service.service as any)}
                                    </span>
                                    <span className="text-sm font-bold text-[#f97316]">
                                        {formatCost(service.cost)}
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                    <div
                                        className="h-full rounded-full bg-[#f97316]/60"
                                        style={{ width: `${service.percentage}%` }}
                                    />
                                </div>
                                <div className="mt-1 text-[10px] text-white/40">
                                    {formatPercentage(service.percentage)} of total
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cost Forecast */}
            {analysis.forecast.length > 0 && (
                <div className="rounded-lg border border-white/10 bg-[#10131b] p-4">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.08em] text-[#8a93a7] mb-4">
                        Cost Forecast (Next 3 Months)
                    </h3>
                    <div className="space-y-3">
                        {analysis.forecast.map((forecast) => (
                            <div key={forecast.month} className="flex items-center gap-3">
                                <div className="flex-1">
                                    <div className="flex justify-between gap-2 mb-1">
                                        <span className="text-sm font-medium text-white">
                                            {forecast.month}
                                        </span>
                                        <span className="text-sm font-bold text-[#68c7cc]">
                                            {formatCost(forecast.projectedCost)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                                            <div
                                                className="h-full rounded-full bg-[#68c7cc]/60"
                                                style={{ width: `${Math.min((forecast.projectedCost / (analysis.projectedAnnualCost / 12)) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/60">
                                            {forecast.confidence === 'HIGH' ? 'Target' : forecast.confidence === 'MEDIUM' ? 'Warning' : 'Unknown'} {forecast.confidence}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
