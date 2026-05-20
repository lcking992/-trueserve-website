"use client";

import { Suspense, useActionState, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck, CalendarDays, ChevronDown, HandCoins, Home, MapPinned, WalletCards } from "lucide-react";
import Logo from "@/components/Logo";
import { submitDriveApplication } from "./actions";

const PERKS = [
    { icon: HandCoins, title: "$20/hr paid daily", desc: "Earn hourly driver pay and see your daily payout path up front." },
    { icon: HandCoins, title: "Keep 100% of tips", desc: "Every tip goes directly to you. Always." },
    { icon: CalendarDays, title: "Flexible hours", desc: "No schedules. Go online anytime you want." },
    { icon: Home, title: "Support local", desc: "Deliver right in your own neighborhood." },
];

const STEPS = [
    { num: "01", label: "Apply in 60 seconds", desc: "Tell us who you are, where you drive, and what vehicle you use." },
    { num: "02", label: "Finish driver setup", desc: "Upload license, insurance, registration, and choose whether you want text updates." },
    { num: "03", label: "Get approved fast", desc: "Most background checks approve within 24 hours." },
    { num: "04", label: "Start earning", desc: "Go online, accept routes, and track daily pay from the driver portal.", tag: "Live Markets Active" },
];

const PAY_HIGHLIGHTS = [
    { icon: WalletCards, label: "Base pay", value: "$20/hr" },
    { icon: HandCoins, label: "Tips", value: "100% yours" },
    { icon: BadgeCheck, label: "Payout rhythm", value: "Daily" },
];

export default function DrivePage() {
    return (
        <Suspense fallback={<div style={{ minHeight: "100vh", background: "#09090c" }} />}>
            <DrivePageContent />
        </Suspense>
    );
}

function DrivePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const utmSource = searchParams.get("utm_source") || "direct";
    const utmCampaign = searchParams.get("utm_campaign") || "";
    const sourceName = utmSource.toLowerCase() === "ridersunite"
        ? "Riders Unite"
        : utmSource.toLowerCase() === "ridester"
            ? "Ridester"
            : "";
    const [state, formAction, isPending] = useActionState(submitDriveApplication, null);
    const [submitted, setSubmitted] = useState(false);

    if (state?.success && !submitted) {
        setSubmitted(true);
        router.push("/drive/success");
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
            <section style={{ padding: "72px 20px 42px", textAlign: "center", maxWidth: 860, margin: "0 auto" }}>
                <p className="food-kicker" style={{ color: "#f97316", marginBottom: 14, letterSpacing: "0.12em" }}>
                    Local driver routes
                </p>
                <h1 className="food-title" style={{ fontSize: "clamp(42px, 8vw, 80px)", lineHeight: 0.95, marginBottom: 24 }}>
                    Earn $20/hr<br />
                    <span className="accent">paid daily.</span>
                </h1>
                <p className="drive-hero-copy">
                    Deliver local restaurant orders and keep every tip. Track shift time, route details, and daily payouts from the driver portal.
                </p>
                <div className="drive-pay-strip" aria-label="Driver pay highlights">
                    {PAY_HIGHLIGHTS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.label} className="drive-pay-pill">
                                <Icon size={18} aria-hidden="true" />
                                <span>{item.label}</span>
                                <strong>{item.value}</strong>
                            </div>
                        );
                    })}
                </div>
                {sourceName && (
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "9px 14px",
                        marginBottom: 22,
                        borderRadius: 999,
                        border: "1px solid rgba(249,115,22,0.28)",
                        background: "rgba(249,115,22,0.08)",
                        color: "#fed7aa",
                        fontSize: 13,
                        fontWeight: 800,
                    }}>
                        Welcome {sourceName} drivers
                    </div>
                )}
                <br />
                <a
                    href="#apply"
                    className="portal-btn-gold"
                    style={{ display: "inline-block", padding: "16px 40px", fontSize: 15, borderRadius: 999 }}
                >
                    Apply Now — It's Free →
                </a>
            </section>

            <section className="drive-photo-wrap" aria-label="TrueServe driver on the road">
                <div className="drive-photo-card">
                    <img
                        src="/driver-route-interior-trueserve.png"
                        alt="TrueServe delivery driver on the road at dusk"
                        className="drive-photo-img"
                    />
                    <div className="drive-photo-shade" />
                    <div className="drive-route-overlay" aria-hidden="true">
                        <svg viewBox="0 0 320 120" role="presentation">
                            <path className="drive-route-soft" d="M24 82C72 34 110 40 148 62C192 88 218 24 292 32" />
                            <path className="drive-route-line" d="M24 82C72 34 110 40 148 62C192 88 218 24 292 32" />
                            <circle cx="24" cy="82" r="8" />
                            <circle cx="148" cy="62" r="7" />
                            <circle cx="292" cy="32" r="8" />
                        </svg>
                        <div>
                            <span>Live route preview</span>
                            <strong>Nearby pickups, clear drop-offs</strong>
                        </div>
                    </div>
                    <div className="drive-pay-overlay" aria-hidden="true">
                        <MapPinned size={16} />
                        <div>
                            <span>Tonight's route</span>
                            <strong>$20/hr + tips</strong>
                        </div>
                    </div>
                </div>
            </section>

            {/* Perks */}
            <section style={{ padding: "0 20px 64px", maxWidth: 960, margin: "0 auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                    {PERKS.map((p) => {
                        const Icon = p.icon;
                        return (
                        <div key={p.title} className="drive-benefit-card">
                            <Icon size={22} strokeWidth={2.2} />
                            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 6 }}>{p.title}</div>
                            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{p.desc}</div>
                        </div>
                    )})}
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
                                fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: 30, lineHeight: 1.08,
                                color: "#f97316", opacity: 0.7, minWidth: 44,
                            }}>{s.num}</span>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", fontWeight: 800, fontSize: 16, marginBottom: 4 }}>
                                    {s.label}
                                    {"tag" in s && s.tag ? <span className="drive-live-market-badge">{s.tag}</span> : null}
                                </div>
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
                    <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>Apply in 60 seconds</h2>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 28 }}>
                        Apply now. If you opt into texts, we'll send the document upload link to your phone.
                    </p>

                    <form action={formAction} className="drive-apply-form">
                        <input type="hidden" name="utmSource" value={utmSource} />
                        <input type="hidden" name="utmCampaign" value={utmCampaign} />
                        <input name="name" required placeholder="Full name" />
                        <input name="email" type="email" required placeholder="Email address" />
                        <input name="phone" type="tel" required placeholder="Phone number" />
                        <input name="city" required placeholder="City you'll deliver in" />
                        <span className="drive-select-wrap">
                            <select name="vehicleType">
                                <option value="CAR">Car</option>
                                <option value="SUV">SUV / Truck</option>
                                <option value="MOTORCYCLE">Motorcycle</option>
                                <option value="BICYCLE">Bicycle</option>
                                <option value="SCOOTER">Scooter / Moped</option>
                            </select>
                            <ChevronDown size={16} aria-hidden="true" />
                        </span>

                        <label className="driver-sms-consent">
                            <input name="smsConsent" type="checkbox" value="true" />
                            <span>
                                I agree to receive driver recruiting and onboarding text messages from TrueServe at the phone number provided.
                                Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help.
                                Consent is not required to apply.
                            </span>
                        </label>

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
                        By applying you agree to our{" "}
                        <Link href="/terms" style={{ color: "#f97316" }}>Terms</Link> and{" "}
                        <Link href="/privacy" style={{ color: "#f97316" }}>Privacy Policy</Link>.
                    </p>
                </div>
            </section>
        </div>
    );
}
