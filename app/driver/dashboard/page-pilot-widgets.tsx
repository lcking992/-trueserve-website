// Pilot widgets — imported into the driver dashboard page
// This file exports: OrderTransparencyCard
'use client';
/* global CSS injected once for responsive pay-grid */
const PAY_GRID_CSS = `
  .otc-pay-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
  @media (max-width: 560px) { .otc-pay-grid { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 560px) { .otc-care-grid { grid-template-columns: 1fr !important; } }
`;
let _injected = false;
function injectCss() {
  if (_injected || typeof document === 'undefined') return;
  const s = document.createElement('style');
  s.textContent = PAY_GRID_CSS;
  document.head.appendChild(s);
  _injected = true;
}

import { useState } from 'react';
import { Clock3, Route, ShieldCheck, TrendingUp } from 'lucide-react';

interface RestaurantTrustScore {
    packagingRating: number;   // 0-5
    avgWaitMinutes: number;
    reviewCount: number;
}

interface OrderTransparencyCardProps {
    order: any;
    trustScore?: RestaurantTrustScore | null;
    acceptAction: (formData: FormData) => Promise<void>;
}

// Helper — estimate per-mile rate and distance pay
function calcPayBreakdown(order: any) {
    const totalPay   = Number(order.totalPay || order.total || 0);
    const distanceMi = Number(order.distance || 1.2);
    const perMileRate = 0.85; // $0.85 / mi base
    const basePay    = 3.50;
    const distancePay = +(distanceMi * perMileRate).toFixed(2);
    const tip        = Number(order.tip || 0);
    // If tip unknown show locked indicator
    const tipKnown   = order.tip !== null && order.tip !== undefined;

    // Reconcile: if sum > totalPay, scale down distance
    const computedTotal = basePay + distancePay + tip;
    return { basePay, distancePay, tip, tipKnown, totalPay, distanceMi, computedTotal };
}

