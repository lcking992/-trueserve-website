"use client";

import { useEffect, useState } from "react";
import { getMenuOptimizations, startFlashSale } from "../actions";

interface MenuArchitectProps {
    restaurantId: string;
}

export default function MenuArchitect({ restaurantId }: MenuArchitectProps) {
    const [optimizations, setOptimizations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isApplying, setIsApplying] = useState<string | null>(null);

    useEffect(() => {
        async function fetchOptimizations() {
            const res = await getMenuOptimizations(restaurantId);
            if (res.success) {
                setOptimizations(res.optimizations);
            }
            setIsLoading(false);
        }
        fetchOptimizations();
    }, [restaurantId]);

    const handleApplySale = async (itemId: string) => {
        setIsApplying(itemId);
        try {
            const res = await startFlashSale(itemId, 15, 2); // 15% discount for 2 hours
            if (res.success) {
                setOptimizations(prev => prev.filter(o => o.itemId !== itemId));
                alert("Flash sale started! Price updated for 2 hours.");
            }
        } catch (e) {
            alert("Failed to start sale.");
        } finally {
            setIsApplying(null);
        }
    };

    if (isLoading) return (
        <div className="card bg-white/5 border-white/10 p-8 mb-12 animate-pulse">
            <div className="h-4 w-40 bg-slate-700 rounded mb-4"></div>
            <div className="h-20 w-full bg-slate-800 rounded"></div>
        </div>
    );

    if (optimizations.length === 0) return null;

    return (
        <div className="card bg-gradient-to-br from-emerald-500/10 via-white/5 to-transparent border-emerald-500/20 p-8 mb-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl group-hover:rotate-12 transition-transform duration-700"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">AI Menu Architect</h2>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-black border border-emerald-500/20">Active Analysis</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {optimizations.map((opt, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-all border-dashed">
                            <h4 className="font-black text-lg mb-1">{opt.itemName}</h4>
                            <p className="text-xs text-slate-400 mb-4 line-clamp-2">{opt.reason}</p>
                            
                            <div className="bg-emerald-500/10 p-3 rounded-xl mb-6">
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">AI Suggestion</p>
                                <p className="text-xs font-bold text-white">{opt.suggestion}</p>
                            </div>

                            <button 
                                onClick={() => handleApplySale(opt.itemId)}
                                disabled={isApplying === opt.itemId}
                                className="w-full btn btn-primary py-3 h-auto text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20"
                            >
                                {isApplying === opt.itemId ? "Applying..." : `Launch 15% Flash Sale ($${opt.suggestedPrice.toFixed(2)})`}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 text-[10px] text-slate-500 italic flex justify-between items-center">
                <span>* Our AI analyzes order frequency vs. price points to maximize your revenue during slow periods.</span>
                <span className="font-black text-primary/40 uppercase tracking-widest">Merchant Funded Pilot</span>
            </div>

        </div>
    );
}
