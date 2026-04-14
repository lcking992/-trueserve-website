"use client";

import { useState, useEffect } from "react";

const CHECKLIST = [
    // Health & Safety — 40 pts
    { id: "health_inspection",  category: "Health & Safety",     label: "Last health inspection passed",                     points: 10 },
    { id: "food_safety_certs",  category: "Health & Safety",     label: "Food safety training certificates current",          points: 10 },
    { id: "temp_logs",          category: "Health & Safety",     label: "Temperature logs maintained daily",                  points: 10 },
    { id: "allergen_info",      category: "Health & Safety",     label: "Allergen information posted for all menu items",     points: 10 },
    // Operational Readiness — 30 pts
    { id: "delivery_bags",      category: "Operational Readiness", label: "Delivery bags sanitized and in compliance",        points: 10 },
    { id: "packaging",          category: "Operational Readiness", label: "Packaging materials meet food safety standards",   points: 10 },
    { id: "cleaning_schedule",  category: "Operational Readiness", label: "Kitchen cleaning schedule documented and active",  points: 10 },
    // Documentation — 30 pts
    { id: "business_license",   category: "Documentation",       label: "Business license current and displayed",             points: 10 },
    { id: "health_permit",      category: "Documentation",       label: "Health department permit valid and on file",         points: 10 },
    { id: "staff_certs",        category: "Documentation",       label: "Staff food handling certifications on file",         points: 10 },
];

const CATEGORIES = [
    { name: "Health & Safety",     maxPoints: 40 },
    { name: "Operational Readiness", maxPoints: 30 },
    { name: "Documentation",       maxPoints: 30 },
];

function getGrade(score: number): { letter: string; color: string; label: string } {
    if (score >= 90) return { letter: "A", color: "#3dd68c", label: "Excellent" };
    if (score >= 75) return { letter: "B", color: "#e8a230", label: "Good" };
    if (score >= 60) return { letter: "C", color: "#f59e0b", label: "Needs Improvement" };
    return { letter: "D", color: "#ef4444", label: "Action Required" };
}

function ScoreRing({ score }: { score: number }) {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const grade = getGrade(score);

    return (
        <svg width="140" height="140" viewBox="0 0 140 140">
            {/* Background ring */}
            <circle cx="70" cy="70" r={radius} fill="none" stroke="#1c1f28" strokeWidth="10" />
            {/* Progress ring */}
            <circle
                cx="70" cy="70" r={radius}
                fill="none"
                stroke={grade.color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 70 70)"
                style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s ease" }}
            />
            {/* Score text */}
            <text x="70" y="62" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="700" fontFamily="'DM Mono', monospace">
                {score}
            </text>
            <text x="70" y="78" textAnchor="middle" fill="#555" fontSize="11" fontWeight="600" letterSpacing="0.1em">
                OUT OF 100
            </text>
            <text x="70" y="98" textAnchor="middle" fill={grade.color} fontSize="13" fontWeight="700" letterSpacing="0.08em">
                GRADE {grade.letter}
            </text>
        </svg>
    );
}