export function OrderTransparencyCard({ order, trustScore, acceptAction }: OrderTransparencyCardProps) {
    const [submitting, setSubmitting] = useState(false);
    injectCss();
    const { basePay, distancePay, tip, tipKnown, totalPay, distanceMi } = calcPayBreakdown(order);

    const complianceScore  = order.restaurant?.complianceScore || 0;
    const complianceStatus = order.restaurant?.complianceStatus || 'UNKNOWN';
    const isCompliant      = complianceStatus !== 'FLAGGED' && complianceScore >= 50;

    const perHourEst = totalPay > 0
        ? (totalPay / Math.max((distanceMi / 15) + 0.3, 0.2)).toFixed(2)
        : '—';
    const payPerMile = totalPay > 0 ? totalPay / Math.max(distanceMi, 0.1) : 0;
    const routeQuality = payPerMile >= 4 ? 'Strong route' : payPerMile >= 2.5 ? 'Fair route' : 'Review route';
    const waitRisk = trustScore?.avgWaitMinutes ? trustScore.avgWaitMinutes : distanceMi > 3 ? 8 : 5;

    return (
        <div style={{
            background: '#0f1210',
            border: isCompliant ? '1px solid rgba(249,115,22,0.25)' : '1px solid rgba(232,64,64,0.25)',
            borderRadius: 12, marginBottom: 10, overflow: 'hidden', minWidth: 0,
        }}>
            {/* Header */}
            <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                            {order.restaurant?.name || 'Restaurant'}
                        </div>
                        <div style={{ fontSize: 11, color: '#666' }}>{order.restaurant?.address}</div>
                    </div>
                    <span style={{ fontSize: 9, color: '#5bcfd4', textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0 }}>
                        Live
                    </span>
                </div>
            </div>

            {/* Pay breakdown — the differentiator */}
            <div style={{ padding: '12px 16px', background: 'rgba(249,115,22,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#f97316', marginBottom: 10 }}>
                    Full Pay Breakdown — shown before you accept
                </div>
                <div className="otc-pay-grid">
                    {[
                        { label: 'Base Pay',  value: `$${basePay.toFixed(2)}`,     color: '#e0e0e0' },
                        { label: `${distanceMi.toFixed(1)} mi`,  value: `$${distancePay.toFixed(2)}`,  color: '#e0e0e0' },
                        { label: 'Tip',       value: tipKnown ? `$${tip.toFixed(2)}` : 'Locked',
                          color: tipKnown ? '#3ecf6e' : '#f97316',
                          note: tipKnown ? '100% yours' : 'Revealed when confirmed' },
                        { label: 'Total',     value: `$${totalPay.toFixed(2)}`,    color: '#f97316', bold: true },
                    ].map(col => (
                        <div key={col.label} style={{
                            background: '#141a18', border: '1px solid #1e2420',
                            borderRadius: 8, padding: '8px 10px', textAlign: 'center'
                        }}>
                            <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{col.label}</div>
                            <div style={{ fontSize: 14, fontWeight: (col as any).bold ? 800 : 700, color: col.color }}>{col.value}</div>
                            {(col as any).note && (
                                <div style={{ fontSize: 8, color: tipKnown ? '#3ecf6e' : '#f97316', marginTop: 2, letterSpacing: '0.06em' }}>
                                    {(col as any).note}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                {/* Est $/hr */}
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: 9, background: 'rgba(62,207,110,0.08)', border: '1px solid rgba(62,207,110,0.2)', borderRadius: 6, padding: '3px 8px', color: '#3ecf6e', fontWeight: 700 }}>
                        ~${perHourEst}/hr est.
                    </span>
                    <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '3px 8px', color: '#666', fontWeight: 700 }}>
                        {distanceMi.toFixed(1)} mi route
                    </span>
                </div>
            </div>

            <div className="otc-care-grid" style={{ padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 7 }}>
                {[
                    { Icon: TrendingUp, label: routeQuality, detail: `$${payPerMile.toFixed(2)}/mi`, color: payPerMile >= 2.5 ? '#3ecf6e' : '#f97316' },
                    { Icon: Clock3, label: 'Wait protection', detail: `${waitRisk}+ min monitored`, color: '#f97316' },
                    { Icon: Route, label: 'Route notes', detail: 'Issues can be reviewed', color: '#5bcfd4' },
                ].map(({ Icon, label, detail, color }) => (
                    <div key={label} style={{ background: '#141a18', border: '1px solid #1e2420', borderRadius: 8, padding: '8px 9px', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color, fontSize: 9, fontWeight: 900, letterSpacing: '.09em', textTransform: 'uppercase', marginBottom: 3 }}>
                            <Icon size={12} /> {label}
                        </div>
                        <div style={{ color: '#8e9993', fontSize: 10, fontWeight: 700, lineHeight: 1.35 }}>{detail}</div>
                    </div>
                ))}
            </div>

            {/* Restaurant trust score */}
            {trustScore && (
                <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em', flexShrink: 0 }}>
                        Pickup Score
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <span style={{ fontSize: 10, color: '#e0e0e0', fontWeight: 700 }}>
                            {trustScore.packagingRating.toFixed(1)} packaging
                        </span>
                        <span style={{ fontSize: 10, color: trustScore.avgWaitMinutes <= 5 ? '#3ecf6e' : '#f97316', fontWeight: 700 }}>
                            ⏱ ~{trustScore.avgWaitMinutes} min wait
                        </span>
                        <span style={{ fontSize: 10, color: '#555', fontWeight: 700 }}>
                            {trustScore.reviewCount} driver reviews
                        </span>
                    </div>
                </div>
            )}

            {/* Compliance + CTA */}
            <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                    fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: 6,
                    background: isCompliant ? 'rgba(62,207,110,0.1)' : 'rgba(232,64,64,0.1)',
                    border: isCompliant ? '1px solid rgba(62,207,110,0.25)' : '1px solid rgba(232,64,64,0.25)',
                    color: isCompliant ? '#3ecf6e' : '#e84040',
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                }}>
                    <ShieldCheck size={11} />
                    {isCompliant ? `Compliant · ${complianceScore}` : 'Flagged'}
                </span>
                <div style={{ flex: 1 }} />
                <form action={acceptAction}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <button
                        style={{
                            background: isCompliant ? '#f97316' : '#2a2a2a',
                            color: isCompliant ? '#000' : '#555',
                            border: 'none', borderRadius: 8,
                            padding: '9px 22px', fontSize: 11, fontWeight: 800,
                            cursor: isCompliant ? 'pointer' : 'not-allowed',
                            textTransform: 'uppercase', letterSpacing: '0.12em',
                            fontFamily: 'inherit',
                        }}
                        disabled={!isCompliant}
                    >
                        {isCompliant ? 'Accept Order' : 'Flagged — Cannot Accept'}
                    </button>
                </form>
            </div>
        </div>
    );
}
