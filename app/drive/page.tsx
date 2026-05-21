"use client";

import { Suspense, useActionState, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck, CalendarDays, ChevronDown, HandCoins, Home, MapPinned, WalletCards } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
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
        <div className="ts-fig ts-fig-drive-page">
            <SiteHeader />

            <main>
                <section className="ts-fig-hero ts-fig-drive-hero">
                    <div className="ts-fig-container ts-fig-drive-hero-inner">
                        <div className="ts-fig-drive-copy ts-fig-animate-up">
                            <span className="ts-fig-chip">
                                <span className="ts-fig-chip-dot" />
                                Local driver routes
                            </span>
                            <h1>
                                Earn <span className="o">$20/hr</span><span className="t">paid daily.</span>
                            </h1>
                            <p className="ts-fig-hero-sub">
                                Deliver local restaurant orders, keep every tip, and track shift time,
                                route details, and daily payouts from the driver portal.
                            </p>

                            <div className="ts-fig-drive-pay-row" aria-label="Driver pay highlights">
                                {PAY_HIGHLIGHTS.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.label} className="ts-fig-drive-pay-pill">
                                            <Icon size={18} aria-hidden="true" />
                                            <span>{item.label}</span>
                                            <strong>{item.value}</strong>
                                        </div>
                                    );
                                })}
                            </div>

                            {sourceName && (
                                <div className="ts-fig-drive-source">
                                    Welcome {sourceName} drivers
                                </div>
                            )}

                            <div className="ts-fig-drive-actions">
                                <a href="#apply" className="ts-fig-btn">
                                    Apply Now - It&apos;s Free
                                </a>
                                <Link href="/driver/login" className="ts-fig-link ts-fig-drive-login">
                                    Driver Sign In
                                </Link>
                            </div>
                        </div>

                        <div className="ts-fig-drive-media ts-fig-animate-up">
                            <img
                                src="/driver-route-interior-trueserve.png"
                                alt="TrueServe delivery driver on the road at dusk"
                            />
                            <div className="ts-fig-drive-media-shade" />
                            <div className="ts-fig-drive-route-card" aria-hidden="true">
                                <svg viewBox="0 0 320 120" role="presentation">
                                    <path className="soft" d="M24 82C72 34 110 40 148 62C192 88 218 24 292 32" />
                                    <path className="line" d="M24 82C72 34 110 40 148 62C192 88 218 24 292 32" />
                                    <circle cx="24" cy="82" r="8" />
                                    <circle cx="148" cy="62" r="7" />
                                    <circle cx="292" cy="32" r="8" />
                                </svg>
                                <span>Live route preview</span>
                                <strong>Nearby pickups, clear drop-offs</strong>
                            </div>
                            <div className="ts-fig-drive-floating-pay" aria-hidden="true">
                                <MapPinned size={16} />
                                <div>
                                    <span>Tonight&apos;s route</span>
                                    <strong>$20/hr + tips</strong>
                                </div>
                            </div>
                            <div className="ts-fig-drive-earn-card" aria-hidden="true">
                                <span>This week&apos;s earnings</span>
                                <strong>$233</strong>
                                <div>
                                    {[28, 52, 36, 64, 78, 44, 20].map((height, index) => (
                                        <i key={index} style={{ height }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="ts-fig-section">
                    <div className="ts-fig-container">
                        <span className="ts-fig-kicker teal">Driver perks</span>
                        <h2>Built for steady local earning.</h2>
                        <div className="ts-fig-drive-perks">
                            {PERKS.map((perk, index) => {
                                const Icon = perk.icon;
                                return (
                                    <article key={perk.title} className="ts-fig-trust-card ts-fig-drive-perk" style={{ animationDelay: `${index * 90}ms` }}>
                                        <div className="ts-fig-trust-icon">
                                            <Icon size={20} strokeWidth={2.2} />
                                        </div>
                                        <h3>{perk.title}</h3>
                                        <p>{perk.desc}</p>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="ts-fig-section ts-fig-section-haze">
                    <div className="ts-fig-container">
                        <span className="ts-fig-kicker">How it works</span>
                        <h2>Apply, finish setup, start earning.</h2>
                        <div className="ts-fig-drive-steps">
                            {STEPS.map((step, index) => (
                                <article key={step.num} className="ts-fig-drive-step" style={{ animationDelay: `${index * 80}ms` }}>
                                    <span className="num">{step.num}</span>
                                    <div>
                                        <h3>
                                            {step.label}
                                            {"tag" in step && step.tag ? <span>{step.tag}</span> : null}
                                        </h3>
                                        <p>{step.desc}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="apply" className="ts-fig-section ts-fig-drive-apply-section">
                    <div className="ts-fig-container ts-fig-drive-apply-grid">
                        <div>
                            <span className="ts-fig-kicker teal">Apply today</span>
                            <h2>Driver signup should take about a minute.</h2>
                            <p>
                                If you opt into text messages, TrueServe can send your document upload
                                link and application updates to your phone while Vonage approval finishes.
                            </p>
                        </div>

                        <form action={formAction} className="ts-fig-drive-form">
                            <input type="hidden" name="utmSource" value={utmSource} />
                            <input type="hidden" name="utmCampaign" value={utmCampaign} />
                            <input name="name" required placeholder="Full name" />
                            <input name="email" type="email" required placeholder="Email address" />
                            <input name="phone" type="tel" required placeholder="Phone number" />
                            <input name="city" required placeholder="City you'll deliver in" />
                            <label className="ts-fig-drive-select">
                                <select name="vehicleType">
                                    <option value="CAR">Car</option>
                                    <option value="SUV">SUV / Truck</option>
                                    <option value="MOTORCYCLE">Motorcycle</option>
                                    <option value="BICYCLE">Bicycle</option>
                                    <option value="SCOOTER">Scooter / Moped</option>
                                </select>
                                <ChevronDown size={16} aria-hidden="true" />
                            </label>

                            <label className="ts-fig-drive-consent">
                                <input name="smsConsent" type="checkbox" value="true" />
                                <span>
                                    I agree to receive driver recruiting and onboarding text messages from TrueServe at the phone number provided.
                                    Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help.
                                    Consent is not required to apply.
                                </span>
                            </label>

                            {state?.error && (
                                <p className="ts-fig-drive-error">{state.error}</p>
                            )}

                            <button type="submit" disabled={isPending} className="ts-fig-btn">
                                {isPending ? "Submitting..." : "Apply Now"}
                            </button>

                            <p className="ts-fig-drive-legal">
                                By applying you agree to our{" "}
                                <Link href="/terms">Terms</Link> and{" "}
                                <Link href="/privacy">Privacy Policy</Link>.
                            </p>
                        </form>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}
