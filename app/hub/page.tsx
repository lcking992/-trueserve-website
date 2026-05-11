"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import { CarFront, ShieldCheck, Store } from "lucide-react";

export default function HubPage() {
    const hubs = [
        {
            title: "Fleet Hub",
            sub: "DRIVER PORTAL",
            desc: "Uplink to delivery missions, track earnings, and manage your fleet logistics.",
            href: "/driver/dashboard",
            icon: CarFront,
            color: "#f97316"
        },
        {
            title: "Merchant Hub",
            sub: "PARTNER PORTAL",
            desc: "Command center for orders, menu management, and restaurant performance analytics.",
            href: "/merchant/dashboard",
            icon: Store,
            color: "#f97316"
        },
        {
            title: "Admin Hub",
            sub: "STAFF TERMINAL",
            desc: "High-level oversight of platform operations and support protocols.",
            href: "/admin",
            icon: ShieldCheck,
            color: "#f97316"
        }
    ];

    return (
        <div className="min-h-screen bg-[#000] text-white font-sans selection:bg-[#f97316]/30 selection:text-black overflow-x-hidden pb-40">
             <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&family=Barlow+Condensed:ital,wght@0,700;0,800;1,700;1,800&family=Bebas+Neue&display=swap');
                
                .bebas { font-family: 'Bebas Neue', sans-serif; }
                .barlow-cond { font-family: 'Barlow Condensed', sans-serif; }
            ` }} />

            <header className="px-8 py-10 max-w-[430px] mx-auto flex flex-col items-center">
                <Logo size="md" className="mb-8" />
                <h1 className="bebas text-5xl italic tracking-wide text-white">COMMAND<span className="text-[#f97316]">HUBS.</span></h1>
                <p className="barlow-cond text-[11px] font-black uppercase tracking-[0.3em] text-[#5A5550]">Uplink to your professional terminals</p>
            </header>

            <main className="px-8 max-w-[430px] mx-auto space-y-6">
                {hubs.map((hub, idx) => (
                    (() => {
                    const Icon = hub.icon;
                    return (
                    <Link key={hub.title} href={hub.href} className="
                        group relative block bg-[#0d0d0d] border border-white/5 
                        rounded-[2.5rem] p-8 overflow-hidden transition-all duration-300
                        hover:bg-[#121212] hover:border-[#f97316]/20
                        animate-in fade-in slide-in-from-bottom-4
                    " style={{ animationDelay: `${idx * 100}ms` }}>
                         <div className="absolute top-0 right-0 p-10 text-[#f97316] opacity-10 group-hover:opacity-20 transition-all group-hover:scale-110 pointer-events-none">
                            <Icon size={64} strokeWidth={1.5} />
                        </div>
                        <div className="relative z-10 space-y-3">
                            <div className="flex flex-col">
                                <span className="barlow-cond text-[10px] font-black tracking-[0.3em] text-[#f97316]">{hub.sub}</span>
                                <h3 className="bebas text-4xl italic tracking-wide text-white">{hub.title}</h3>
                            </div>
                            <p className="text-[12px] text-[#444] leading-relaxed max-w-[200px] italic">{hub.desc}</p>
                            <div className="pt-4 flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                                <span className="barlow-cond text-[11px] font-black uppercase tracking-widest text-white">Access Terminal</span>
                                <span className="text-sm text-[#f97316]">→</span>
                            </div>
                        </div>
                    </Link>
                )})()
                ))}

                <div className="pt-12 text-center opacity-30 px-10">
                    <p className="barlow-cond text-[10px] font-black uppercase tracking-[0.3em] text-[#555] italic">Select a hub to synchronize your session with the appropriate operational layer.</p>
                </div>
            </main>
        </div>
    );
}
