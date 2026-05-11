import { cookies } from "next/headers";
import { getDriverOrRedirect } from "@/lib/driver-auth";

export const dynamic = 'force-dynamic';

// ── Tier definitions ──────────────────────────────────────────────────────────
const TIERS = [
    {
        key: 'ROOKIE',
        label: 'Rookie',
        mark: 'R',
        color: '#64748b',
        glow: 'rgba(100,116,139,0.25)',
        range: [0, 24],
        unlocks: ['Basic dispatch access', 'Standard support', 'Earnings dashboard'],
    },
    {
        key: 'FLEET',
        label: 'Fleet Driver',
        mark: 'F',
        color: '#f97316',
        glow: 'rgba(249,115,22,0.25)',
        range: [25, 99],
        unlocks: ['Priority dispatch queue', 'Restaurant trust scores', 'Weekly goal tracker'],
    },
    {
        key: 'ELITE',
        label: 'Elite',
        mark: 'E',
        color: '#a78bfa',
        glow: 'rgba(167,139,250,0.25)',
        range: [100, 249],
        unlocks: ['Instant same-day payouts', '1.15× earnings multiplier', 'Pre-accept tip visibility', 'VIP support line'],
    },
    {
        key: 'LEGEND',
        label: 'Legend',
        mark: 'L',
        color: '#fbbf24',
        glow: 'rgba(251,191,36,0.3)',
        range: [250, Infinity],
        unlocks: ['1.25× earnings multiplier', 'Dedicated account manager', 'Bonus order alerts', 'Top 1% badge'],
    },
];

function getTierForDeliveries(count: number) {
    return TIERS.slice().reverse().find(t => count >= t.range[0]) || TIERS[0];
}

function getNextTier(currentKey: string) {
    const idx = TIERS.findIndex(t => t.key === currentKey);
    return idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
}

function progressToNextTier(count: number, tier: typeof TIERS[0], next: typeof TIERS[0] | null) {
    if (!next) return 100;
    const [start] = next.range;
    const [prevStart] = tier.range;
    return Math.min(((count - prevStart) / (start - prevStart)) * 100, 100);
}

