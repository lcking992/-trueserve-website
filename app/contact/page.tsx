"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { submitContactForm } from "./actions";

const ROLES = [
    { value: "customer", label: "Customer" },
    { value: "merchant", label: "Restaurant / Merchant" },
    { value: "driver", label: "Driver" },
    { value: "press", label: "Press / Media" },
    { value: "investor", label: "Investor" },
    { value: "other", label: "Other" },
];

const FAQ_QUICK = [
    { q: "How do I track my order?", a: "Log in and visit Orders — you'll see live status and a map.", href: "/orders" },
    { q: "I'm a restaurant and want to join.", a: "Apply as a merchant — setup takes under 10 minutes.", href: "/merchant/signup" },
    { q: "How do I sign up to drive?", a: "Complete the driver application and we'll review your docs.", href: "/driver/signup" },
    { q: "Billing or payment issue?", a: "Email us directly and include your order number.", href: "mailto:support@trueserve.delivery" },
];

export default function ContactPage() {
    const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus("sending");
        const fd = new FormData(e.currentTarget);
        const res = await submitContactForm(fd);
        if (res.success) {
            setStatus("done");
        } else {
            setStatus("error");
            setErrorMsg(res.error || "Something went wrong.");
        }
    };

    return (
        <div className="food-app-shell">
            <nav className="food-app-nav">
                <Logo size="sm" />
                <div className="nav-links hidden md:flex">
                    <Link href="/restaurants">Order Food</Link>
                    <Link href="/rewards">Rewards</Link>
                    <Link href="/merchant/signup">For Merchants</Link>
                    <Link href="/driver/signup">For Drivers</Link>
                </div>
                <div className="flex gap-2">
                    <Link href="/login" className="btn btn-ghost">Sign In</Link>
                </div>
            </nav>

            <main className="food-app-main">

                {/* HERO */}
                <section className="food-panel relative overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.15),transparent_60%)]" />
                    <div className="relative z-10 text-center max-w-2xl mx-auto py-4">
                        <p className="food-kicker mb-4">Get in Touch</p>
                        <h1 className="food-heading" style={{ fontSize: "clamp(40px, 7vw, 72px)", lineHeight: 0.95 }}>
                            We&rsquo;re here<br /><span className="accent">to help.</span>
                        </h1>
                        <p className="food-subtitle mt-4 mx-auto" style={{ maxWidth: 460 }}>
                            Questions about ordering, partnering as a restaurant, or joining as a driver — reach out and we&rsquo;ll get back to you within one business day.
                        </p>
                    </div>
                </section>

                {/* QUICK LINKS */}
                <section className="mt-6 grid gap-3 sm:grid-cols-2">
                    {FAQ_QUICK.map((item) => (
                        <Link
                            key={item.q}
                            href={item.href}
                            className="food-card group flex items-start gap-4 hover:border-[rgba(249,115,22,0.3)] transition-colors"
                        >
                            <div className="shrink-0 mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center bg-[rgba(249,115,22,0.1)] border border-[rgba(249,115,22,0.2)] text-[#f97316] text-sm">→</div>
                            <div>
                                <p className="font-black text-white text-sm mb-1 group-hover:text-[#f97316] transition-colors">{item.q}</p>
                                <p className="text-xs text-white/45 leading-relaxed">{item.a}</p>
                            </div>
                        </Link>
                    ))}
                </section>

                {/* CONTACT FORM + INFO */}
                <section className="mt-6 grid gap-6 md:grid-cols-[1fr_320px]">

                    {/* FORM */}
                    <div className="food-panel">
                        {status === "done" ? (
                            <div className="text-center py-12">
                                <div className="mb-4 flex justify-center">
                                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                </div>
                                <h2 className="food-heading !text-[32px] mb-2">Message sent!</h2>
                                <p className="text-sm text-white/50 mb-6">We&rsquo;ll reply to your email within 1 business day.</p>
                                <button
                                    className="btn btn-gold"
                                    onClick={() => setStatus("idle")}
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <h2 className="food-heading !text-[28px] mb-6">Send us a message</h2>

                                <div className="grid gap-4 sm:grid-cols-2 mb-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.14em] text-white/40 mb-2">Your Name *</label>
                                        <input
                                            required
                                            name="name"
                                            type="text"
                                            placeholder="Jordan Smith"
                                            className="w-full bg-[#0f1210] border border-[#1e2420] focus:border-[#f97316] rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/20"
                                            disabled={status === "sending"}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.14em] text-white/40 mb-2">Email Address *</label>
                                        <input
                                            required
                                            name="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            className="w-full bg-[#0f1210] border border-[#1e2420] focus:border-[#f97316] rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/20"
                                            disabled={status === "sending"}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 mb-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.14em] text-white/40 mb-2">I am a…</label>
                                        <select
                                            name="role"
                                            defaultValue="customer"
                                            className="w-full bg-[#0f1210] border border-[#1e2420] focus:border-[#f97316] rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors cursor-pointer"
                                            disabled={status === "sending"}
                                        >
                                            {ROLES.map(r => (
                                                <option key={r.value} value={r.value}>{r.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.14em] text-white/40 mb-2">Subject</label>
                                        <input
                                            name="subject"
                                            type="text"
                                            placeholder="Order issue, partnership, etc."
                                            className="w-full bg-[#0f1210] border border-[#1e2420] focus:border-[#f97316] rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/20"
                                            disabled={status === "sending"}
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.14em] text-white/40 mb-2">Message *</label>
                                    <textarea
                                        required
                                        name="message"
                                        rows={5}
                                        placeholder="Tell us what's on your mind..."
                                        className="w-full bg-[#0f1210] border border-[#1e2420] focus:border-[#f97316] rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/20 resize-none"
                                        disabled={status === "sending"}
                                    />
                                </div>

                                {status === "error" && (
                                    <div className="mb-4 px-4 py-3 rounded-xl bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.2)] text-[#f87171] text-sm">
                                        {errorMsg}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === "sending"}
                                    className="portal-btn-gold w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {status === "sending" ? "Sending…" : "Send Message →"}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* INFO SIDEBAR */}
                    <div className="flex flex-col gap-4">
                        <div className="food-panel">
                            <p className="food-kicker mb-3">Direct Contact</p>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35 mb-1">Support</p>
                                    <a href="mailto:support@trueserve.delivery" className="text-sm text-white hover:text-[#f97316] transition-colors font-semibold">
                                        support@trueserve.delivery
                                    </a>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35 mb-1">Merchant Partnerships</p>
                                    <a href="mailto:merchants@trueserve.delivery" className="text-sm text-white hover:text-[#f97316] transition-colors font-semibold">
                                        merchants@trueserve.delivery
                                    </a>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35 mb-1">Response Time</p>
                                    <p className="text-sm text-white/60">Within 1 business day</p>
                                </div>
                            </div>
                        </div>

                        <div className="food-panel">
                            <p className="food-kicker mb-3">Service Area</p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#4dca80] shrink-0" />
                                    <p className="text-sm text-white/70">Pineville, NC</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#4dca80] shrink-0" />
                                    <p className="text-sm text-white/70">Rock Hill, SC</p>
                                </div>
                                <p className="text-xs text-white/30 mt-3 leading-relaxed">Pilot launch. More markets coming soon.</p>
                            </div>
                        </div>

                        <div className="food-panel">
                            <p className="food-kicker mb-3">Quick Links</p>
                            <div className="space-y-2">
                                {[
                                    { label: "Order Food", href: "/restaurants" },
                                    { label: "Merchant Signup", href: "/merchant/signup" },
                                    { label: "Drive for TrueServe", href: "/driver/signup" },
                                    { label: "Rewards", href: "/rewards" },
                                    { label: "Privacy Policy", href: "/privacy" },
                                    { label: "Terms of Service", href: "/terms" },
                                ].map(l => (
                                    <Link key={l.href} href={l.href} className="flex items-center justify-between text-sm text-white/50 hover:text-[#f97316] transition-colors py-0.5">
                                        {l.label} <span className="text-xs opacity-50">→</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            <footer className="mt-8 border-t border-white/5 px-2 pt-10 pb-12 text-center">
                <div className="mx-auto flex max-w-7xl flex-col items-center gap-5">
                    <Logo size="md" />
                    <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/contact" className="hover:text-[#f97316] transition-colors">Contact</Link>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                        © {new Date().getFullYear()} TrueServe · Built for local restaurants.
                    </p>
                </div>
            </footer>
        </div>
    );
}
