"use client";

import { useState } from "react";
import { cancelMembership, subscribeToPlus } from "@/app/user/settings/actions";

export default function MembershipUI({ 
    userId, 
    plan, 
    hasPaymentMethod 
}: { 
    userId: string, 
    plan: string,
    hasPaymentMethod: boolean 
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isPlus = plan === "Plus";

    const handleSubscribe = async () => {
        if (!hasPaymentMethod) {
            setError("Protocol Error: Add a payment method to your wallet first.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await subscribeToPlus(userId);
            if (result.error) throw new Error(result.error);
        } catch(e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel your TrueServe Plus membership? You will lose free delivery on all orders.")) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const result = await cancelMembership(userId);
            if (result.error) throw new Error(result.error);
        } catch(e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#131313] border border-white/5 p-8 rounded-[2rem] shadow-2xl backdrop-blur-md relative overflow-hidden font-barlow-cond">
             {/* Subtle Glow */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#f97316]/10 blur-[50px] rounded-full -mr-16 -mt-16 pointer-events-none"></div>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="font-bebas text-white text-3xl uppercase italic leading-none tracking-wider">TrueServe <span className="text-[#f97316]">Plus</span></h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A5550] mt-2 italic">Elite Tier Status</p>
                </div>
                {isPlus && (
                    <div className="bg-[#f97316]/10 border border-[#f97316]/20 text-[#f97316] rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest animate-pulse">
                        S Tier Member
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-6 text-[10px] font-bold uppercase tracking-widest text-[#f97316] bg-[#f97316]/5 border border-[#f97316]/20 p-4 rounded-xl">
                    Warning {error}
                </div>
            )}

            <div className="space-y-6">
                <p className="text-xs text-slate-400 font-medium leading-relaxed italic border-l-2 border-[#f97316]/30 pl-4 py-1">
                    {isPlus 
                        ? "Protocol Active: Enjoying $0 delivery fees on all orders and priority courier dispatch." 
                        : "Unlock $0 delivery fees on all local orders, exclusive marketplace discounts, and priority courier matching."}
                </p>
                
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bebas text-white">$9.99</span>
                    <span className="text-[#5A5550] uppercase tracking-widest text-[10px] font-bold italic">/ cycle</span>
                </div>

                {isPlus ? (
                    <button 
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="w-full py-4 border border-white/5 text-slate-500 hover:text-red-500 hover:border-red-500/20 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-50"
                    >
                        {isLoading ? "DEACTIVATING..." : "CANCEL MEMBERSHIP"}
                    </button>
                ) : (
                    <button 
                        onClick={handleSubscribe}
                        disabled={isLoading}
                        className="w-full py-5 bg-[#f97316] text-black font-bebas text-lg uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.15)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                    >
                        {isLoading ? "UPLOADING..." : "UPGRADE TO PLUS"}
                    </button>
                )}
            </div>
            {!isPlus && !hasPaymentMethod && (
                <p className="text-[9px] text-[#5A5550] text-center mt-6 font-bold uppercase tracking-widest italic opacity-60">Pending Wallet Integration</p>
            )}
        </div>
    );
}
