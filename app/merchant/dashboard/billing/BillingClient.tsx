'use client';

import { useState } from 'react';
import { Check, Zap, TrendingUp, Flame, ArrowRight, X, Mail } from 'lucide-react';

// ---------------------------------------------------------------------------
// Plan definitions — kept in sync with /app/pricing/page.tsx
// ---------------------------------------------------------------------------
const PLANS = [
    {
        key: 'Starter',
        name: 'Starter',
        tagline: 'Up to 50 orders / month',
        price: 99,
        priceLabel: '$99',
        priceSub: '/ month',
        sub: 'For restaurants just getting started with delivery',
        overage: 'Additional orders billed at $1.50 each',
        color: '#3dd68c',
        icon: Zap,
        features: [
            '0% commission on every order',
            'Public restaurant storefront page',
            'Real-time order management',
            'Basic prep time controls',
            'Customer ratings visible',
            'Stripe payout integration',
            'Standard support',
        ],
    },
    {
        key: 'Growth',
        name: 'Growth',
        tagline: '51–150 orders / month',
        price: 199,
        priceLabel: '$199',
        priceSub: '/ month',
        sub: 'For established restaurants scaling up delivery',
        overage: 'Additional orders billed at $1.25 each',
        color: '#f97316',
        icon: TrendingUp,
        features: [
            '0% commission on every order',
            'Everything in Starter',
            'POS integration (Toast, Square, Clover)',
            'AutoPilot busy-window management',
            'Advanced prep timing controls',
            'Priority order routing',
            'GHL booking widget embed',
            'Compliance score dashboard',
            'Dedicated account manager',
        ],
    },
    {
        key: 'Scale',
        name: 'Scale',
        tagline: '150+ orders / month',
        price: 349,
        priceLabel: '$349',
        priceSub: '/ month',
        sub: 'For high-volume and multi-location restaurants',
        overage: null,
        color: '#a78bfa',
        icon: Flame,
        features: [
            '0% commission on every order',
            'Everything in Growth',
            'Unlimited orders — no overage fees',
            'Multi-location dashboard',
            'Advanced analytics & reporting',
            'Custom delivery zone configuration',
            'White-glove onboarding',
            'Priority phone support',
        ],
    },
] as const;

const COMPARE = [
    { name: 'DoorDash',  commission: '15–30%', fee: '$0',        contract: 'None',    highlight: false },
    { name: 'Uber Eats', commission: '15–30%', fee: '$0',        contract: 'None',    highlight: false },
    { name: 'GrubHub',   commission: '15–30%', fee: '$0',        contract: 'None',    highlight: false },
    { name: 'TrueServe', commission: '0%',     fee: '$99–$349',  contract: 'Monthly', highlight: true  },
];