export default async function DriverRatings() {
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";

    const driver = isPreview
        ? { id: "preview", name: "Jordan Rivers", rating: "4.9", orders: Array(47) }
        : await getDriverOrRedirect();

    const rating = driver?.rating || "N/A";
    const lifetimeDeliveries = driver?.orders?.length || 0;

    const currentTier = getTierForDeliveries(lifetimeDeliveries);
    const nextTier    = getNextTier(currentTier.key);
    const progress    = progressToNextTier(lifetimeDeliveries, currentTier, nextTier);
    const tripsToNext = nextTier ? Math.max(nextTier.range[0] - lifetimeDeliveries, 0) : 0;

    return (
        <div className="font-sans">
            <style dangerouslySetInnerHTML={{ __html: `
                .rp-wrap { padding: 28px 32px; max-width: 900px; }
                .rp-title { font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.02em; margin-bottom: 24px; }
                .rp-title span { color: #f97316; }

                /* ── Tier Badge ── */
                .tier-hero {
                    border-radius: 14px; overflow: hidden; margin-bottom: 20px;
                    border: 1px solid rgba(255,255,255,0.07);
                }
                .tier-hero-top {
                    padding: 28px 28px 20px;
                    display: flex; align-items: flex-start; gap: 20px;
                }
                .tier-icon-wrap {
                    width: 64px; height: 64px; border-radius: 16px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 28px; flex-shrink: 0;
                }
                .tier-info { flex: 1; }
                .tier-label-sm { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 6px; }
                .tier-name { font-size: 30px; font-weight: 900; letter-spacing: -0.02em; line-height: 1; margin-bottom: 8px; }
                .tier-rating { font-size: 14px; font-weight: 700; color: #fff; }
                .tier-rating span { color: #fbbf24; }

                /* Progress bar */
                .tier-progress-wrap { padding: 0 28px 24px; }
                .tier-progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
                .tier-progress-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #555; }
                .tier-progress-count { font-size: 11px; font-weight: 800; color: #fff; }
                .tier-bar-bg { height: 8px; background: rgba(255,255,255,0.06); border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); }
                .tier-bar-fill { height: 100%; border-radius: 8px; transition: width 1s ease-out; }
                .tier-next-hint { font-size: 10px; color: #555; margin-top: 6px; }

                /* ── Tier Roadmap ── */
                .roadmap { display: flex; gap: 0; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; overflow: hidden; }
                @media (max-width: 768px) { .roadmap { flex-direction: column; } }
                .roadmap-tier { flex: 1; padding: 18px 16px; border-right: 1px solid rgba(255,255,255,0.05); position: relative; }
                .roadmap-tier:last-child { border-right: none; }
                .roadmap-tier.active { background: rgba(255,255,255,0.02); }
                .roadmap-tier.locked { opacity: 0.45; }
                .roadmap-tier-icon { font-size: 20px; margin-bottom: 8px; }
                .roadmap-tier-name { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 10px; }
                .roadmap-tier-range { font-size: 9px; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; }
                .roadmap-unlock { font-size: 10px; color: #666; line-height: 1.5; display: flex; align-items: baseline; gap: 6px; margin-bottom: 4px; }
                .roadmap-unlock .dot { width: 4px; height: 4px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
                .roadmap-active-badge {
                    position: absolute; top: 12px; right: 12px;
                    font-size: 8px; font-weight: 800; text-transform: uppercase;
                    letter-spacing: 0.14em; padding: 3px 8px; border-radius: 20px;
                }

                /* ── Stats quad ── */
                .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
                @media (max-width: 800px) { .stats-grid { grid-template-columns: 1fr 1fr; } }
                .stat-card {
                    background: #0f1219; border: 1px solid #1c1f28; border-radius: 10px;
                    padding: 18px 16px;
                }
                .stat-lbl { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.16em; color: #555; margin-bottom: 8px; }
                .stat-val { font-size: 32px; font-weight: 900; color: #fff; letter-spacing: -0.03em; line-height: 1; margin-bottom: 4px; }
                .stat-target { font-size: 9px; font-weight: 700; color: #3ecf6e; }
                .stat-target.warn { color: #f97316; }

                /* ── Feedback ── */
                .feedback-section { background: #0f1219; border: 1px solid #1c1f28; border-radius: 14px; padding: 24px 24px; margin-bottom: 20px; }
                .feedback-title { font-size: 14px; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 16px; }
                .feedback-empty { text-align: center; padding: 32px; font-size: 12px; color: #333; font-style: italic; }

                @media (max-width: 900px) {
                    .rp-wrap { padding: 18px 16px; }
                }
                @media (max-width: 640px) {
                    .rp-wrap { padding: 14px 12px; }
                    .rp-title { font-size: 22px; margin-bottom: 16px; }
                    .tier-hero-top { padding: 16px 16px 12px; gap: 12px; }
                    .tier-icon-wrap { width: 48px; height: 48px; font-size: 22px; border-radius: 12px; }
                    .tier-name { font-size: 22px; }
                    .tier-progress-wrap { padding: 0 16px 16px; }
                    .stats-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
                    .stat-val { font-size: 24px; }
                    .stat-card { padding: 14px 12px; }
                    .feedback-section { padding: 16px; }
                    .roadmap-tier { padding: 14px 12px; }
                }
            ` }} />

            <div className="rp-wrap">
                <div className="rp-title">Performance <span>&amp; Tier</span></div>

                {/* ── Tier Hero ── */}
                <div className="tier-hero" style={{ background: `linear-gradient(135deg, ${currentTier.glow}, rgba(0,0,0,0) 70%)` }}>
                    <div className="tier-hero-top">
                        <div className="tier-icon-wrap" style={{ background: `${currentTier.glow}`, border: `1px solid ${currentTier.color}33` }}>
                            {currentTier.mark}
                        </div>
                        <div className="tier-info">
                            <div className="tier-label-sm" style={{ color: currentTier.color }}>Current Tier</div>
                            <div className="tier-name" style={{ color: currentTier.color }}>{currentTier.label}</div>
                            <div className="tier-rating">
                                Rating: <span>{'★'.repeat(Math.round(Number(rating) || 5))}</span> {rating}
                                &nbsp;·&nbsp;{lifetimeDeliveries} lifetime deliveries
                            </div>
                        </div>
                    </div>

                    {/* Progress to next tier */}
                    <div className="tier-progress-wrap">
                        <div className="tier-progress-header">
                            <span className="tier-progress-label">
                                {nextTier ? `Progress to ${nextTier.label}` : 'Max Tier Reached'}
                            </span>
                            <span className="tier-progress-count">
                                {lifetimeDeliveries} / {nextTier ? nextTier.range[0] : lifetimeDeliveries} trips
                            </span>
                        </div>
                        <div className="tier-bar-bg">
                            <div
                                className="tier-bar-fill"
                                style={{
                                    width: `${progress}%`,
                                    background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier?.color || currentTier.color})`,
                                    boxShadow: `0 0 10px ${currentTier.glow}`,
                                }}
                            />
                        </div>
                        <div className="tier-next-hint">
                            {nextTier
                                ? `${tripsToNext} more ${tripsToNext === 1 ? 'delivery' : 'deliveries'} to unlock ${nextTier.label} — ${nextTier.unlocks[0]}`
                                : 'You are at the top of the TrueServe driver ranks.'}
                        </div>
                    </div>
                </div>

                {/* ── Tier Roadmap ── */}
                <div className="roadmap">
                    {TIERS.map((tier, i) => {
                        const isActive  = tier.key === currentTier.key;
                        const isUnlocked = lifetimeDeliveries >= tier.range[0];
                        return (
                            <div
                                key={tier.key}
                                className={`roadmap-tier${isActive ? ' active' : ''}${!isUnlocked ? ' locked' : ''}`}
                                style={{ background: isActive ? `${tier.glow}` : undefined }}
                            >
                                {isActive && (
                                    <div
                                        className="roadmap-active-badge"
                                        style={{ background: `${tier.glow}`, color: tier.color, border: `1px solid ${tier.color}44` }}
                                    >
                                        Active
                                    </div>
                                )}
                                <div className="roadmap-tier-icon">{tier.mark}</div>
                                <div className="roadmap-tier-name" style={{ color: isUnlocked ? tier.color : '#444' }}>
                                    {tier.label}
                                </div>
                                <div className="roadmap-tier-range">
                                    {tier.range[1] === Infinity ? `${tier.range[0]}+ trips` : `${tier.range[0]}–${tier.range[1]} trips`}
                                </div>
                                {tier.unlocks.map((u, j) => (
                                    <div key={j} className="roadmap-unlock">
                                        <div
                                            className="dot"
                                            style={{ background: isUnlocked ? tier.color : '#333' }}
                                        />
                                        <span style={{ color: isUnlocked ? '#aaa' : '#333' }}>{u}</span>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>

                {/* ── Performance Stats ── */}
                <div className="stats-grid">
                    {[
                        { label: 'Rating',          value: String(rating),          target: '≥ 4.7 target',  ok: Number(rating) >= 4.7 },
                        { label: 'Acceptance Rate',  value: '94%',                  target: '≥ 80% target',  ok: true },
                        { label: 'Completion Rate',  value: '100%',                 target: '≥ 90% target',  ok: true },
                        { label: 'On-Time Rate',     value: '98%',                  target: '≥ 90% target',  ok: true },
                    ].map(s => (
                        <div key={s.label} className="stat-card">
                            <div className="stat-lbl">{s.label}</div>
                            <div className="stat-val">{s.value}</div>
                            <div className={`stat-target${s.ok ? '' : ' warn'}`}>{s.target}</div>
                        </div>
                    ))}
                </div>

                {/* ── Recent Feedback ── */}
                <div className="feedback-section">
                    <div className="feedback-title">Customer Feedback</div>
                    <div className="feedback-empty">No customer reviews yet — keep delivering and your feedback will appear here.</div>
                </div>
            </div>
        </div>
    );
}
