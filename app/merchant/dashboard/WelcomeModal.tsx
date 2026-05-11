
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function WelcomeModal({ restaurantName }: { restaurantName: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        if (searchParams.get("welcome") === "true" || searchParams.get("welcome") === "mountairy") {
            setIsOpen(true);
        }
    }, [searchParams]);

    const close = () => {
        setIsOpen(false);
        // Clean up URL without refresh
        const params = new URLSearchParams(searchParams.toString());
        params.delete("welcome");
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-500">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 border border-primary/20 shadow-inner">
                    
                </div>
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome, {restaurantName}!</h2>
                <p className="text-slate-400 mb-8 font-medium">
                    Your TrueServe terminal is ready. Let's start serving your community with style and speed.
                </p>
                <button
                    onClick={close}
                    className="w-full py-4 bg-primary text-black rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                >
                    Enter Terminal
                </button>
            </div>
        </div>
    );
}
