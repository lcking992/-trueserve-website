
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import FadeInSection from '@/components/FadeInSection';

export default function BenefitsPage() {
    const [selectedTier, setSelectedTier] = useState('Plus');

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary/30">
            {/* Header */}
            <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/5 px-6 py-4 bg-black/50">
                <div className="container flex justify-between items-center">
                    <Logo size="md" />
                    <Link href="/restaurants" className="btn btn-outline border-white/10 text-xs py-2 px-6 hover:bg-white/5 transition-all">
                        Back to Ordering
                    </Link>
                </div>
            </nav>

            <main className="container max-w-7xl py-20 px-6 mx-auto">
                <div className="text-center mb-40 relative px-4 text-white flex flex-col items-center justify-center">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] -z-10 animate-pulse" />
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.05] border border-white/10 rounded-full text-white text-[10px] md:text-xs font-black uppercase tracking-widest shadow-2xl backdrop-blur-sm mb-10">
                        <span>Membership 2.0</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-tight text-center">
                        Built for <br />
                        <span className="text-gradient italic">Community.</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed font-medium text-center" style={{ textWrap: 'balance' }}>
                        A new standard in delivery, built specifically for local restaurants and the community that supports them.
                    </p>
                </div>

                {/* Tiered Membership Model - Fixed Clickability */}
                <FadeInSection className="mb-48 relative z-20">
                    <h2 className="text-center text-3xl md:text-4xl font-black mb-16 tracking-tight uppercase">Choose Your Standard</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 max-w-6xl mx-auto px-4">
                        <PricingCard
                            tier="Basic"
                            price="Free"
                            subtitle="The standard access"
                            isActive={selectedTier === 'Basic'}
                            onClick={() => setSelectedTier('Basic')}
                            features={[
                                "Access to platform",
                                "Standard delivery times",
                                "Basic rewards points",
                                "Community news & updates"
                            ]}
                            buttonText="Get Started"
                            buttonLink="/login"
                        />
                        <PricingCard
                            tier="Plus"
                            price="$9.99"
                            subtitle="The community favorite"
                            isActive={selectedTier === 'Plus'}
                            onClick={() => setSelectedTier('Plus')}
                            features={[
                                "Standard delivery times",
                                "Priority driver dispatch",
                                "Exclusive early access",
                                "5% Member-only discount",
                                "Annual birthday credit"
                            ]}
                            buttonLink="/login?plus=true"
                        />
                        <PricingCard
                            tier="Premium"
                            price="$19.99"
                            subtitle="The ultimate standard"
                            isActive={selectedTier === 'Premium'}
                            onClick={() => setSelectedTier('Premium')}
                            features={[
                                "Zero delivery fees on all orders",
                                "Exclusive early access menu items",
                                "24/7 Concierge support",
                                "Double loyalty rewards points",
                                "Advanced 7-day scheduling"
                            ]}
                            buttonLink="/login?premium=true"
                        />
                    </div>
                </FadeInSection>

                {/* Detailed Features Sections */}
                <FadeInSection className="space-y-40 mb-40">
                    {/* 1. Restaurant-First Value */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-emerald-400 font-black uppercase tracking-widest text-[10px]">Restaurant-First Value</span>
                            <h2 className="text-4xl font-bold mt-4 mb-8 leading-tight">Your loyalty helps <br /> restaurants thrive.</h2>
                            <div className="space-y-8">
                                <FeatureDetail
                                    icon="🏷️"
                                    title="Member-Only Discounts"
                                    text="Get 5–10% off at participating local spots. Restaurants fund this exposure directly because they love your loyalty."
                                />
                                <FeatureDetail
                                    icon="⭐"
                                    title="TrueServe Local Favorites"
                                    text="Early access to limited menu items, member-only tasting menus, and special weekly chef drops."
                                />
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="w-full aspect-square bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent rounded-[4rem] border border-white/5 flex items-center justify-center p-20 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.2),transparent_70%)]" />
                                <div className="text-[120px] filter drop-shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-float" style={{ animationDelay: '1s' }}>🤝</div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Convenience & Experience */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="hidden lg:block">
                            <div className="w-full aspect-square bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent rounded-[4rem] border border-white/5 flex items-center justify-center p-20 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(68,140,137,0.2),transparent_70%)]" />
                                <div className="text-[120px] filter drop-shadow-[0_0_30px_rgba(68,140,137,0.3)] animate-float">📱</div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <span className="text-primary font-black uppercase tracking-widest text-[10px] bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Convenience & Experience</span>
                            <h2 className="text-3xl md:text-5xl font-black mt-8 mb-10 leading-tight tracking-tight text-white">
                                Elevate your order <br /> from start to finish.
                            </h2>
                            <div className="space-y-10">
                                <FeatureDetail
                                    icon="⚡"
                                    title="Priority Dispatch & Support"
                                    text="Faster driver assignment and peak-hour prioritization. Plus a dedicated, instant-reply support lane."
                                />
                                <FeatureDetail
                                    icon="📊"
                                    title="Transparent Pricing"
                                    text="No hidden service fees. See exactly what the restaurant and driver earn on every single checkout. We believe in fair markets."
                                />
                                <FeatureDetail
                                    icon="📱"
                                    title="Reorder Concierge"
                                    text="One-click reorders of your go-to meals and scheduled recurring deliveries for your weekly routine."
                                />
                            </div>
                        </div>
                    </div>
                </FadeInSection>

                {/* Strategic Call to Action */}
                <FadeInSection className="text-center mb-40">
                    <h2 className="text-4xl font-black mb-6">Start Your Standard.</h2>
                    <p className="text-slate-400 mb-12">Launch features include Priority Dispatch, Order Protection, and 5% Restaurant Savings.</p>
                    <Link href="/login" className="btn btn-primary px-12 py-5 text-xl shadow-2xl shadow-primary/30 rounded-2xl">
                        Join {selectedTier} Today
                    </Link>
                </FadeInSection>

            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 py-20 px-6 bg-slate-900/20 backdrop-blur-md">
                <div className="container max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-white">
                    <div>
                        <Logo size="md" className="mb-4" />
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                            Redefining the relationship between <br />
                            restaurants, drivers, and the community.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function PricingCard({ tier, price, subtitle, isActive = false, onClick, features, buttonText = "Join " + tier, buttonLink = "/login" }: any) {
    return (
        <div
            onClick={onClick}
            className={`cursor-pointer group relative rounded-[3.5rem] border-2 flex flex-col items-center text-center transition-all duration-500 h-full overflow-hidden scale-[0.98] hover:scale-[1.02] ${isActive
                ? 'bg-slate-900 border-primary shadow-[0_0_80px_rgba(68,140,137,0.15)] z-10 scale-[1.03] ring-1 ring-primary/20'
                : 'bg-white/5 border-white/10 z-0 hover:border-white/30 hover:bg-white/[0.08]'
                }`}>

            {/* Active Glow Effect */}
            {isActive && (
                <div className="absolute inset-0 bg-primary/5 rounded-[3.5rem] blur-2xl -z-10 animate-pulse" />
            )}

            <div className="flex-1 w-full p-10 md:p-12 pb-8 md:pb-10 flex flex-col items-center">
                <div className="mb-8 w-full">
                    <h3 className={`text-3xl font-black mb-2 transition-colors ${isActive ? 'text-primary' : 'text-white'}`}>{tier}</h3>
                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{subtitle}</p>
                </div>

                <div className="flex items-end justify-center gap-1 mb-10 w-full text-white">
                    <span className="text-6xl font-black tracking-tighter">{price}</span>
                    {price !== 'Free' && <span className="text-sm text-slate-500 font-bold mb-2">/ mo</span>}
                </div>

                <ul className="space-y-5 w-full flex-1">
                    {features.map((f: string) => (
                        <li key={f} className="text-sm text-slate-400 font-bold flex items-center justify-center gap-3">
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${isActive ? 'bg-primary' : 'bg-primary/40'}`} />
                            <span className="leading-tight">{f}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <Link
                href={buttonLink}
                onClick={(e) => e.stopPropagation()}
                className={`block w-full py-6 font-black text-sm uppercase tracking-widest transition-all text-center relative z-20 ${isActive
                    ? 'bg-primary text-black hover:bg-white'
                    : 'bg-white/10 text-white hover:bg-white/20 border-t border-white/10'
                    }`}
            >
                {buttonText}
            </Link>
        </div>
    )
}

function FeatureDetail({ icon, title, text }: { icon: string, title: string, text: string }) {
    return (
        <div className="flex gap-6 items-start group">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl border border-white/5 shrink-0 group-hover:scale-110 group-hover:border-primary/50 group-hover:bg-primary/10 transition-all duration-300">
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm font-medium">{text}</p>
            </div>
        </div>
    )
}

