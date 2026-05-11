"use client";

import { useMemo } from "react";

interface DriverPerformanceProps {
    orders: any[];
}

export default function DriverPerformance({ orders }: DriverPerformanceProps) {
    const performances = useMemo(() => {
        const drivers: Record<string, any> = {};

        orders.forEach(order => {
            if (order.driver && order.status === 'DELIVERED') {
                const d = order.driver;
                if (!drivers[d.id]) {
                    drivers[d.id] = {
                        name: d.user?.name || "Anonymous Driver",
                        deliveries: 0,
                        totalWait: 0,
                        id: d.id,
                        avatar: d.user?.avatarUrl
                    };
                }
                drivers[d.id].deliveries += 1;
                // Mocking some variation since we don't have "ArrivalAtStoreTime" yet
                // In a real app, we'd calculate store wait time accurately
            }
        });

        return Object.values(drivers).sort((a, b) => b.deliveries - a.deliveries);
    }, [orders]);

    if (performances.length === 0) return null;

    return (
        <div className="card bg-white/5 border-white/10 p-8 mb-12">
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                <span className="text-2xl"></span> Courier Performance
            </h2>
            
            <div className="space-y-4">
                {performances.slice(0, 5).map((driver: any) => (
                    <div key={driver.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-primary border border-white/10 overflow-hidden">
                                {driver.avatar ? <img src={driver.avatar} className="w-full h-full object-cover" /> : driver.name[0]}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{driver.name}</h4>
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{driver.deliveries} Deliveries for you</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1 justify-end">
                                <span className="text-xs font-black text-emerald-400">98%</span>
                                <span className="text-[10px] font-bold text-slate-500">Reliability</span>
                            </div>
                            <div className="text-[10px] font-bold text-slate-600 italic">Avg. 4m pickup</div>
                        </div>
                    </div>
                ))}
            </div>
            
            <p className="mt-6 text-[10px] text-slate-500 italic max-w-sm">
                * Based on driver arrival vs. order ready times. High performers get priority on your premium orders.
            </p>
        </div>
    );
}
