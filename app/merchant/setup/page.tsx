"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import FadeInSection from "@/components/FadeInSection";
import { motion } from "motion/react";
import {
    LogIn, ShoppingBag, UtensilsCrossed, Clock, CreditCard,
    CheckCircle, AlertCircle, Phone, ChevronRight, Printer
} from "lucide-react";

const STEPS = [
    {
        number: "01",
        icon: LogIn,
        title: "Log In to Your Dashboard",
        color: "#f97316",
        tldr: "Go to the website and sign in with the email and password we gave you.",
        body: [
            "Open any web browser on your phone, tablet, or computer.",
            'Go to: trueservedelivery.com/merchant/login',
            "Enter the email address we set up for your restaurant.",
            "Enter your password. If you forget it, click \"Forgot password?\" and we'll email you a reset link.",
            'After signing in, you\'ll land on your Dashboard — your home base for everything.',
        ],
        tip: "Bookmark the login page on your phone so you can get to it quickly during the rush.",
        tipType: "info" as const,
    },
    {
        number: "02",
        icon: ShoppingBag,
        title: "Accepting & Managing Orders",
        color: "#4dca80",
        tldr: "When a customer orders from you, you'll get a notification. Tap Accept to confirm it.",
        body: [
            'From your Dashboard, click "Live Orders" in the left menu.',
            "New orders show up here automatically — you don't need to refresh.",
            'Tap the orange "Accept" button on any new order to confirm you received it.',
            "Once you're done preparing the food, tap \"Mark as Ready\" — this tells the driver to come pick it up.",
            'If you can\'t fulfill an order (out of an ingredient, closing early), tap "Reject" and choose a reason.',
        ],
        tip: "Keep your dashboard open on a tablet at the counter. Orders come in in real time.",
        tipType: "info" as const,
        warning: "Don't let orders sit unaccepted for more than 5 minutes — customers can see if you're slow to respond.",
    },
    {
        number: "03",
        icon: UtensilsCrossed,
        title: "Updating Your Menu",
        color: "#6b8ee8",
        tldr: "You can change prices, add new items, or mark things as unavailable anytime.",
        body: [
            'In the left menu, click "Menu."',
            "You'll see all your items listed by category.",
            'To change a price: click the item, update the number next to "Price," then click Save.',
            'To mark something as unavailable (sold out, out of season): flip the toggle next to the item to off.',
            'To add a new item: click the green "+ Add Item" button, fill in the name, description, price, and category.',
            "Changes go live on the customer app within a few seconds.",
        ],
        tip: "Update your menu before you open each day so customers always see what's actually available.",
        tipType: "info" as const,
    },
    {
        number: "04",
        icon: Clock,
        title: "Setting Your Hours",
        color: "#f97316",
        tldr: "Tell the app when you're open so customers only order when you can actually deliver.",
        body: [
            'In the left menu, click "Hours."',
            "You'll see a simple table with each day of the week.",
            "Click on a day to set your open and close times.",
            'If you\'re closed on a specific day, flip the toggle next to that day to "Closed."',
            'If you need to close early for a holiday or emergency, go to the top of your Dashboard and click "Pause Orders" — this temporarily stops new orders from coming in.',
            'When you\'re ready to accept orders again, click "Resume Orders."',
        ],
        tip: "Set your hours to close 15–20 minutes before your actual close time so the last orders don't run over.",
        tipType: "info" as const,
    },
    {
        number: "05",
        icon: CreditCard,
        title: "Getting Paid",
        color: "#4dca80",
        tldr: "Payments deposit automatically to your bank account every week.",
        body: [
            "TrueServe takes 15% from each completed order. The rest goes straight to you.",
            "Payouts happen every Wednesday for the previous week's orders.",
            'To see your earnings: click "Analytics" in the left menu, then select "Payouts."',
            "You'll see a breakdown of every order, what TrueServe took, and what was deposited.",
            "If you need to update your bank account information, go to Settings → Payout Account.",
            "If a payout is missing or wrong, contact us at merchants@trueserve.delivery with your restaurant name.",
        ],
        tip: "There are no monthly fees, no signup fees, and no surprise charges. 15% flat on completed orders only.",
        tipType: "success" as const,
    },
];

