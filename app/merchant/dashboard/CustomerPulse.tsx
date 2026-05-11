"use client";

import { useEffect, useState } from "react";
import { getMerchantSentiment } from "../actions";

interface CustomerPulseProps {
    restaurantId: string;
}

export default function CustomerPulse({ restaurantId }: CustomerPulseProps) {
    const [analysis, setAnalysis] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchPulse() {
            const res = await getMerchantSentiment(restaurantId);
            if (res.success) {
                setAnalysis(res.analysis);
            }
            setIsLoading(false);
        }
        fetchPulse();
    }, [restaurantId]);

    if (isLoading) {
        return (
            <div className="card bg-white/5 border-white/10 p-8 mb-12 animate-pulse">
                <div className="h-4 w-32 bg-slate-700 rounded mb-4"></div>
                <div className="h-8 w-64 bg-slate-800 rounded"></div>
            </div>
        );
    }

    if (!analysis) return null;

    const scoreColor = analysis.sentimentScore > 75 ? 'text-emerald-400' : analysis.sentimentScore > 40 ? 'text-orange-400' : 'text-red-400';

    return (
        <div className="card bg-white/5 border-white/10 p-8 mb-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl group-hover:scale-110 transition-transform duration-700"></div>
            
            <div className="flex flex-col lg:flex-row gap-12 relative z-10">
                {/* Score Section */}
                <div className="lg:w-1/3 flex flex-col items-center justify-center text-center p-6 bg-white/5 rounded-[2rem] border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Customer Mood</p>
                    <h3 className={`text-6xl font-black ${scoreColor} mb-2 tracking-tighter`}>{analysis.sentimentScore}%</h3>
                    <p className="text-xs font-bold text-white max-w-[200px] leading-relaxed italic opacity-80">"{analysis.summary}"</p>
                </div>

                {/* Insights Section */}
                <div className="flex-1 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>
                                Top Strengths
                            </h4>
                            <ul className="space-y-3">
                                {analysis.strengths.map((s: string, i: number) => (
                                    <li key={i} className="text-xs font-medium text-slate-300 flex items-start gap-3">
                                        <span className="text-emerald-400 opacity-60">Done</span> {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.5)]"></span>
                                Growth Areas
                            </h4>
                            <ul className="space-y-3">
                                {analysis.weaknesses.map((w: string, i: number) => (
                                    <li key={i} className="text-xs font-medium text-slate-300 flex items-start gap-3">
                                        <span className="text-orange-400 opacity-60">•</span> {w}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <div className="bg-primary/10 border border-primary/20 p-5 rounded-2xl flex items-start gap-4">
                            <span className="text-2xl mt-0.5"></span>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">AI Recommendation</p>
                                <p className="text-xs font-bold text-white leading-relaxed">{analysis.recommendation}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 right-8 flex items-center gap-2 opacity-30">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></span>
                <span className="text-[8px] font-black tracking-widest uppercase">Live AI Pulse</span>
            </div>
        </div>
    );
}
