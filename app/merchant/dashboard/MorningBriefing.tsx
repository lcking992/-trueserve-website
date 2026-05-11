"use client";

import { useEffect, useState } from "react";
import { getMerchantBriefing } from "../actions";

interface MorningBriefingProps {
    restaurantId: string;
}

export default function MorningBriefing({ restaurantId }: MorningBriefingProps) {
    const [briefing, setBriefing] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchBriefing() {
            const res = await getMerchantBriefing(restaurantId);
            if (res.success) {
                setBriefing(res.briefing);
            }
            setIsLoading(false);
        }
        fetchBriefing();
    }, [restaurantId]);

    if (isLoading) {
        return (
            <div className="card bg-white/5 border-white/10 p-6 mb-8 animate-pulse">
                <div className="h-4 w-32 bg-slate-700 rounded mb-4"></div>
                <div className="space-y-2">
                    <div className="h-4 w-full bg-slate-800 rounded"></div>
                    <div className="h-4 w-2/3 bg-slate-800 rounded"></div>
                </div>
            </div>
        );
    }

    if (!briefing) return null;

    return (
        <div className="card bg-gradient-to-br from-indigo-500/10 via-white/5 to-transparent border-indigo-500/20 p-6 mb-8 relative overflow-hidden">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-2xl border border-indigo-500/30">☕</div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-sm font-black uppercase tracking-widest text-indigo-400">Merchant Morning Briefing</h2>
                        <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded italic">AI Generated</span>
                    </div>
                    
                    <div className="space-y-4">
                        <p className="text-base font-bold text-white leading-relaxed">
                            {briefing.gamePlan}
                        </p>
                        
                        {briefing.criticalAlert && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                                <span className="text-lg"></span>
                                <p className="text-xs font-bold text-red-400 leading-normal">{briefing.criticalAlert}</p>
                            </div>
                        )}
                        
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
                            <span className="text-lg">Trend</span>
                            <p className="text-xs font-bold text-emerald-400 leading-normal">{briefing.opportunity}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="absolute top-0 right-0 p-8 opacity-5 text-9xl pointer-events-none">✨</div>
        </div>
    );
}