const FAQ = [
    {
        q: "What if I can't figure something out?",
        a: "Email us at merchants@trueserve.delivery or call/text us. We'll walk you through it step by step — no tech knowledge required."
    },
    {
        q: "Do I need a special device or tablet?",
        a: "No. The dashboard works on any smartphone, tablet, or computer with a web browser. Chrome, Safari, and Firefox all work fine."
    },
    {
        q: "What happens if the internet goes down?",
        a: "Pause your orders from the dashboard before going offline. When your internet is back, resume orders and contact us if any orders were affected."
    },
    {
        q: "Can someone on my staff manage orders?",
        a: "Yes. You can share your login with a trusted staff member. We're building multi-user support — reach out if you need it sooner."
    },
    {
        q: "How do I add a photo to a menu item?",
        a: "Click the item in your Menu, then click the image area to upload a photo from your phone or computer. Clear food photos increase order rates significantly."
    },
    {
        q: "What if a customer complains about their order?",
        a: "Customer complaints come through our support team first. We'll contact you directly if we need your input. You'll never have to handle a refund dispute alone."
    },
];

export default function MerchantSetupPage() {
    return (
        <div className="food-app-shell">
            <nav className="food-app-nav">
                <Logo size="sm" />
                <div className="nav-links hidden md:flex">
                    <Link href="/merchant/dashboard">Dashboard</Link>
                    <Link href="/merchant/login">Sign In</Link>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.print()}
                        className="btn btn-ghost flex items-center gap-2 text-xs"
                    >
                        <Printer size={14} /> Print Guide
                    </button>
                    <Link href="/merchant/login" className="btn btn-gold">Open Dashboard</Link>
                </div>
            </nav>

            <main className="food-app-main">

                {/* HERO */}
                <motion.section
                    className="food-panel relative overflow-hidden"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.18),transparent_55%)]" />
                    <div className="relative z-10 max-w-2xl">
                        <p className="food-kicker mb-3">Merchant Setup Guide</p>
                        <h1 className="food-heading" style={{ fontSize: "clamp(34px, 5vw, 56px)", lineHeight: 1 }}>
                            Everything you need<br />
                            <span className="accent">to run your restaurant</span><br />
                            on TrueServe.
                        </h1>
                        <p className="food-subtitle mt-4 !max-w-none">
                            This guide walks you through every part of your dashboard in plain English — no tech experience needed. If you ever get stuck, we're one message away.
                        </p>
                        <div className="flex flex-wrap gap-3 mt-6">
                            {[
                                { icon: CheckCircle, label: "5 simple steps" },
                                { icon: Phone, label: "Support always available" },
                                { icon: Printer, label: "Printable guide" },
                            ].map(({ icon: Icon, label }) => (
                                <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-[11px] font-bold text-white/55">
                                    <Icon size={11} className="text-[#f97316]" />
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* QUICK JUMP */}
                <FadeInSection className="mt-6">
                    <div className="food-panel">
                        <p className="food-kicker mb-3">Jump to a section</p>
                        <div className="flex flex-wrap gap-2">
                            {STEPS.map(step => (
                                <a
                                    key={step.number}
                                    href={`#step-${step.number}`}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-sm font-bold text-white/60 hover:border-[#f97316]/40 hover:text-[#f97316] hover:bg-[#f97316]/5 transition-all"
                                >
                                    <span className="text-[10px] text-white/30 font-black">{step.number}</span>
                                    {step.title}
                                    <ChevronRight size={12} className="opacity-40" />
                                </a>
                            ))}
                        </div>
                    </div>
                </FadeInSection>

                {/* STEPS */}
                <div className="mt-6 space-y-6">
                    {STEPS.map((step, i) => {
                        const Icon = step.icon;
                        return (
                            <FadeInSection key={step.number} delay={i * 0.04}>
                                <section id={`step-${step.number}`} className="food-panel relative overflow-hidden scroll-mt-20">
                                    <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-[0.07]" style={{ background: step.color, transform: "translate(30%, -30%)" }} />

                                    {/* Step header */}
                                    <div className="flex items-start gap-4 mb-6 relative z-10">
                                        <div
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border"
                                            style={{ background: `${step.color}18`, borderColor: `${step.color}30` }}
                                        >
                                            <Icon size={20} style={{ color: step.color }} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-1" style={{ color: step.color }}>
                                                Step {step.number}
                                            </p>
                                            <h2 className="food-heading !text-[26px] md:!text-[32px]">{step.title}</h2>
                                        </div>
                                    </div>

                                    {/* TL;DR */}
                                    <div className="mb-6 px-4 py-3 rounded-xl border border-white/8 bg-white/[0.03] relative z-10">
                                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/30 mb-1">The short version</p>
                                        <p className="text-sm font-bold text-white/80">{step.tldr}</p>
                                    </div>

                                    {/* Steps */}
                                    <div className="space-y-3 mb-6 relative z-10">
                                        {step.body.map((line, li) => (
                                            <div key={li} className="flex items-start gap-3">
                                                <div
                                                    className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5"
                                                    style={{ background: `${step.color}20`, color: step.color }}
                                                >
                                                    {li + 1}
                                                </div>
                                                <p className="text-sm text-white/75 leading-relaxed pt-0.5">{line}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Tip */}
                                    {step.tip && (
                                        <div
                                            className="flex items-start gap-3 px-4 py-3 rounded-xl border mb-3 relative z-10"
                                            style={{
                                                background: step.tipType === "success" ? "rgba(77,202,128,0.07)" : "rgba(249,115,22,0.07)",
                                                borderColor: step.tipType === "success" ? "rgba(77,202,128,0.2)" : "rgba(249,115,22,0.2)",
                                            }}
                                        >
                                            <CheckCircle size={15} className="shrink-0 mt-0.5" style={{ color: step.tipType === "success" ? "#4dca80" : "#f97316" }} />
                                            <p className="text-xs leading-relaxed" style={{ color: step.tipType === "success" ? "#4dca80" : "#f4d7a3" }}>
                                                <strong>Tip:</strong> {step.tip}
                                            </p>
                                        </div>
                                    )}

                                    {/* Warning */}
                                    {step.warning && (
                                        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] relative z-10">
                                            <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                                            <p className="text-xs text-red-300 leading-relaxed">{step.warning}</p>
                                        </div>
                                    )}
                                </section>
                            </FadeInSection>
                        );
                    })}
                </div>

                {/* FAQ */}
                <FadeInSection className="mt-6">
                    <section className="food-panel">
                        <p className="food-kicker mb-1">Common Questions</p>
                        <h2 className="food-heading !text-[26px] mb-6">Answers for restaurant owners</h2>
                        <div className="divide-y divide-white/6">
                            {FAQ.map(item => (
                                <div key={item.q} className="py-4 first:pt-0 last:pb-0">
                                    <p className="font-black text-white text-sm mb-1.5">{item.q}</p>
                                    <p className="text-sm text-white/50 leading-relaxed">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </FadeInSection>

                {/* STILL STUCK */}
                <FadeInSection className="mt-6">
                    <section className="food-panel relative overflow-hidden">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(249,115,22,0.12),transparent_55%)]" />
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div>
                                <p className="food-kicker mb-2">Still stuck?</p>
                                <h2 className="food-heading !text-[28px] mb-2">We'll walk you through it.</h2>
                                <p className="text-sm text-white/50 max-w-md leading-relaxed">
                                    Our support team can screen-share with you, walk you through any step over the phone, or just answer a quick question over email. No tech experience needed — that's our job.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 shrink-0">
                                <a href="mailto:merchants@trueserve.delivery" className="portal-btn-gold flex items-center gap-2 whitespace-nowrap">
                                    <Phone size={14} /> Email Support
                                </a>
                                <Link href="/contact" className="portal-btn-outline flex items-center gap-2 whitespace-nowrap text-center justify-center">
                                    Contact Page
                                </Link>
                            </div>
                        </div>
                    </section>
                </FadeInSection>

            </main>

            <footer className="mt-8 border-t border-white/5 px-2 pt-10 pb-12 text-center">
                <div className="mx-auto flex max-w-7xl flex-col items-center gap-5">
                    <Logo size="md" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                        © {new Date().getFullYear()} TrueServe · Merchant Setup Guide
                    </p>
                </div>
            </footer>
        </div>
    );
}
