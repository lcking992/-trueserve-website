"use client";

import { useActionState, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import { submitDriveApplication } from "./actions";

const PERKS = [
    { icon: "💵", title: "Keep 100% of tips", desc: "Every tip goes directly to you. Always." },
    { icon: "📅", title: "Work when you want", desc: "No schedules, no minimums. Go online anytime." },
    { icon: "⚡", title: "Get paid weekly", desc: "Earnings deposited every week via Stripe." },
    { icon: "🏘️", title: "Support local", desc: "Deliver from restaurants in your own neighborhood." },
];

const STEPS = [
    { num: "01", label: "Apply in 60 seconds", desc: "Just your name, phone, and vehicle type." },
    { num: "02", label: "We text you a link", desc: "Upload your license and insurance at your convenience." },
    { num: "03", label: "Get approved fast", desc: "Our team reviews and activates your account." },
    { num: "04", label: "Start earning", desc: "Go online and accept your first delivery." },
];

function DrivePageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [state, formAction, isPending] = useActionState(submitDriveApplication, null);
    const [submitted, setSubmitted] = useState(false);

    const utmSource   = searchParams.get("utm_source")   || searchParams.get("ref") || "";
    const utmMedium   = searchParams.get("utm_medium")   || "";
    const utmCampaign = searchParams.get("utm_campaign") || "";

    const fromRidersUnite = utmSource.toLowerCase().includes("ridersunite") || utmSource.toLowerCase().includes("riders");

    if (state?.success && !submitted) {
        setSubmitted(true);
        const successUrl = utmSource ? `/drive/success?ref=${encodeURIComponent(utmSource)}` : "/drive/success";
        router.push(successUrl);
    }

    return (
        <div style={{ minHeight: "100vh", background: "#09090c", color: "#fff" }}>
            {/* Nav */}
            <nav className="food-app-nav">
                <Logo size="sm" />
                <div className="nav-links hidden md:flex">
                    <Link href="/restaurants">Order Food</Link>
                    <Link href="/merchant">For Merchants</Link>
                </div>
                <div className="nav-r">
                    <Link href="/driver/login" className="btn btn-ghost text-sm">Driver Sign In</Link>
                </div>
            </nav>

            {/* Hero */}
            <section style={{ padding: "72px 20px 56px", textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
                <p className="food-kicker" style={{ color: "#f97316", marginBottom: 14, letterSpacing: "0.12em" }}>
                    Drive &amp; Earn with TrueServe
                </p>
                <h1 className="food-title" style={{ fontSize: "clamp(42px, 8vw, 80px)", lineHeight: 0.95, marginBottom: 24 }}>
                    Be your own boss<br />
                    <span className="accent">in your city.</span>
                </h1>
                <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.65 }}>
                    Deliver local favorites. Keep 100% of your tips. Get paid weekly — no shift requirements, no commission cuts.
                </p>
                <a
                    href="#apply"
                    className="portal-btn-gold"
                    style={{ display: "inline-block", padding: "16px 40px", fontSize: 15, borderRadius: 999 }}
                >
                    Apply Now — It's Free →
                </a>
            </section>

            {/* Perks */}
            <section style={{ padding: "0 20px 64px", maxWidth: 960, margin: "0 auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                    {PERKS.map((p) => (
                        <div key={p.title} style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: 16, padding: "24px 20px",
                        }}>
                            <div style={{ fontSize: 28, marginBottom: 10 }}>{p.icon}</div>
                            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 6 }}>{p.title}</div>
                            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{p.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section style={{ padding: "0 20px 64px", maxWidth: 800, margin: "0 auto" }}>
                <p className="food-kicker" style={{ textAlign: "center", marginBottom: 32, color: "#f97316" }}>How It Works</p>
                <div style={{ display: "grid", gap: 16 }}>
                    {STEPS.map((s) => (
                        <div key={s.num} style={{
                            display: "flex", alignItems: "flex-start", gap: 20,
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: 14, padding: "20px 24px",
                        }}>
                            <span style={{
                                fontFamily: "var(--font-bebas)", fontSize: 36, lineHeight: 1,
                                color: "#f97316", opacity: 0.7, minWidth: 44,
                            }}>{s.num}</span>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{s.label}</div>
                                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{s.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Micro-form */}
            <section id="apply" style={{ padding: "0 20px 80px", maxWidth: 540, margin: "0 auto" }}>
                <div style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(249,115,22,0.2)",
                    borderRadius: 20, padding: "40px 32px",
                }}>
                    {fromRidersUnite && (
                        <div style={{
                            background: "rgba(249,115,22,0.1)",
                            border: "1px solid rgba(249,115,22,0.3)",
                            borderRadius: 10, padding: "10px 14px",
                            marginBottom: 16, fontSize: 13,
                            color: "rgba(255,255,255,0.8)",
                            display: "flex", alignItems: "center", gap: 8,
                        }}>
                            <span style={{ fontSize: 18 }}>👋</span>
                            <span>Welcome from <strong style={{ color: "#f97316" }}>Riders Unite</strong>! You're in the right place.</span>
                        </div>
                    )}

                    <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>Apply in 60 seconds</h2>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 28 }}>
                        We'll text you a link to upload your documents — no account needed yet.
                    </p>

                    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <input type="hidden" name="utmSource"   value={utmSource} />
                        <input type="hidden" name="utmMedium"   value={utmMedium} />
                        <input type="hidden" name="utmCampaign" value={utmCampaign} />
                        <input name="name" required placeholder="Full name" style={inputStyle} />
                        <input name="email" type="email" required placeholder="Email address" style={inputStyle} />
                        <input name="phone" type="tel" required placeholder="Phone number" style={inputStyle} />
                        <input name="city" required placeholder="City you'll deliver in" style={inputStyle} />
                        <select name="vehicleType" style={inputStyle}>
                            <option value="CAR">Car</option>
                            <option value="SUV">SUV / Truck</option>
                            <option value="MOTORCYCLE">Motorcycle</option>
                            <option value="BICYCLE">Bicycle</option>
                            <option value="SCOOTER">Scooter / Moped</option>
                        </select>

                        {state?.error && (
                            <p style={{ color: "#f87171", fontSize: 13 }}>{state.error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="portal-btn-gold"
                            style={{ marginTop: 8, padding: "15px", fontSize: 15, fontWeight: 900, borderRadius: 12, opacity: isPending ? 0.6 : 1 }}
                        >
                            {isPending ? "Submitting…" : "Apply Now →"}
                        </button>
                    </form>

                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: 16 }}>
                        By applying you agree to our{"\ "}
                        <Link href="/terms" style={{ color: "#f97316" }}>Terms</Link> and{"\ "}
                        <Link href="/privacy" style={{ color: "#f97316" }}>Privacy Policy</Link>.
                    </p>
                </div>
            </section>
        </div>
    );
}

export default function DrivePage() {
    return (
        <Suspense fallback={<div style={{ minHeight: "100vh", background: "#09090c" }} />}>
            <DrivePageInner />
        </Suspense>
    );
}

const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "12px 16px",
    color: "#fff",
    fontSize: 14,
    outline: "none",
};