const FAQS = [
    { q: 'Is there really zero commission?',         a: 'Yes. TrueServe does not take a percentage of your orders. You keep everything your customers pay for food.' },
    { q: 'How do I get paid?',                       a: 'Payouts go directly to your Stripe account. Setup takes about 5 minutes and funds typically arrive within 2 business days.' },
    { q: 'What happens if I exceed my order limit?', a: 'On Starter, additional orders above 50 are billed at $1.50 each. On Growth, it\'s $1.25 each. Scale includes unlimited orders with no overage fees.' },
    { q: 'Can I switch plans?',                      a: 'Yes — reach out to your account manager or email support and we\'ll process your change at the start of your next billing cycle.' },
    { q: 'What POS systems are supported?',          a: 'Toast, Square, and Clover on the Growth and Scale plans. More integrations are being added.' },
    { q: 'Is there a contract?',                     a: 'All plans are month-to-month. You can cancel at any time with 30 days written notice — no long-term lock-in.' },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface BillingClientProps {
    restaurantName: string;
    currentPlan: string | null;
    stripeSubscriptionId: string | null;
    nextBillingDate: string | null;
}

// ---------------------------------------------------------------------------
// Normalise DB plan key → canonical plan key
// ---------------------------------------------------------------------------
function normalisePlan(raw: string | null): string {
    if (!raw) return 'Starter';
    const lower = raw.toLowerCase();
    if (lower.includes('scale') || lower.includes('349')) return 'Scale';
    if (lower.includes('growth') || lower.includes('pro') || lower.includes('199')) return 'Growth';
    return 'Starter';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function BillingClient({
    restaurantName,
    currentPlan,
    stripeSubscriptionId,
    nextBillingDate,
}: BillingClientProps) {
    const currentKey = normalisePlan(currentPlan);
    const currentPlanObj = PLANS.find(p => p.key === currentKey) ?? PLANS[0];

    const [contactModal, setContactModal] = useState<string | null>(null); // plan name or null
    const [confirmModal, setConfirmModal] = useState<string | null>(null); // plan name or null

    function requestPlanChange(planKey: string) {
        const targetPlan = PLANS.find(p => p.key === planKey);
        if (!targetPlan) return;
        const isUpgrade = targetPlan.price > currentPlanObj.price;
        if (isUpgrade) {
            setConfirmModal(planKey);
        } else {
            setContactModal(planKey);
        }
    }

    return (
        <>
            {/* ── CONFIRM / UPGRADE MODAL ── */}
            {confirmModal && (() => {
                const target = PLANS.find(p => p.key === confirmModal)!;
                return (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                        <div style={{ background: '#161616', border: `1px solid ${target.color}30`, borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', position: 'relative' }}>
                            <button onClick={() => setConfirmModal(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                                <X size={18} />
                            </button>
                            <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', color: target.color }}>Plan Upgrade</p>
                            <h3 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 800, color: '#fff' }}>
                                Upgrade to {target.name}
                            </h3>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: '0 0 20px' }}>
                                You're upgrading from <strong style={{ color: '#fff' }}>{currentPlanObj.name} ({currentPlanObj.priceLabel}/mo)</strong> to{' '}
                                <strong style={{ color: target.color }}>{target.name} ({target.priceLabel}/mo)</strong>. Your account manager will reach out to confirm the change and prorate your billing.
                            </p>
                            <a
                                href={`mailto:support@trueserve.delivery?subject=Plan+Upgrade+Request+-+${restaurantName}&body=Hi+TrueServe+team,%0A%0AI'd+like+to+upgrade+from+the+${currentPlanObj.name}+plan+to+the+${target.name}+plan+($${target.price}/mo).%0A%0ARestaurant:+${encodeURIComponent(restaurantName)}%0A%0AThanks!`}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: target.color, color: '#0c0f0d', borderRadius: 10, padding: '12px 20px', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.14em', textDecoration: 'none', width: '100%' }}
                                onClick={() => setConfirmModal(null)}
                            >
                                <Mail size={13} /> Request Upgrade via Email
                            </a>
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 12, textAlign: 'center', lineHeight: 1.5 }}>
                                Changes take effect at your next billing cycle
                            </p>
                        </div>
                    </div>
                );
            })()}

            {/* ── DOWNGRADE CONTACT MODAL ── */}
            {contactModal && (() => {
                const target = PLANS.find(p => p.key === contactModal)!;
                return (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                        <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', position: 'relative' }}>
                            <button onClick={() => setContactModal(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                                <X size={18} />
                            </button>
                            <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#f97316' }}>Plan Change</p>
                            <h3 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 800, color: '#fff' }}>
                                Switch to {target.name}
                            </h3>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: '0 0 20px' }}>
                                To switch from <strong style={{ color: '#fff' }}>{currentPlanObj.name}</strong> to <strong style={{ color: target.color }}>{target.name}</strong>, please contact your account manager or email support. We'll confirm the change and adjust billing accordingly.
                            </p>
                            <a
                                href={`mailto:support@trueserve.delivery?subject=Plan+Change+Request+-+${restaurantName}&body=Hi+TrueServe+team,%0A%0AI'd+like+to+change+from+the+${currentPlanObj.name}+plan+to+the+${target.name}+plan+($${target.price}/mo).%0A%0ARestaurant:+${encodeURIComponent(restaurantName)}%0A%0AThanks!`}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(249,115,22,0.12)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 10, padding: '12px 20px', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.14em', textDecoration: 'none', width: '100%' }}
                                onClick={() => setContactModal(null)}
                            >
                                <Mail size={13} /> Email Support
                            </a>
                        </div>
                    </div>
                );
            })()}

            {/* ── CURRENT PLAN BANNER ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
                {/* Plan tile */}
                <div style={{ background: '#161616', border: `1px solid ${currentPlanObj.color}30`, borderRadius: 12, padding: '18px 20px' }}>
                    <p style={{ margin: '0 0 6px', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: currentPlanObj.color }}>Current Plan</p>
                    <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#fff' }}>{currentPlanObj.name}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{currentPlanObj.tagline}</p>
                </div>

                {/* Monthly cost tile */}
                <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px' }}>
                    <p style={{ margin: '0 0 6px', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)' }}>Monthly Cost</p>
                    <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#fff' }}>{currentPlanObj.priceLabel}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>0% commission</p>
                </div>

                {/* Next billing tile */}
                <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px' }}>
                    <p style={{ margin: '0 0 6px', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)' }}>Next Billing</p>
                    <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#fff' }}>
                        {nextBillingDate
                            ? new Date(nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : '—'}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Month-to-month</p>
                </div>

                {/* Commission tile */}
                <div style={{ background: 'rgba(61,214,140,0.06)', border: '1px solid rgba(61,214,140,0.18)', borderRadius: 12, padding: '18px 20px' }}>
                    <p style={{ margin: '0 0 6px', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#3dd68c' }}>Commission Rate</p>
                    <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#3dd68c' }}>0%</p>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(61,214,140,0.5)' }}>You keep every dollar</p>
                </div>
            </div>

            {/* ── PLAN CARDS ── */}
            <section style={{ marginBottom: 24 }}>
                <p style={{ margin: '0 0 14px', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)' }}>
                    Available Plans
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                    {PLANS.map((plan) => {
                        const Icon = plan.icon;
                        const isCurrent = plan.key === currentKey;
                        const isUpgrade = plan.price > currentPlanObj.price;
                        const isDowngrade = plan.price < currentPlanObj.price;

                        return (
                            <article
                                key={plan.key}
                                style={{
                                    background: '#161616',
                                    border: isCurrent
                                        ? `1px solid ${plan.color}50`
                                        : '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: 14,
                                    padding: 22,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                {/* Glow bg */}
                                <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at top right, ${plan.color}08, transparent 55%)`, pointerEvents: 'none' }} />

                                {/* Current badge */}
                                {isCurrent && (
                                    <div style={{ position: 'absolute', top: 14, right: 14, background: `${plan.color}18`, border: `1px solid ${plan.color}35`, borderRadius: 20, padding: '4px 10px', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: plan.color }}>
                                        Current
                                    </div>
                                )}

                                <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
                                    {/* Icon */}
                                    <div style={{ marginBottom: 12, display: 'inline-flex', borderRadius: 10, padding: 8, background: `${plan.color}12`, border: `1px solid ${plan.color}22` }}>
                                        <Icon size={17} style={{ color: plan.color }} />
                                    </div>

                                    <p style={{ margin: '0 0 2px', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)' }}>{plan.tagline}</p>
                                    <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 900, color: '#fff' }}>{plan.name}</h3>

                                    {/* Price */}
                                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, marginBottom: 4 }}>
                                        <span style={{ fontSize: 36, fontWeight: 900, lineHeight: 1, color: plan.color }}>{plan.priceLabel}</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>{plan.priceSub}</span>
                                    </div>
                                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>{plan.sub}</p>

                                    {/* Overage */}
                                    {plan.overage && (
                                        <div style={{ marginBottom: 16, padding: '7px 10px', borderRadius: 7, background: `${plan.color}08`, border: `1px solid ${plan.color}18` }}>
                                            <p style={{ margin: 0, fontSize: 10, color: `${plan.color}88` }}>Fast {plan.overage}</p>
                                        </div>
                                    )}

                                    {/* Features */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {plan.features.map((f) => (
                                            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: isCurrent ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.5)' }}>
                                                <div style={{ flexShrink: 0, width: 17, height: 17, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${plan.color}15` }}>
                                                    <Check size={9} style={{ color: plan.color }} />
                                                </div>
                                                {f}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* CTA */}
                                {isCurrent ? (
                                    <div style={{ position: 'relative', zIndex: 1, marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: `${plan.color}10`, border: `1px solid ${plan.color}25`, borderRadius: 10, padding: '11px 16px', fontSize: 11, fontWeight: 800, color: `${plan.color}99`, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                                        <Check size={12} /> Active Plan
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => requestPlanChange(plan.key)}
                                        style={{ position: 'relative', zIndex: 1, marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: isUpgrade ? plan.color : 'rgba(255,255,255,0.06)', color: isUpgrade ? '#0c0f0d' : 'rgba(255,255,255,0.5)', border: isUpgrade ? 'none' : '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 16px', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', cursor: 'pointer', width: '100%', fontFamily: 'inherit', transition: 'opacity 0.15s' }}
                                    >
                                        {isUpgrade ? `Upgrade to ${plan.name}` : `Switch to ${plan.name}`}
                                        <ArrowRight size={12} />
                                    </button>
                                )}
                            </article>
                        );
                    })}
                </div>
            </section>

            {/* ── COMPARISON TABLE ── */}
            <section style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 22, marginBottom: 24 }}>
                <p style={{ margin: '0 0 4px', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)' }}>How We Compare</p>
                <h3 style={{ margin: '0 0 18px', fontSize: 16, fontWeight: 800, color: '#fff' }}>The honest comparison.</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '0 12px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {['Platform', 'Commission', 'Monthly Fee', 'Contract'].map((h, i) => (
                            <p key={h} style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'rgba(255,255,255,0.25)', textAlign: i === 0 ? 'left' : 'center', margin: 0 }}>{h}</p>
                        ))}
                    </div>
                    {COMPARE.map((row) => (
                        <div key={row.name} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', alignItems: 'center', padding: '12px', borderRadius: 8, background: row.highlight ? 'rgba(249,115,22,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${row.highlight ? 'rgba(249,115,22,0.18)' : 'rgba(255,255,255,0.04)'}` }}>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: 12, color: row.highlight ? '#f97316' : 'rgba(255,255,255,0.6)' }}>
                                {row.name}{row.highlight && <span style={{ marginLeft: 6, fontSize: 8, color: 'rgba(249,115,22,0.45)', letterSpacing: '0.1em' }}>✦ US</span>}
                            </p>
                            <p style={{ margin: 0, textAlign: 'center', fontSize: 12, fontWeight: 800, color: row.highlight ? '#3dd68c' : 'rgba(255,255,255,0.35)' }}>{row.commission}</p>
                            <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: row.highlight ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.25)' }}>{row.fee}</p>
                            <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: row.highlight ? '#f97316' : 'rgba(255,255,255,0.25)' }}>{row.contract}</p>
                        </div>
                    ))}
                </div>
                <p style={{ marginTop: 12, fontSize: 9, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.06em' }}>
                    Commission rates based on publicly available data. Actual rates may vary.
                </p>
            </section>

            {/* ── FAQ ── */}
            <section style={{ marginBottom: 24 }}>
                <p style={{ margin: '0 0 14px', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)' }}>
                    Plan FAQ
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
                    {FAQS.map((faq) => (
                        <div key={faq.q} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 16 }}>
                            <p style={{ margin: '0 0 7px', fontWeight: 800, color: '#fff', fontSize: 12, lineHeight: 1.4 }}>{faq.q}</p>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 }}>{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FOOTER NOTE ── */}
            <div style={{ padding: '14px 18px', background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Mail size={14} style={{ color: '#f97316', flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                    Need help with billing or want to talk through options?{' '}
                    <a href="mailto:support@trueserve.delivery" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 700 }}>
                        support@trueserve.delivery
                    </a>
                </p>
            </div>
        </>
    );
}
