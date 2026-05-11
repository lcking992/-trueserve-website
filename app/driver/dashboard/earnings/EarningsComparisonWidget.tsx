'use client';

import { useState, useEffect } from 'react';

interface Props {
    orders: any[];
    driver: any;
}

// DoorDash national averages (publicly cited figures)
const DD_AVG_PER_TRIP    = 7.50;   // avg base pay per delivery on DoorDash
const DD_TIP_BAITING_PCT = 0.38;   // ~38% of DoorDash orders have tip withheld pre-accept
const IRS_RATE_PER_MILE  = 0.67;   // 2024 IRS standard mileage rate
const AVG_MI_PER_TRIP    = 3.2;    // avg delivery distance

const ECW_CSS = `
  .ecw-compare-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .ecw-mile-tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .ecw-breakdown-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .ecw-monthly-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; }
  @media (max-width: 640px) {
    .ecw-compare-grid { grid-template-columns: 1fr; }
    .ecw-breakdown-grid { grid-template-columns: 1fr; }
    .ecw-mile-tiles { grid-template-columns: 1fr 1fr; }
    .ecw-mile-tiles > :last-child { grid-column: 1 / -1; }
  }
  @media (max-width: 480px) {
    .ecw-monthly-grid { grid-template-columns: 1fr 1fr; }
  }
`;
let _ecwInjected = false;

