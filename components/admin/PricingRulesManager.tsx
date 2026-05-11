"use client";

import React, { useState, useTransition } from "react";
import { upsertPricingRule, toggleRuleStatus, deletePricingRule } from "@/app/admin/pricing/actions";

interface PricingRule {
    id: string;
    name: string;
    basePay: number;
    perMileRate: number;
    waitTimeRate: number;
    boostMultiplier: number;
    serviceFree: number;
    isActive: boolean;
    startDate: string;
    endDate?: string;
    zoneId?: string;
    daysOfWeek: number[];
    startTime?: string;
    endTime?: string;
    priority: number;
    isABTest?: boolean;
}

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function PricingRulesManager({ initialRules }: { initialRules: any[] }) {
    const [rules, setRules] = useState<PricingRule[]>(initialRules);
    const [editingRule, setEditingRule] = useState<Partial<PricingRule> | null>(null);
    const [showSim, setShowSim] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Simulator state
    const [simMiles, setSimMiles] = useState(5);
    const [simWait, setSimWait] = useState(10);
    const [simOph, setSimOph] = useState(2);
    const [simResult, setSimResult] = useState<any>(null);

    const handleSave = async () => {
        if (!editingRule?.name) return;
        startTransition(async () => {
            try {
                const saved = await upsertPricingRule(editingRule);
                if (editingRule.id) setRules(prev => prev.map(r => r.id === saved.id ? saved : r));
                else setRules(prev => [saved, ...prev]);
                setEditingRule(null);
            } catch (e) { console.error(e); }
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this pricing rule?")) return;
        startTransition(async () => {
            await deletePricingRule(id);
            setRules(prev => prev.filter(r => r.id !== id));
        });
    };

    const handleToggle = async (id: string, current: boolean) => {
        setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !current } : r));
        startTransition(async () => {
            try { await toggleRuleStatus(id, !current); }
            catch { setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: current } : r)); }
        });
    };

    const runSim = () => {
        const active = [...rules].filter(r => r.isActive).sort((a, b) => b.priority - a.priority)[0];
        if (!active) { setSimResult({ error: "No active rules." }); return; }
        const base = Number(active.basePay);
        const dist = Number(active.perMileRate) * simMiles;
        const wait = Number(active.waitTimeRate) * simWait;
        const total = (base + dist + wait) * Number(active.boostMultiplier);
        const tripHours = (simMiles / 20) + (simWait / 60);
        const netHourly = (total / tripHours) - (9.99 / 160 / simOph);
        setSimResult({ total: total.toFixed(2), base: base.toFixed(2), dist: dist.toFixed(2), multiplier: active.boostMultiplier, rule: active.name, netHourly: netHourly.toFixed(2) });
    };

    return (
        <>
            <style>{`
                /* ── Section header ── */
                .pe-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 24px; flex-wrap: wrap; }
                .pe-section-title { font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.5px; margin-bottom: 4px; }
                .pe-section-sub { font-size: 13px; color: #f97316; }
                .pe-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; margin-top: 6px; }

                /* ── Buttons ── */
                .pe-btn { padding: 8px 16px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.6px; cursor: pointer; border: none; text-transform: uppercase; }
                .pe-btn-outline { background: transparent; border: 1px solid #2e3830; color: #aaa; }
                .pe-btn-outline:hover { border-color: #555; color: #fff; }
                .pe-btn-orange { background: #f97316; color: #000; }
                .pe-btn-orange:hover { background: #fb923c; }
                .pe-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                /* ── Simulator ── */
                .pe-sim { background: #141a18; border: 1px solid #1e2420; border-radius: 10px; padding: 20px 24px; margin-bottom: 24px; }
                .pe-sim-title { font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 16px; letter-spacing: 0.4px; }
                .pe-sim-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
                .pe-sim-label { font-size: 10px; font-weight: 700; letter-spacing: 0.8px; color: #666; text-transform: uppercase; margin-bottom: 5px; }
                .pe-sim-label span { color: #f97316; }
                .pe-sim-range { width: 100%; accent-color: #f97316; margin-bottom: 14px; display: block; }
                .pe-sim-result { background: #0f1210; border: 1px solid #1e2420; border-radius: 8px; padding: 18px; }
                .pe-sim-payout-label { font-size: 10px; font-weight: 700; letter-spacing: 0.8px; color: #f97316; text-transform: uppercase; margin-bottom: 6px; }
                .pe-sim-total { font-size: 40px; font-weight: 800; color: #fff; margin-bottom: 14px; }
                .pe-sim-row { display: flex; justify-content: space-between; font-size: 12px; color: #555; padding: 4px 0; border-bottom: 1px solid #1a201e; }
                .pe-sim-row span { color: #ccc; }
                .pe-sim-net { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; padding-top: 10px; margin-top: 4px; color: #aaa; }
                .pe-sim-net span { color: #34d399; }
                .pe-sim-pending { color: #2a3530; font-size: 13px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; text-align: center; padding: 30px 0; }

                /* ── Rules grid ── */
                .pe-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

                /* ── Rule card ── */
                .pe-card { background: #111; border: 1px solid #1e2420; border-radius: 10px; padding: 18px 20px; position: relative; transition: border-color 150ms; }
                .pe-card:hover { border-color: #2e3830; }
                .pe-card.inactive { opacity: 0.55; }
                .pe-card-actions-hover { position: absolute; top: 14px; right: 14px; display: none; gap: 4px; }
                .pe-card:hover .pe-card-actions-hover { display: flex; }
                .pe-icon-btn { background: none; border: none; color: #555; cursor: pointer; font-size: 13px; padding: 4px 6px; border-radius: 4px; }
                .pe-icon-btn:hover { color: #f97316; background: rgba(249,115,22,0.1); }
                .pe-icon-btn.del:hover { color: #f87171; background: rgba(248,113,113,0.1); }

                .pe-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
                .pe-rule-icon { width: 36px; height: 36px; background: #1a201e; border: 1px solid #2a2a2a; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
                .pe-rule-name { font-size: 15px; font-weight: 600; color: #fff; }

                .pe-rule-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
                .pe-rule-badge { font-size: 10px; font-weight: 700; letter-spacing: 0.8px; color: #666; text-transform: uppercase; }
                .pe-rule-dot { width: 3px; height: 3px; border-radius: 50%; background: #333; flex-shrink: 0; }

                .pe-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
                .pe-stat label { font-size: 10px; font-weight: 700; letter-spacing: 0.8px; color: #555; display: block; text-transform: uppercase; margin-bottom: 4px; }
                .pe-stat .stat-val { font-size: 22px; font-weight: 700; color: #fff; }
                .pe-stat.surge-box { background: #1a201e; border: 1px solid #1e2420; border-radius: 8px; padding: 10px 14px; }
                .pe-stat.surge-box .stat-val { color: #f97316; }

                .pe-days { display: flex; gap: 6px; margin-bottom: 14px; }
                .pe-day { width: 28px; height: 28px; border-radius: 50%; background: #1a201e; border: 1px solid #222; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: #555; }
                .pe-day.on { background: rgba(249,115,22,0.12); border-color: rgba(249,115,22,0.25); color: #f97316; }

                .pe-card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid #1a201e; }
                .pe-status { display: flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; }
                .pe-status-dot { width: 7px; height: 7px; border-radius: 50%; }
                .pe-status-dot.live { background: #34d399; }
                .pe-status-dot.off { background: #333; }
                .pe-status.live { color: #34d399; }
                .pe-status.off { color: #555; }
                .pe-toggle-btn { font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #aaa; background: none; border: none; cursor: pointer; }
                .pe-toggle-btn:hover { color: #f97316; }

                .pe-empty { background: #111; border: 1px solid #1e2420; border-radius: 10px; padding: 48px; text-align: center; color: #333; font-size: 13px; font-weight: 600; letter-spacing: 0.3em; text-transform: uppercase; }

                /* ── Modal ── */
                .pe-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
                .pe-modal { background: #111; border: 1px solid #2e3830; border-radius: 10px; padding: 28px; width: 100%; max-width: 680px; max-height: 90vh; overflow-y: auto; position: relative; }
                .pe-modal-title { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 20px; letter-spacing: -0.2px; }
                .pe-modal-close { position: absolute; top: 16px; right: 18px; background: none; border: none; color: #444; cursor: pointer; font-size: 18px; line-height: 1; }
                .pe-modal-close:hover { color: #fff; }
                .pe-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .pe-field { margin-bottom: 14px; }
                .pe-field label { font-size: 10px; font-weight: 700; letter-spacing: 0.8px; color: #555; text-transform: uppercase; display: block; margin-bottom: 5px; }
                .pe-field input, .pe-field select { width: 100%; background: #0d0d0d; border: 1px solid #2a2a2a; color: #fff; font-size: 13px; padding: 8px 12px; border-radius: 6px; outline: none; box-sizing: border-box; }
                .pe-field input:focus, .pe-field select:focus { border-color: #f97316; }
                .pe-day-picker { display: flex; gap: 6px; flex-wrap: wrap; }
                .pe-day-pick-btn { width: 34px; height: 34px; border-radius: 50%; background: #1a201e; border: 1px solid #222; color: #555; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; }
                .pe-day-pick-btn.sel { background: rgba(249,115,22,0.15); border-color: rgba(249,115,22,0.3); color: #f97316; }
                .pe-modal-footer { display: flex; gap: 10px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #1e2420; }

                @media (max-width: 1100px) { .pe-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (max-width: 700px) { .pe-grid { grid-template-columns: 1fr; } .pe-sim-grid { grid-template-columns: 1fr; } .pe-modal-grid { grid-template-columns: 1fr; } }
            `}</style>

            {/* Section header */}
            <div className="pe-top">
                <div>
                    <div className="pe-section-title">Pricing Engine</div>
                    <div className="pe-section-sub">Dynamic base pay, mileage rates, and surge policies.</div>
                </div>
                <div className="pe-actions">
                    <button className="pe-btn pe-btn-outline" onClick={() => setShowSim(!showSim)}>
                        ☰&nbsp; {showSim ? "Hide Simulator" : "Preview Simulator"}
                    </button>
                    <button className="pe-btn pe-btn-orange" onClick={() => setEditingRule({
                        name: "New Rule", basePay: 3.50, perMileRate: 0.60,
                        waitTimeRate: 0.25, boostMultiplier: 1.0, priority: 0,
                        isActive: true, daysOfWeek: [0,1,2,3,4,5,6]
                    })}>
                        + Add Rule
                    </button>
                </div>
            </div>

            {/* Simulator */}
            {showSim && (
                <div className="pe-sim">
                    <div className="pe-sim-title">Payout Simulator</div>
                    <div className="pe-sim-grid">
                        <div>
                            <div className="pe-sim-label">Distance: <span>{simMiles} mi</span></div>
                            <input type="range" min="1" max="50" value={simMiles} onChange={e => setSimMiles(Number(e.target.value))} className="pe-sim-range" />
                            <div className="pe-sim-label">Wait Time: <span>{simWait} min</span></div>
                            <input type="range" min="0" max="60" value={simWait} onChange={e => setSimWait(Number(e.target.value))} className="pe-sim-range" />
                            <div className="pe-sim-label">Orders / Hour: <span>{simOph}</span></div>
                            <input type="range" min="1" max="5" step="0.5" value={simOph} onChange={e => setSimOph(Number(e.target.value))} className="pe-sim-range" />
                            <button className="pe-btn pe-btn-orange" style={{ width: '100%', marginTop: 4 }} onClick={runSim}>
                                Run Simulation
                            </button>
                        </div>
                        <div>
                            {simResult && !simResult.error ? (
                                <div className="pe-sim-result">
                                    <div className="pe-sim-payout-label">Estimated Driver Payout</div>
                                    <div className="pe-sim-total">${simResult.total}</div>
                                    <div className="pe-sim-row">Base Pay <span>${simResult.base}</span></div>
                                    <div className="pe-sim-row">Mileage <span>${simResult.dist}</span></div>
                                    <div className="pe-sim-row">Surge Multiplier <span>{simResult.multiplier}x</span></div>
                                    <div className="pe-sim-net">Net Hourly (pre-gas) <span>${simResult.netHourly}/hr</span></div>
                                    <div style={{ fontSize: 11, color: '#333', marginTop: 8 }}>Applied: {simResult.rule}</div>
                                </div>
                            ) : simResult?.error ? (
                                <div style={{ color: '#f87171', fontSize: 13 }}>{simResult.error}</div>
                            ) : (
                                <div className="pe-sim-pending">Simulation Pending</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Rules Grid */}
            {rules.length === 0 ? (
                <div className="pe-empty">No Pricing Rules — Add One Above</div>
            ) : (
                <div className="pe-grid">
                    {rules.map((rule) => (
                        <div key={rule.id} className={`pe-card ${!rule.isActive ? 'inactive' : ''}`}>
                            {/* Hover actions */}
                            <div className="pe-card-actions-hover">
                                <button className="pe-icon-btn" onClick={() => setEditingRule(rule)} title="Edit">Edit</button>
                                <button className="pe-icon-btn del" onClick={() => handleDelete(rule.id)} title="Delete">Delete</button>
                            </div>

                            {/* Header */}
                            <div className="pe-card-header">
                                <div className="pe-rule-icon">{rule.boostMultiplier > 1 ? "Launch" : "Balance"}</div>
                                <div className="pe-rule-name">{rule.name}</div>
                            </div>

                            {/* Meta */}
                            <div className="pe-rule-meta">
                                <span className="pe-rule-badge">Priority {rule.priority}</span>
                                <span className="pe-rule-dot" />
                                <span className="pe-rule-badge">{rule.zoneId || "Global Zone"}</span>
                            </div>

                            {/* Stats */}
                            <div className="pe-stats">
                                <div className="pe-stat">
                                    <label>Base Pay</label>
                                    <div className="stat-val">${Number(rule.basePay).toFixed(2)}</div>
                                </div>
                                <div className="pe-stat surge-box">
                                    <label>Surge</label>
                                    <div className="stat-val">{rule.boostMultiplier}x</div>
                                </div>
                            </div>

                            {/* Days */}
                            <div className="pe-days">
                                {DAYS.map((d, i) => (
                                    <div key={i} className={`pe-day ${rule.daysOfWeek?.includes(i) ? 'on' : ''}`}>{d}</div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="pe-card-footer">
                                <div className={`pe-status ${rule.isActive ? 'live' : 'off'}`}>
                                    <span className={`pe-status-dot ${rule.isActive ? 'live' : 'off'}`} />
                                    {rule.isActive ? "Live Engine" : "Disabled"}
                                </div>
                                <button className="pe-toggle-btn" onClick={() => handleToggle(rule.id, rule.isActive)}>
                                    {rule.isActive ? "Disable" : "Enable"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingRule && (
                <div className="pe-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEditingRule(null); }}>
                    <div className="pe-modal">
                        <button className="pe-modal-close" onClick={() => setEditingRule(null)}>Close</button>
                        <div className="pe-modal-title">{editingRule.id ? "Edit Rule" : "New Pricing Rule"}</div>

                        <div className="pe-modal-grid">
                            <div>
                                <div className="pe-field">
                                    <label>Rule Name</label>
                                    <input value={editingRule.name || ''} onChange={e => setEditingRule({...editingRule, name: e.target.value})} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <div className="pe-field">
                                        <label>Base Pay ($)</label>
                                        <input type="number" step="0.5" value={editingRule.basePay || 0} onChange={e => setEditingRule({...editingRule, basePay: Number(e.target.value)})} />
                                    </div>
                                    <div className="pe-field">
                                        <label>Per Mile ($)</label>
                                        <input type="number" step="0.05" value={editingRule.perMileRate || 0} onChange={e => setEditingRule({...editingRule, perMileRate: Number(e.target.value)})} />
                                    </div>
                                    <div className="pe-field">
                                        <label>Wait Time ($/min)</label>
                                        <input type="number" step="0.05" value={editingRule.waitTimeRate || 0} onChange={e => setEditingRule({...editingRule, waitTimeRate: Number(e.target.value)})} />
                                    </div>
                                    <div className="pe-field">
                                        <label>Surge Multiplier</label>
                                        <input type="number" step="0.1" value={editingRule.boostMultiplier || 1} onChange={e => setEditingRule({...editingRule, boostMultiplier: Number(e.target.value)})} style={{ color: '#f97316' }} />
                                    </div>
                                    <div className="pe-field">
                                        <label>Priority</label>
                                        <input type="number" value={editingRule.priority || 0} onChange={e => setEditingRule({...editingRule, priority: Number(e.target.value)})} />
                                    </div>
                                    <div className="pe-field">
                                        <label>Zone ID</label>
                                        <input placeholder="Global" value={editingRule.zoneId || ''} onChange={e => setEditingRule({...editingRule, zoneId: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="pe-field">
                                    <label>Active Days</label>
                                    <div className="pe-day-picker" style={{ marginTop: 4 }}>
                                        {DAY_LABELS.map((d, i) => (
                                            <button
                                                key={d}
                                                type="button"
                                                className={`pe-day-pick-btn ${editingRule.daysOfWeek?.includes(i) ? 'sel' : ''}`}
                                                onClick={() => {
                                                    const curr = editingRule.daysOfWeek || [];
                                                    setEditingRule({...editingRule, daysOfWeek: curr.includes(i) ? curr.filter(x => x !== i) : [...curr, i]});
                                                }}
                                            >
                                                {d[0]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <div className="pe-field">
                                        <label>Start Time</label>
                                        <input type="time" value={editingRule.startTime || ''} onChange={e => setEditingRule({...editingRule, startTime: e.target.value})} />
                                    </div>
                                    <div className="pe-field">
                                        <label>End Time</label>
                                        <input type="time" value={editingRule.endTime || ''} onChange={e => setEditingRule({...editingRule, endTime: e.target.value})} />
                                    </div>
                                    <div className="pe-field">
                                        <label>Effective Date</label>
                                        <input type="date" value={editingRule.startDate || ''} onChange={e => setEditingRule({...editingRule, startDate: e.target.value})} />
                                    </div>
                                    <div className="pe-field">
                                        <label>End Date</label>
                                        <input type="date" value={editingRule.endDate || ''} onChange={e => setEditingRule({...editingRule, endDate: e.target.value})} />
                                    </div>
                                </div>
                                <div className="pe-field" style={{ marginTop: 4 }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', textTransform: 'none', letterSpacing: 'normal', fontSize: 13, color: '#aaa' }}>
                                        <input type="checkbox" checked={!!editingRule.isActive} onChange={e => setEditingRule({...editingRule, isActive: e.target.checked})} style={{ width: 'auto' }} />
                                        Rule Active
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="pe-modal-footer">
                            <button className="pe-btn pe-btn-orange" style={{ flex: 1 }} onClick={handleSave} disabled={isPending}>
                                {isPending ? "Saving..." : "Save Rule"}
                            </button>
                            <button className="pe-btn pe-btn-outline" onClick={() => setEditingRule(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