export default function ComplianceClient({ restaurantId, restaurantName }: { restaurantId: string; restaurantName: string }) {
    const STORAGE_KEY = `compliance_${restaurantId}`;

    const [checked, setChecked] = useState<Record<string, boolean>>({});
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setChecked(parsed.checks || {});
                setLastUpdated(parsed.updatedAt || null);
            } catch {}
        }
        setMounted(true);
    }, [STORAGE_KEY]);

    const toggle = (id: string) => {
        const next = { ...checked, [id]: !checked[id] };
        setChecked(next);
        const now = new Date().toISOString();
        setLastUpdated(now);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ checks: next, updatedAt: now }));
    };

    const score = CHECKLIST.reduce((sum, item) => sum + (checked[item.id] ? item.points : 0), 0);
    const grade = getGrade(score);

    const categoryScore = (cat: string) =>
        CHECKLIST.filter(i => i.category === cat).reduce((s, i) => s + (checked[i.id] ? i.points : 0), 0);

    if (!mounted) return null;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@1,700;1,800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');

                .cp-body { background: #0c0e13; font-family: 'DM Sans', sans-serif; color: #fff; padding-bottom: 80px; }

                /* PAGE HEADER */
                .cp-hd { padding: 20px 24px 16px; border-bottom: 1px solid #1c1f28; }
                .cp-title { font-family: 'Barlow Condensed', sans-serif; font-size: 26px; font-weight: 800; font-style: italic; text-transform: uppercase; color: #fff; line-height: 1; }
                .cp-sub { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #444; margin-top: 4px; }

                /* TOP ROW */
                .cp-top { display: grid; grid-template-columns: auto 1fr; gap: 1px; background: #1c1f28; border: 1px solid #1c1f28; margin: 20px 24px 0; }
                .cp-score-block { background: #0f1219; padding: 28px 32px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
                .cp-score-label { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #555; }
                .cp-grade-badge { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 12px; border: 1px solid; }
                .cp-last-updated { font-size: 10px; color: #444; font-weight: 600; letter-spacing: 0.06em; }

                /* CATEGORY BARS */
                .cp-cats { background: #0f1219; padding: 24px 24px; display: flex; flex-direction: column; justify-content: center; gap: 20px; }
                .cp-cat-row { display: flex; align-items: center; gap: 16px; }
                .cp-cat-name { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #888; width: 160px; flex-shrink: 0; }
                .cp-bar-track { flex: 1; height: 4px; background: #1c1f28; border-radius: 2px; overflow: hidden; }
                .cp-bar-fill { height: 100%; border-radius: 2px; transition: width 0.8s cubic-bezier(0.16,1,0.3,1); }
                .cp-cat-pts { font-size: 12px; font-weight: 700; font-family: 'DM Mono', monospace; color: #888; width: 60px; text-align: right; flex-shrink: 0; }

                /* CHECKLIST SECTIONS */
                .cp-section { margin: 1px 0 0; }
                .cp-section-hd { display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; background: #090b0f; border-top: 1px solid #1c1f28; border-bottom: 1px solid #1c1f28; }
                .cp-section-title { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 800; font-style: italic; text-transform: uppercase; color: #fff; letter-spacing: 0.04em; }
                .cp-section-pts { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; }

                .cp-item { display: flex; align-items: center; gap: 14px; padding: 14px 24px; background: #0f1219; border-bottom: 1px solid #131720; cursor: pointer; transition: background 0.15s; user-select: none; }
                .cp-item:hover { background: #131720; }
                .cp-item:last-child { border-bottom: none; }

                .cp-checkbox { width: 18px; height: 18px; border: 1.5px solid #2a2f3a; background: #0c0e13; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; }
                .cp-checkbox.done { background: #0d2a1a; border-color: #3dd68c; }
                .cp-item-label { flex: 1; font-size: 13px; color: #888; font-weight: 500; transition: color 0.15s; }
                .cp-item-label.done { color: #ccc; }
                .cp-item-pts { font-size: 10px; font-weight: 700; font-family: 'DM Mono', monospace; color: #2a2f3a; }
                .cp-item-pts.done { color: #3dd68c; }

                /* PHASE ROADMAP */
                .cp-roadmap { margin: 20px 24px 0; }
                .cp-roadmap-hd { font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #444; margin-bottom: 1px; }
                .cp-roadmap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #1c1f28; border: 1px solid #1c1f28; }
                .cp-phase { background: #0f1219; padding: 20px; }
                .cp-phase-badge { font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #e8a230; border: 1px solid rgba(232,162,48,0.2); padding: 3px 8px; display: inline-block; margin-bottom: 12px; }
                .cp-phase-title { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 6px; }
                .cp-phase-desc { font-size: 12px; color: #555; line-height: 1.6; }
                .cp-phase-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #444; margin-top: 8px; }
                .cp-phase-dot { width: 4px; height: 4px; background: #2a2f3a; border-radius: 50%; flex-shrink: 0; }
                .cp-coming-badge { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #444; border: 1px solid #1c1f28; padding: 2px 8px; display: inline-block; margin-top: 12px; }

                /* MOBILE */
                @media (max-width: 640px) {
                    .cp-hd { padding: 16px; }
                    .cp-top { grid-template-columns: 1fr; margin: 16px 16px 0; }
                    .cp-score-block { flex-direction: row; padding: 20px; gap: 20px; }
                    .cp-cats { padding: 16px; }
                    .cp-cat-name { width: 120px; font-size: 10px; }
                    .cp-section-hd { padding: 12px 16px; }
                    .cp-item { padding: 12px 16px; }
                    .cp-roadmap { margin: 16px 16px 0; }
                    .cp-roadmap-grid { grid-template-columns: 1fr; }
                }
            `}</style>

            <div className="cp-body">
                {/* HEADER */}
                <div className="cp-hd">
                    <div className="cp-title">Compliance Score</div>
                    <div className="cp-sub">TrueServe Compliance · {restaurantName}</div>
                </div>

                {/* SCORE + CATEGORY BARS */}
                <div className="cp-top">
                    <div className="cp-score-block">
                        <div className="cp-score-label">Overall Score</div>
                        <ScoreRing score={score} />
                        <div
                            className="cp-grade-badge"
                            style={{ color: grade.color, borderColor: grade.color + "40", background: grade.color + "10" }}
                        >
                            {grade.label}
                        </div>
                        {lastUpdated && (
                            <div className="cp-last-updated">
                                Updated {new Date(lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </div>
                        )}
                    </div>

                    <div className="cp-cats">
                        {CATEGORIES.map(cat => {
                            const earned = categoryScore(cat.name);
                            const pct = (earned / cat.maxPoints) * 100;
                            const barColor = pct === 100 ? "#3dd68c" : pct >= 50 ? "#e8a230" : "#ef4444";
                            return (
                                <div key={cat.name} className="cp-cat-row">
                                    <div className="cp-cat-name">{cat.name}</div>
                                    <div className="cp-bar-track">
                                        <div className="cp-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                                    </div>
                                    <div className="cp-cat-pts" style={{ color: barColor }}>{earned}/{cat.maxPoints}</div>
                                </div>
                            );
                        })}

                        {/* Summary blurb */}
                        <div style={{ marginTop: 8, padding: "12px 16px", background: "#131720", border: "1px solid #1c1f28" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: grade.color, marginBottom: 4 }}>
                                {score === 100 ? "✓ Fully Compliant" : score >= 75 ? "↑ Almost There" : "⚠ Action Required"}
                            </div>
                            <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>
                                {score === 100
                                    ? "Your restaurant meets all TrueServe compliance standards. Excellent work."
                                    : `Complete ${10 - Math.floor(score / 10)} more items to reach an A grade and unlock a compliance badge on your storefront.`
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* CHECKLIST — grouped by category */}
                {CATEGORIES.map(cat => {
                    const items = CHECKLIST.filter(i => i.category === cat.name);
                    const earned = categoryScore(cat.name);
                    const complete = earned === cat.maxPoints;
                    return (
                        <div key={cat.name} className="cp-section">
                            <div className="cp-section-hd">
                                <div className="cp-section-title">{cat.name}</div>
                                <div
                                    className="cp-section-pts"
                                    style={{
                                        color: complete ? "#3dd68c" : "#888",
                                        borderColor: complete ? "#1a4a2a" : "#1c1f28",
                                        background: complete ? "#0d2a1a" : "#131720"
                                    }}
                                >
                                    {earned}/{cat.maxPoints} pts
                                </div>
                            </div>
                            {items.map(item => {
                                const done = Boolean(checked[item.id]);
                                return (
                                    <div key={item.id} className="cp-item" onClick={() => toggle(item.id)}>
                                        <div className={`cp-checkbox ${done ? "done" : ""}`}>
                                            {done && (
                                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                    <path d="M1 4l3 3 5-6" stroke="#3dd68c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            )}
                                        </div>
                                        <div className={`cp-item-label ${done ? "done" : ""}`}>{item.label}</div>
                                        <div className={`cp-item-pts ${done ? "done" : ""}`}>+{item.points}</div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}

                {/* ROADMAP */}
                <div className="cp-roadmap">
                    <div className="cp-roadmap-hd">Compliance Roadmap</div>
                    <div className="cp-roadmap-grid">
                        <div className="cp-phase">
                            <div className="cp-phase-badge">Phase 2 · Coming Soon</div>
                            <div className="cp-phase-title">Public Inspection Data</div>
                            <div className="cp-phase-desc">
                                TrueServe will pull official health inspection scores from local government APIs
                                and display them directly on your restaurant profile — building trust with customers.
                            </div>
                            <div className="cp-phase-item"><div className="cp-phase-dot"/>"A Rated – Last Inspection: 98"</div>
                            <div className="cp-phase-item"><div className="cp-phase-dot"/>Displayed on your storefront</div>
                            <div className="cp-phase-item"><div className="cp-phase-dot"/>Differentiates from DoorDash</div>
                            <div className="cp-coming-badge">In Development</div>
                        </div>
                        <div className="cp-phase">
                            <div className="cp-phase-badge">Phase 3 · Roadmap</div>
                            <div className="cp-phase-title">Franchise Compliance Dashboard</div>
                            <div className="cp-phase-desc">
                                Multi-location operators and franchises will get a unified compliance view
                                across all locations — standardized inspections, task tracking, and audit readiness.
                            </div>
                            <div className="cp-phase-item"><div className="cp-phase-dot"/>Powered by Jolt or iAuditor</div>
                            <div className="cp-phase-item"><div className="cp-phase-dot"/>Driver food handling compliance</div>
                            <div className="cp-phase-item"><div className="cp-phase-dot"/>Franchise-level analytics</div>
                            <div className="cp-coming-badge">Planned · Enterprise</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
