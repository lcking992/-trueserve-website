'use client';

import { useState, useEffect } from 'react';

interface Props {
    weeklyTotal: number;
    daysLeft: number;
}

const PRESETS = [500, 800, 1000, 1500];

const EPW_CSS = `
  .epw-prediction-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .epw-header-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 18px; flex-wrap: wrap; }
  .epw-presets { display: flex; gap: 6px; flex-wrap: wrap; }
  @media (max-width: 480px) {
    .epw-prediction-grid { grid-template-columns: 1fr; }
    .epw-header-row { flex-direction: column; gap: 10px; }
    .epw-presets { gap: 4px; }
  }
`;
let _epwInjected = false;

export default function EarningsPlannerWidget({ weeklyTotal, daysLeft }: Props) {
    const [weeklyGoal, setWeeklyGoal] = useState(800);
    const [editingGoal, setEditingGoal] = useState(false);
    const [goalInput, setGoalInput] = useState('800');

    const remaining   = Math.max(weeklyGoal - weeklyTotal, 0);
    const pct         = Math.min((weeklyTotal / weeklyGoal) * 100, 100);
    const avgPerTrip  = 18; // conservative estimate when no real data
    const tripsNeeded = Math.ceil(remaining / avgPerTrip);
    const perDay      = remaining / Math.max(daysLeft, 1);
    const goalHit     = weeklyTotal >= weeklyGoal;

    useEffect(() => {
        if (_epwInjected || typeof document === 'undefined') return;
        const s = document.createElement('style');
        s.textContent = EPW_CSS;
        document.head.appendChild(s);
        _epwInjected = true;
    }, []);

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(249,115,22,0.06) 0%, rgba(0,0,0,0) 60%)',
            border: '1px solid rgba(249,115,22,0.18)',
            padding: '18px 20px',
            marginBottom: 28,
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Decorative glow */}
            <div style={{
                position: 'absolute', top: -40, right: -40,
                width: 160, height: 160,
                background: 'rgba(249,115,22,0.06)',
                borderRadius: '50%', filter: 'blur(40px)',
                pointerEvents: 'none',
            }} />

            {/* Header row */}
            <div className="epw-header-row">
                <div>
                    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#f97316', marginBottom: 4 }}>
                        Earnings Forecast
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
                        Weekly Goal Tracker
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    {editingGoal ? (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input
                                type="number"
                                value={goalInput}
                                onChange={e => setGoalInput(e.target.value)}
                                style={{
                                    background: '#0c0e13', border: '1px solid #f97316',
                                    color: '#fff', width: 80, padding: '5px 10px',
                                    fontSize: 13, fontFamily: "'DM Mono', monospace",
                                    outline: 'none',
                                }}
                            />
                            <button
                                onClick={() => { setWeeklyGoal(Number(goalInput) || 800); setEditingGoal(false); }}
                                style={{
                                    fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
                                    textTransform: 'uppercase', padding: '6px 12px',
                                    background: 'rgba(249,115,22,0.2)', color: '#f97316',
                                    border: '1px solid rgba(249,115,22,0.3)', cursor: 'pointer',
                                }}
                            >Save</button>
                            <button
                                onClick={() => setEditingGoal(false)}
                                style={{
                                    fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
                                    textTransform: 'uppercase', padding: '6px 10px',
                                    background: 'transparent', color: '#555',
                                    border: '1px solid #1c1f28', cursor: 'pointer',
                                }}
                            >×</button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#ccc' }}>
                                Goal: <span style={{ color: '#f97316' }}>${weeklyGoal}</span>
                            </span>
                            <button
                                onClick={() => { setGoalInput(String(weeklyGoal)); setEditingGoal(true); }}
                                style={{
                                    fontSize: 9, fontWeight: 800, letterSpacing: '0.1em',
                                    textTransform: 'uppercase', padding: '4px 10px',
                                    background: 'transparent', color: '#444',
                                    border: '1px solid #1c1f28', cursor: 'pointer',
                                }}
                            >Edit</button>
                        </div>
                    )}
                    {/* Preset chips */}
                    {!editingGoal && (
                        <div className="epw-presets">
                            {PRESETS.map(g => (
                                <button
                                    key={g}
                                    onClick={() => { setWeeklyGoal(g); setGoalInput(String(g)); }}
                                    style={{
                                        fontSize: 9, fontWeight: 800, letterSpacing: '0.08em',
                                        textTransform: 'uppercase', padding: '3px 9px',
                                        background: weeklyGoal === g ? 'rgba(249,115,22,0.18)' : 'transparent',
                                        color: weeklyGoal === g ? '#f97316' : '#333',
                                        border: weeklyGoal === g ? '1px solid rgba(249,115,22,0.3)' : '1px solid #1c1f28',
                                        cursor: 'pointer', transition: 'all .15s',
                                        borderRadius: 20,
                                    }}
                                >${g}</button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                        This Week
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: "'DM Mono', monospace" }}>
                        ${weeklyTotal.toFixed(2)}{' '}
                        <span style={{ color: '#444', fontWeight: 400 }}>/ ${weeklyGoal}</span>
                    </span>
                </div>
                <div style={{ height: 8, background: '#1c1f28', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: goalHit
                            ? 'linear-gradient(90deg, #10b981, #34d399)'
                            : 'linear-gradient(90deg, #f97316, #fb923c)',
                        borderRadius: 4,
                        transition: 'width 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        boxShadow: goalHit
                            ? '0 0 10px rgba(16,185,129,0.5)'
                            : '0 0 10px rgba(249,115,22,0.4)',
                    }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ fontSize: 9, color: '#222', fontWeight: 700 }}>$0</span>
                    <span style={{ fontSize: 9, color: goalHit ? '#3dd68c' : '#f97316', fontWeight: 700 }}>
                        {pct.toFixed(0)}% complete
                    </span>
                    <span style={{ fontSize: 9, color: '#222', fontWeight: 700 }}>${weeklyGoal}</span>
                </div>
            </div>

            {/* Prediction cards */}
            {goalHit ? (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: 'rgba(61,214,140,0.06)', border: '1px solid rgba(61,214,140,0.18)',
                    padding: '14px 18px',
                }}>
                    <span style={{ fontSize: 28 }}></span>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#3dd68c', marginBottom: 3 }}>Goal Crushed!</div>
                        <div style={{ fontSize: 11, color: '#555', lineHeight: 1.5 }}>
                            You hit your ${weeklyGoal} target. Every extra trip this week is pure bonus earnings.
                        </div>
                    </div>
                </div>
            ) : (
                <div className="epw-prediction-grid">
                    {[
                        { label: 'Still Needed', value: `$${remaining.toFixed(0)}`, sub: `${pct.toFixed(0)}% there`, color: '#fff' },
                        { label: 'Trips to Goal', value: String(tripsNeeded), sub: `~$${avgPerTrip}/trip avg`, color: '#f97316' },
                        { label: `Days Left`, value: String(daysLeft), sub: `~$${perDay.toFixed(0)}/day needed`, color: '#fff' },
                    ].map(({ label, value, sub, color }) => (
                        <div key={label} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #1c1f28', padding: '14px 16px' }}>
                            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#444', marginBottom: 8 }}>{label}</div>
                            <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "'DM Mono', monospace", lineHeight: 1, marginBottom: 6 }}>{value}</div>
                            <div style={{ fontSize: 10, color: '#444' }}>{sub}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