export default function EarningsComparisonWidget({ orders, driver }: Props) {
    const [showMileageReport, setShowMileageReport] = useState(false);
    const [reportYear]       = useState(new Date().getFullYear());

    useEffect(() => {
        if (_ecwInjected || typeof document === 'undefined') return;
        const s = document.createElement('style');
        s.textContent = ECW_CSS;
        document.head.appendChild(s);
        _ecwInjected = true;
    }, []);

    // --- Calculations ---
    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED' || o.totalPay > 0);
    const totalTrips      = deliveredOrders.length;
    const totalEarnings   = deliveredOrders.reduce((s, o) => s + Number(o.totalPay || 0) + Number(o.tip || 0), 0);
    const totalTips       = deliveredOrders.reduce((s, o) => s + Number(o.tip || 0), 0);
    const totalBasePay    = totalEarnings - totalTips;

    // What DoorDash would have paid on same trip count
    const ddEquivalentEarnings = totalTrips * DD_AVG_PER_TRIP;
    // Tips driver saw BEFORE accepting (key differentiator — DoorDash hides ~38%)
    const tipsSeenPreAccept    = Math.round(totalTrips * (1 - DD_TIP_BAITING_PCT));
    const tipsHiddenOnDD       = totalTrips - tipsSeenPreAccept;

    // Mileage data
    const estimatedMiles       = totalTrips * AVG_MI_PER_TRIP;
    const taxDeduction         = +(estimatedMiles * IRS_RATE_PER_MILE).toFixed(2);

    // Monthly split for mileage report (last 6 months)
    const monthlyMileage = (() => {
        const buckets: Record<string, { trips: number; miles: number }> = {};
        deliveredOrders.forEach(o => {
            const d    = new Date(o.createdAt);
            const key  = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const mon  = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
            if (!buckets[key]) buckets[key] = { trips: 0, miles: 0 };
            buckets[key].trips++;
            buckets[key].miles += AVG_MI_PER_TRIP;
        });
        return Object.entries(buckets)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-6)
            .map(([key, v]) => ({
                label: new Date(key + '-01').toLocaleString('en-US', { month: 'short', year: '2-digit' }),
                ...v,
                deduction: +(v.miles * IRS_RATE_PER_MILE).toFixed(2),
            }));
    })();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── You vs DoorDash ── */}
            <section style={{
                background: 'linear-gradient(135deg, rgba(249,115,22,0.06), rgba(0,0,0,0) 60%)',
                border: '1px solid rgba(249,115,22,0.2)', borderRadius: 14, overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: '#f97316', boxShadow: '0 0 8px #f97316',
                        }} />
                        <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#f97316' }}>
                            TrueServe Advantage
                        </span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 6 }}>
                        You vs. DoorDash
                    </div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                        Based on your {totalTrips} completed deliveries
                    </div>
                </div>

                {/* Comparison rows */}
                <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>

                    {/* Tips — key differentiator */}
                    <div style={{
                        background: 'rgba(62,207,110,0.06)', border: '1px solid rgba(62,207,110,0.18)',
                        borderRadius: 10, padding: '12px 16px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
                                Tip Transparency
                            </span>
                            <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#3ecf6e' }}>
                                TrueServe Edge
                            </span>
                        </div>
                        <div className="ecw-compare-grid">
                            <div style={{ background: 'rgba(62,207,110,0.08)', borderRadius: 8, padding: '10px 12px' }}>
                                <div style={{ fontSize: 9, color: '#3ecf6e', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>TrueServe</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: '#3ecf6e' }}>{tipsSeenPreAccept}</div>
                                <div style={{ fontSize: 9, color: '#3ecf6e80', marginTop: 2 }}>tips shown before accept</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px' }}>
                                <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>DoorDash est.</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: '#666' }}>{tipsHiddenOnDD}</div>
                                <div style={{ fontSize: 9, color: '#555', marginTop: 2 }}>tips hidden until delivery</div>
                            </div>
                        </div>
                        <div style={{ marginTop: 8, fontSize: 10, color: '#3ecf6e80', lineHeight: 1.5 }}>
                            You saw the full tip amount on <strong style={{ color: '#3ecf6e' }}>every order</strong> before accepting.
                            DoorDash hides tips on ~38% of orders until after you deliver.
                        </div>
                    </div>

                    {/* Earnings comparison */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 10, padding: '12px 16px',
                    }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Earnings on {totalTrips} Trips</div>
                        <div className="ecw-breakdown-grid">
                            <div>
                                <div style={{ fontSize: 9, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Your Total</div>
                                <div style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>${totalEarnings.toFixed(2)}</div>
                                <div style={{ fontSize: 9, color: '#666', marginTop: 2 }}>
                                    ${totalBasePay.toFixed(2)} base + ${totalTips.toFixed(2)} tips
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>DoorDash Est.</div>
                                <div style={{ fontSize: 24, fontWeight: 900, color: '#555' }}>~${ddEquivalentEarnings.toFixed(2)}</div>
                                <div style={{ fontSize: 9, color: '#444', marginTop: 2 }}>
                                    ~$7.50/trip avg (no tip visibility)
                                </div>
                            </div>
                        </div>
                        {totalEarnings > ddEquivalentEarnings ? (
                            <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(62,207,110,0.06)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 14 }}></span>
                                <span style={{ fontSize: 11, color: '#3ecf6e', fontWeight: 700 }}>
                                    You're ahead by <strong>${(totalEarnings - ddEquivalentEarnings).toFixed(2)}</strong>
                                </span>
                            </div>
                        ) : (
                            <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(249,115,22,0.06)', borderRadius: 8, fontSize: 10, color: '#f97316' }}>
                                Keep at it — tips and volume will push you past the DoorDash average.
                            </div>
                        )}
                    </div>

                    {/* Zero commission callout */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px', background: 'rgba(249,115,22,0.05)',
                        border: '1px solid rgba(249,115,22,0.15)', borderRadius: 8,
                    }}>
                        <span style={{ fontSize: 20, lineHeight: 1 }}>✦</span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                            TrueServe charges restaurants a <strong style={{ color: '#fff' }}>flat monthly fee</strong>, not a % cut.
                            That means restaurants don't raise prices to cover commission — and you keep <strong style={{ color: '#f97316' }}>100% of your tips</strong>.
                        </span>
                    </div>
                </div>
            </section>

            {/* ── Mileage & Tax Tracker ── */}
            <section style={{
                background: '#0f1219', border: '1px solid #1c1f28', borderRadius: 14, overflow: 'hidden',
            }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #1c1f28', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#555', marginBottom: 4 }}>
                            IRS {reportYear} · $0.67/mile
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Mileage & Tax Tracker</div>
                    </div>
                    <button
                        onClick={() => setShowMileageReport(!showMileageReport)}
                        style={{
                            background: showMileageReport ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.05)',
                            border: showMileageReport ? '1px solid rgba(249,115,22,0.3)' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8, padding: '7px 14px',
                            fontSize: 10, fontWeight: 800, color: showMileageReport ? '#f97316' : '#666',
                            cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.12em',
                            fontFamily: 'inherit',
                        }}
                    >
                        {showMileageReport ? 'Hide Report' : 'View Full Report'}
                    </button>
                </div>

                {/* Summary tiles */}
                <div style={{ padding: '14px 20px' }} className="ecw-mile-tiles">
                    {[
                        { label: 'Est. Miles',      value: estimatedMiles.toFixed(0), sub: `${totalTrips} trips × ${AVG_MI_PER_TRIP} mi avg`, color: '#fff' },
                        { label: 'Tax Deduction',   value: `$${taxDeduction}`,        sub: `@ $${IRS_RATE_PER_MILE}/mi IRS rate`,              color: '#3ecf6e' },
                        { label: 'Trips Logged',    value: String(totalTrips),        sub: 'completed deliveries',                              color: '#f97316' },
                    ].map(tile => (
                        <div key={tile.label} style={{ background: '#141a18', border: '1px solid #1e2420', borderRadius: 10, padding: '12px 14px' }}>
                            <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>{tile.label}</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: tile.color, letterSpacing: '-0.5px' }}>{tile.value}</div>
                            <div style={{ fontSize: 9, color: '#444', marginTop: 3 }}>{tile.sub}</div>
                        </div>
                    ))}
                </div>

                {/* Monthly breakdown */}
                {showMileageReport && (
                    <div style={{ padding: '0 20px 16px' }}>
                        <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#555', marginBottom: 10 }}>
                            Monthly Breakdown — IRS Schedule C Ready
                        </div>
                        <div style={{ background: '#0c0d11', border: '1px solid #1c1f28', borderRadius: 10, overflow: 'hidden' }}>
                            {/* Header */}
                            <div className="ecw-monthly-grid" style={{ padding: '10px 14px', borderBottom: '1px solid #1c1f28' }}>
                                {['Month', 'Deliveries', 'Miles', 'Deduction'].map(h => (
                                    <span key={h} style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#444' }}>{h}</span>
                                ))}
                            </div>
                            {monthlyMileage.length === 0 ? (
                                <div style={{ padding: '24px', textAlign: 'center', fontSize: 12, color: '#444' }}>
                                    Complete deliveries to generate your mileage report.
                                </div>
                            ) : (
                                monthlyMileage.map((row, i) => (
                                    <div key={i} className="ecw-monthly-grid" style={{
                                        padding: '10px 14px',
                                        borderBottom: i < monthlyMileage.length - 1 ? '1px solid #141720' : 'none',
                                        background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                                    }}>
                                        <span style={{ fontSize: 12, color: '#ccc', fontWeight: 700 }}>{row.label}</span>
                                        <span style={{ fontSize: 12, color: '#888' }}>{row.trips}</span>
                                        <span style={{ fontSize: 12, color: '#888' }}>{row.miles.toFixed(1)}</span>
                                        <span style={{ fontSize: 12, color: '#3ecf6e', fontWeight: 700 }}>${row.deduction}</span>
                                    </div>
                                ))
                            )}
                            {/* Total row */}
                            {monthlyMileage.length > 0 && (
                                <div className="ecw-monthly-grid" style={{
                                    padding: '12px 14px', background: 'rgba(62,207,110,0.05)',
                                    borderTop: '1px solid rgba(62,207,110,0.15)',
                                }}>
                                    <span style={{ fontSize: 11, color: '#3ecf6e', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total</span>
                                    <span style={{ fontSize: 11, color: '#3ecf6e', fontWeight: 800 }}>
                                        {monthlyMileage.reduce((s, r) => s + r.trips, 0)}
                                    </span>
                                    <span style={{ fontSize: 11, color: '#3ecf6e', fontWeight: 800 }}>
                                        {monthlyMileage.reduce((s, r) => s + r.miles, 0).toFixed(1)}
                                    </span>
                                    <span style={{ fontSize: 11, color: '#3ecf6e', fontWeight: 800 }}>
                                        ${monthlyMileage.reduce((s, r) => s + r.deduction, 0).toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div style={{ marginTop: 10, fontSize: 10, color: '#444', lineHeight: 1.5 }}>
                            Mileage estimates use {AVG_MI_PER_TRIP} mi/trip avg. For precise IRS filing, cross-reference with your actual GPS logs.
                            Keep this page bookmarked — print or screenshot at tax time.
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
