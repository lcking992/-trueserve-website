"use client";

import Link from "next/link";

export default function OnboardingPortal() {
    return (
        <div className="min-h-screen bg-[#02040a] text-white selection:bg-primary font-sans relative overflow-x-hidden">
            {/* Cinematic Background Elements (Restored from Landing Page) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[140px] animate-blob filter" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-primary/5 rounded-full blur-[140px] animate-blob-reverse filter delay-700" />
            </div>

            {/* Standard Nav (Landing Page Style) */}
            <header className="relative z-10 w-full max-w-7xl mx-auto flex justify-between items-center p-8 md:p-12">
                <div className="flex items-center gap-6">
                    <img src="/logo.png" alt="TrueServe Logo" className="w-16 h-16 drop-shadow-[0_0_40px_rgba(245,158,11,0.3)] transition-transform hover:scale-105" />
                    <div className="h-10 w-px bg-white/10 hidden md:block" />
                    <div className="hidden md:block">
                        <h1 className="text-xl font-black text-white uppercase tracking-tighter leading-none">TrueServe</h1>
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mt-1">Operational Partner Network</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => window.print()} className="px-10 py-4 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all italic">
                        Export Directive (PDF)
                    </button>
                </div>
            </header>

            <main className="relative z-10">
                {/* Hero Section (Cinematic Reveal) */}
                <section className="max-w-7xl mx-auto px-8 py-20 text-center md:text-left">
                    <div className="max-w-4xl space-y-8 reveal">
                        <h2 className="text-6xl md:text-8xl font-serif italic text-white tracking-tight leading-none">
                            Your Journey to <br />
                            <span className="text-primary not-italic uppercase font-black tracking-tighter">Elite Delivery.</span>
                        </h2>
                        <p className="text-slate-400 text-xl font-medium leading-relaxed italic max-w-2xl">
                            TrueServe isn’t just a portal; it’s the heartbeat of your digital fleet. 
                            We’ve built this environment to make your transition into the pilot market as seamless 
                            as a premium dining experience.
                        </p>
                    </div>
                </section>

                {/* The 3 Operations (Cards with 32px radii) */}
                <section className="max-w-7xl mx-auto px-8 mb-40">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <OnboardingCard 
                            step="Step 1" 
                            title="Menu & POS" 
                            desc="Synchronize your current menu in minutes. We support Toast, Square, and Clover natively."
                            icon="Folder"
                        />
                        <OnboardingCard 
                            step="Step 2" 
                            title="Fleet Operations" 
                            desc="Real-time routing for our professional drivers. Zero friction, zero paperwork."
                            icon="Finished"
                        />
                        <OnboardingCard 
                            step="Step 3" 
                            title="Bank Settlement" 
                            desc="Automated ежедневный settlements to your business bank. Transparent fee architecture."
                            icon="Bank"
                        />
                    </div>
                </section>

                {/* The Integration Hub (Dark Card Style) */}
                <section className="max-w-7xl mx-auto px-8 mb-40">
                    <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-12 md:p-24 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-12 text-9xl font-black italic text-white/[0.02] select-none pointer-events-none">SYNC</div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                            <div className="space-y-12">
                                <span className="px-6 py-2 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary uppercase tracking-[0.3em]">Hardware Handshake</span>
                                <h3 className="text-5xl font-serif italic text-white tracking-tighter leading-tight">
                                    Linking your physical <br />
                                    <span className="text-slate-400 not-italic uppercase font-black tracking-[0.1em]">Store Terminal.</span>
                                </h3>
                                <p className="text-slate-500 text-lg font-medium leading-relaxed italic border-l-2 border-primary/30 pl-8 py-2">
                                    Whether you’re on Toast or Square, our system was built to talk to your hardware 
                                    within 300ms. No complex APIs, just simple authorization.
                                </p>
                                <Link href="/merchant/dashboard" className="inline-block px-14 py-5 bg-primary text-black font-black uppercase text-[11px] tracking-widest rounded-full hover:scale-105 transition-all shadow-2xl shadow-primary/20 h-glow italic">
                                    Access Merchant Dashboard →
                                </Link>
                            </div>

                            <div className="space-y-6">
                                <GuidelineItem 
                                    title="Toast Partners" 
                                    desc="Select 'TrueServe' in your Toast Integration dashboard and generate a Client Secret." 
                                />
                                <GuidelineItem 
                                    title="Square Partners" 
                                    desc="Clone your Production Access Token from the Square Developer console instantly." 
                                />
                                <GuidelineItem 
                                    title="Manual Setup" 
                                    desc="Our engineers will hand-map your menu if you aren't using a digital POS system." 
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer Acknowledgement */}
                <footer className="max-w-7xl mx-auto px-8 pt-20 border-t border-white/5 pb-20 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-black uppercase text-white tracking-widest leading-none">Launch Support Standing By</p>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-2 italic">status: verified pilot system</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">Official Partner: <span className="text-white">TRUE-SERVE-PN-2026</span></p>
                    </div>
                </footer>
            </main>

            <style jsx>{`
                @media print {
                    body { background: white !important; color: black !important; padding: 0 !important; }
                    .min-h-screen { background: white !important; }
                    .absolute, .animate-blob, .animate-blob-reverse { display: none !important; }
                    .bg-\[\#0a0c10\] { border: 1px solid #eee !important; background: transparent !important; }
                    .text-white { color: black !important; }
                    .text-slate-400, .text-slate-500 { color: #555 !important; }
                    .text-primary { color: #f59e0b !important; }
                    footer, header button { display: none !important; }
                }
            `}</style>
        </div>
    );
}

function OnboardingCard({ step, title, desc, icon }: { step: string, title: string, desc: string, icon: string }) {
    return (
        <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-8 hover:border-primary/30 transition-all group backdrop-blur-3xl shadow-xl shadow-black/50">
            <div className="flex justify-between items-start">
                <span className="text-4xl grayscale group-hover:grayscale-0 transition-all">{icon}</span>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block mt-2">{step}</span>
            </div>
            <div>
                <h4 className="text-2xl font-serif italic text-white tracking-tighter group-hover:text-primary transition-colors mb-4 leading-none">{title}</h4>
                <p className="text-[11px] text-slate-600 font-bold italic leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

function GuidelineItem({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="p-8 bg-black/40 border border-white/5 rounded-3xl space-y-3 group hover:border-white/10 transition-all">
            <h4 className="text-xs font-black uppercase text-primary tracking-[0.3em] italic">{title}</h4>
            <p className="text-[11px] text-slate-500 font-bold italic leading-relaxed group-hover:text-slate-300 transition-colors">{desc}</p>
        </div>
    );
}

