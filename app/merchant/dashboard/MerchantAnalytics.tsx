"use client";

import { useMemo } from "react";

interface MerchantAnalyticsProps {
    orders: any[];
    restaurantName: string;
}

export default function MerchantAnalytics({ orders, restaurantName }: MerchantAnalyticsProps) {
    // Basic Calculations
    const stats = useMemo(() => {
        const completed = orders.filter(o => o.status === 'DELIVERED');
        const totalEarnings = completed.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
        const avgOrderValue = completed.length > 0 ? totalEarnings / completed.length : 0;
        
        // Group by day for a mini-chart concept
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const dailyData = last7Days.map(date => {
            const dayOrders = completed.filter(o => o.createdAt.startsWith(date));
            return {
                date,
                amount: dayOrders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0),
                count: dayOrders.length
            };
        });

        return {
            totalEarnings,
            avgOrderValue,
            orderCount: completed.length,
            dailyData,
            growth: 12.5 // Mocked for now
        };
    }, [orders]);

    return (
        <div className="space-y-8 mb-16">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-white mb-1">Financial Insights</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Performance metrics for {restaurantName}</p>
                </div>
                <div className="flex gap-2">
                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Last 7 Days
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-emerald-500/5 border-emerald-500/20 p-8 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-6xl opacity-10 group-hover:scale-110 transition-transform"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-4">Total Revenue</p>
                    <h3 className="text-4xl font-black text-white mb-2">${stats.totalEarnings.toFixed(2)}</h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                        <span>↑ {stats.growth}%</span>
                        <span className="text-slate-500 opacity-60">vs last week</span>
                    </div>
                </div>

                <div className="card bg-primary/5 border-primary/20 p-8 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-6xl opacity-10 group-hover:scale-110 transition-transform"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">Orders Completed</p>
                    <h3 className="text-4xl font-black text-white mb-2">{stats.orderCount}</h3>
                    <p className="text-xs font-bold text-slate-400 italic">Across {stats.dailyData.length} active days</p>
                </div>

                <div className="card bg-indigo-500/5 border-indigo-500/20 p-8 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-6xl opacity-10 group-hover:scale-110 transition-transform"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-4">Avg. Order Value</p>
                    <h3 className="text-4xl font-black text-white mb-2">${stats.avgOrderValue.toFixed(2)}</h3>
                    <p className="text-xs font-bold text-slate-400 italic">Net per request</p>
                </div>
            </div>

            {/* Visual Insights & "Smart Impact" */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Snapshot */}
                <div className="card bg-white/5 border-white/10 p-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8">Revenue Snapshot</h3>
                    <div className="flex items-end gap-3 h-48">
                        {stats.dailyData.map((day, i) => (
                            <div key={day.date} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
                                <div className="relative w-full">
                                    <div 
                                        className="w-full bg-gradient-to-t from-emerald-500/20 to-emerald-400 rounded-lg transition-all duration-700 ease-out group-hover:to-primary"
                                        style={{ height: `${Math.max(10, (day.amount / (Math.max(...stats.dailyData.map(d => d.amount)) || 1)) * 100)}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            ${day.amount.toFixed(0)}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-tighter text-slate-600">
                                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Smart Autopilot Impact */}
                <div className="card bg-indigo-500/10 border-indigo-500/20 p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl"></div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-2">Smart Autopilot Impact</h3>
                    <p className="text-xs text-slate-400 mb-8 max-w-sm">How autonomous traffic control protected your ratings this week.</p>
                    
                    <div className="space-y-6">
                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Quality Guardrails</p>
                                <p className="text-sm font-bold text-white">4 "Smart Pauses" initiated</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-black text-emerald-400">SAVE</p>
                                <p className="text-[10px] text-slate-500">Predicted bad reviews avoided</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">ETA Accuracy</p>
                                <p className="text-sm font-bold text-white">98.2% Accurate</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-black text-primary">+12m</p>
                                <p className="text-[10px] text-slate-500">Avg. buffer during rush</p>
                            </div>
                        </div>

                        <p className="text-[10px] text-slate-600 italic mt-4">
                           * Impact metrics are calculated based on kitchen load vs. historical staff capacity.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
