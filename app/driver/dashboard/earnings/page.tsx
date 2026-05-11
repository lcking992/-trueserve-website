import { cookies } from "next/headers";
import { getDriverOrRedirect } from "@/lib/driver-auth";
import MileageTracker from "@/components/MileageTracker";
import EarningsPlannerWidget from "./EarningsPlannerWidget";
import EarningsComparisonWidget from "./EarningsComparisonWidget";

export const dynamic = 'force-dynamic';

const MOCK_ROWS = [
    { date: "2026-04-23", restaurant: "Emerald Kitchen",    miles: 3.2, base: 5.50, tip: 4.00, total: 9.50  },
    { date: "2026-04-23", restaurant: "Noodle Palace",      miles: 5.1, base: 6.75, tip: 3.50, total: 10.25 },
    { date: "2026-04-22", restaurant: "Burger Vault",       miles: 2.4, base: 4.50, tip: 2.00, total: 6.50  },
    { date: "2026-04-22", restaurant: "Sunrise Bowls",      miles: 6.8, base: 8.00, tip: 5.00, total: 13.00 },
    { date: "2026-04-21", restaurant: "Taco Loco",          miles: 4.0, base: 5.75, tip: 3.00, total: 8.75  },
    { date: "2026-04-21", restaurant: "Pho Saigon",         miles: 3.5, base: 5.25, tip: 2.50, total: 7.75  },
    { date: "2026-04-20", restaurant: "Gold Wok",           miles: 7.2, base: 9.00, tip: 4.50, total: 13.50 },
    { date: "2026-04-19", restaurant: "Pizza Underground",  miles: 2.9, base: 4.75, tip: 2.00, total: 6.75  },
    { date: "2026-04-18", restaurant: "The Grill House",    miles: 5.5, base: 7.25, tip: 3.50, total: 10.75 },
    { date: "2026-04-17", restaurant: "Harvest Table",      miles: 4.1, base: 6.00, tip: 4.00, total: 10.00 },
];

// Weekly bar data Mon-Sun (mock values proportional)
const WEEK_DAYS = [
    { day: "Mon", amount: 24.00 },
    { day: "Tue", amount: 31.50 },
    { day: "Wed", amount: 18.75 },
    { day: "Thu", amount: 42.00 },
    { day: "Fri", amount: 56.25 },
    { day: "Sat", amount: 67.50 },
    { day: "Sun", amount: 38.00 },
];

const MAX_DAY = Math.max(...WEEK_DAYS.map(d => d.amount));

export default async function DriverEarnings() {
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";

    const driver = isPreview
        ? { id: "preview", name: "Jordan Rivers", balance: 247.50, currentLat: 35.2271, currentLng: -80.8431 }
        : await getDriverOrRedirect();

    // Mock orders for comparison widget (real data would come from DB)
    const mockOrders = MOCK_ROWS.map((r, i) => ({
        id: `mock-${i}`,
        status: 'DELIVERED',
        totalPay: r.base,
        tip: r.tip,
        createdAt: r.date,
    }));

    const balance = driver?.balance || 0;

    // Compute totals from mock rows
    const allTimeTotal = balance;
    const weeklyTotal  = MOCK_ROWS.slice(0, 4).reduce((s, r) => s + r.total, 0);
    const monthlyTotal = MOCK_ROWS.reduce((s, r) => s + r.total, 0);

    const totalBase = MOCK_ROWS.reduce((s, r) => s + r.base, 0);
    const totalTips = MOCK_ROWS.reduce((s, r) => s + r.tip, 0);
    const bonuses   = 12.50;
    const grandTotal = totalBase + totalTips + bonuses;
    const basePct  = Math.round((totalBase / grandTotal) * 100);
    const tipPct   = Math.round((totalTips / grandTotal) * 100);
    const bonusPct = 100 - basePct - tipPct;

    const ytdEst   = allTimeTotal * 12;          // rough annualised
    const taxAside = ytdEst * 0.25;

    return (
        <div className="font-sans">
            <style dangerouslySetInnerHTML={{ __html: `
                /* ── layout ── */
                .two-col-ledger { display: grid; grid-template-columns: 1fr 360px; gap: 1px; background: #1c1f28; border-bottom: 1px solid #1c1f28; }
                @media (max-width: 1024px) { .two-col-ledger { grid-template-columns: 1fr; } }
                .ledger-left  { background: #0c0c0e; padding: 28px 24px; }
                .ledger-right { background: #080808; padding: 28px 24px; display: flex; flex-direction: column; gap: 16px; }

                /* ── heading ── */
                .section-hd-title { font-size: 36px; font-weight: 700; color: #fff; letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 8px; }
                .section-hd-title span { color: #f97316; }
                .section-hd-sub { font-size: 10px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: #333; margin-bottom: 28px; display: block; }

                /* ── stat cards row ── */
                .stat-cards-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #1c1f28; border: 1px solid #1c1f28; margin-bottom: 28px; }
                @media (max-width: 640px) { .stat-cards-row { grid-template-columns: 1fr; } }
                .stat-card { background: #0f1219; padding: 18px 16px; }
                .stat-card-lbl { font-size: 9px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #444; margin-bottom: 8px; }
                .stat-card-val { font-family: 'DM Mono', monospace; font-size: 28px; font-weight: 700; color: #fff; line-height: 1; letter-spacing: -0.02em; }
                .stat-card-val.accent { color: #f97316; }

                /* ── earnings table ── */
                .ledger-table-wrap { overflow-x: auto; margin-bottom: 16px; }
                .ledger-table { width: 100%; border-collapse: collapse; border: 1px solid #1c1f28; }
                .ledger-table th { background: #0f1219; font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #444; padding: 10px 14px; text-align: left; border-bottom: 1px solid #1c1f28; }
                .ledger-table td { padding: 10px 14px; border-bottom: 1px solid #131720; font-size: 12px; font-family: 'DM Mono', monospace; color: #888; }
                .ledger-table td.col-name { color: #ccc; font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; }
                .ledger-table td.col-total { color: #3dd68c; font-weight: 600; }
                .ledger-table td.col-tip   { color: #f97316; }

                /* ── CSV btn ── */
                .csv-btn { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 10px 20px; background: transparent; border: 1px solid #2a2f3a; color: #888; cursor: pointer; transition: all .15s; }
                .csv-btn:hover { border-color: #f97316; color: #f97316; }

                /* ── right panel blocks ── */
                .r-block { background: #0c0e13; border: 1px solid #1c1f28; padding: 16px; }
                .r-block-hd { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; letter-spacing: -0.01em; }
                .r-block-hd-sub { font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #444; }

                /* ── liquidity ── */
                .liq-balance-val { font-size: 32px; font-weight: 700; font-family: 'DM Mono', monospace; color: #fff; line-height: 1; margin-bottom: 12px; }
                .cash-out-btn { width: 100%; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 11px; background: #f97316; border: none; color: #000; cursor: pointer; }

                /* ── breakdown rows ── */
                .breakdown-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
                .breakdown-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
                .breakdown-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #888; flex: 1; }
                .breakdown-pct { font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 600; color: #fff; }
                .breakdown-bar-track { flex: 1; height: 3px; background: #1c1f28; border-radius: 2px; overflow: hidden; }
                .breakdown-bar-fill  { height: 100%; border-radius: 2px; }

                /* ── weekly bars ── */
                .week-bars { display: flex; align-items: flex-end; gap: 6px; height: 100px; padding-bottom: 24px; position: relative; }
                .week-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
                .week-bar { width: 100%; background: #1c1f28; border-radius: 2px 2px 0 0; position: relative; overflow: hidden; min-height: 4px; }
                .week-bar-fill { position: absolute; bottom: 0; left: 0; width: 100%; background: #f97316; border-radius: 2px 2px 0 0; transition: height .3s; }
                .week-bar-lbl { font-size: 8px; font-weight: 700; color: #444; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px; }
                .week-bar-amt { font-size: 9px; font-family: 'DM Mono', monospace; color: #666; }

                /* ── tax card ── */
                .tax-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #131720; }
                .tax-row:last-child { border-bottom: none; }
                .tax-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #555; }
                .tax-val { font-family: 'DM Mono', monospace; font-size: 13px; color: #ccc; }
                .tax-val.warn { color: #f97316; }
                .dl-btn { width: 100%; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 9px; background: transparent; border: 1px solid #2a2f3a; color: #555; cursor: pointer; margin-top: 12px; transition: all .15s; }
                .dl-btn:hover { border-color: #f97316; color: #f97316; }

                .widget-wrap { padding: 0 32px; margin-top: 28px; }
                .widget-wrap + .widget-wrap { margin-top: 8px; }

                /* Mobile earnings cards */
                .ledger-mobile-only { display: none; }
                .ledger-mobile-row { background: #0f1219; border: 1px solid #1c1f28; border-radius: 8px; padding: 12px 14px; margin-bottom: 6px; }
                .ledger-mobile-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
                .ledger-mobile-name { font-size: 13px; font-weight: 700; color: #ccc; }
                .ledger-mobile-total { font-size: 15px; font-weight: 800; color: #3dd68c; }
                .ledger-mobile-meta { display: flex; flex-wrap: wrap; gap: 6px; }
                .ledger-mobile-meta span { font-size: 10px; color: #555; background: #141a18; border: 1px solid #1e2420; border-radius: 6px; padding: 2px 8px; font-family: 'DM Mono', monospace; }
                @media (max-width: 768px) {
                    .ledger-left, .ledger-right { padding: 16px; }
                    .section-hd-title { font-size: 26px; }
                    .stat-card-val { font-size: 20px; }
                    .widget-wrap { padding: 0 16px; }
                }
                @media (max-width: 480px) {
                    .section-hd-title { font-size: 22px; }
                    .section-hd-sub { margin-bottom: 16px; }
                    .ledger-left, .ledger-right { padding: 12px; }
                    .stat-cards-row { grid-template-columns: 1fr 1fr; }
                    .ledger-table th, .ledger-table td { padding: 7px 8px; font-size: 11px; }
                    .liq-balance-val { font-size: 24px; }
                    .widget-wrap { padding: 0 12px; margin-top: 16px; }
                    .ledger-desktop-only { display: none; }
                    .ledger-mobile-only { display: block; }
                }
            ` }} />

            {/* ── Predictive Earnings Planner (client widget) ── */}
            <div className="widget-wrap">
                <EarningsPlannerWidget
                    weeklyTotal={weeklyTotal}
                    daysLeft={7 - new Date().getDay() || 7}
                />
            </div>

            {/* ── You vs DoorDash + Mileage Tax Tracker ── */}
            <div className="widget-wrap">
                <EarningsComparisonWidget orders={mockOrders} driver={driver} />
            </div>

            <div className="two-col-ledger">
                {/* ──────────── LEFT ──────────── */}
                <div className="ledger-left">
                    <div className="section-hd-title">Earnings <span>&amp; Settlements</span></div>
                    <div className="section-hd-sub">Your full yield history and payout records</div>

                    {/* 3 stat cards */}
                    <div className="stat-cards-row">
                        <div className="stat-card">
                            <div className="stat-card-lbl">This Week</div>
                            <div className="stat-card-val">${weeklyTotal.toFixed(2)}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-lbl">This Month</div>
                            <div className="stat-card-val">${monthlyTotal.toFixed(2)}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-lbl">All Time</div>
                            <div className="stat-card-val accent">${allTimeTotal.toFixed(2)}</div>
                        </div>
                    </div>

                    {/* Earnings — table on desktop, cards on mobile */}
                    <div className="ledger-table-wrap ledger-desktop-only">
                        <table className="ledger-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Restaurant</th>
                                    <th>Miles</th>
                                    <th>Base</th>
                                    <th>Tip</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_ROWS.map((row, i) => (
                                    <tr key={i}>
                                        <td>{row.date}</td>
                                        <td className="col-name">{row.restaurant}</td>
                                        <td>{row.miles.toFixed(1)}</td>
                                        <td>${row.base.toFixed(2)}</td>
                                        <td className="col-tip">${row.tip.toFixed(2)}</td>
                                        <td className="col-total">${row.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="ledger-mobile-only">
                        {MOCK_ROWS.map((row, i) => (
                            <div key={i} className="ledger-mobile-row">
                                <div className="ledger-mobile-top">
                                    <span className="ledger-mobile-name">{row.restaurant}</span>
                                    <span className="ledger-mobile-total">${row.total.toFixed(2)}</span>
                                </div>
                                <div className="ledger-mobile-meta">
                                    <span>{row.date}</span>
                                    <span>{row.miles.toFixed(1)} mi</span>
                                    <span>Base ${row.base.toFixed(2)}</span>
                                    <span className="col-tip">Tip ${row.tip.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="csv-btn">⬇ Download CSV</button>
                </div>

                {/* ──────────── RIGHT ──────────── */}
                <div className="ledger-right">
                    {/* Balance / Cash Out */}
                    <div className="r-block">
                        <div className="r-block-hd">
                            Liquid Balance
                            <span style={{
                                fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                                padding: "3px 8px", background: "#1a1200", color: "#f97316", border: "1px solid #3a2800",
                            }}>
                                Ready
                            </span>
                        </div>

                        {/* Tip transparency banner */}
                        <div style={{
                            display: "flex", alignItems: "flex-start", gap: 10,
                            background: "rgba(77,202,128,0.06)", border: "1px solid rgba(77,202,128,0.18)",
                            borderRadius: 8, padding: "10px 12px", marginBottom: 14,
                        }}>
                            <span style={{ fontSize: 16, flexShrink: 0 }}></span>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 800, color: "#4dca80", marginBottom: 2 }}>
                                    TrueServe takes 0% of your tips. Always.
                                </div>
                                <div style={{ fontSize: 10, color: "#555", lineHeight: 1.5 }}>
                                    Every dollar customers tip goes directly to you.
                                </div>
                            </div>
                        </div>

                        <div style={{ fontSize: 9, fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                            Available
                        </div>
                        <div className="liq-balance-val">${balance.toFixed(2)}</div>
                        <button className="cash-out-btn">Cash Out Funds</button>
                    </div>

                    {/* Earnings breakdown */}
                    <div className="r-block">
                        <div className="r-block-hd">Earnings Breakdown</div>

                        {[
                            { label: "Base Pay",  pct: basePct,  color: "#3dd68c" },
                            { label: "Tips",       pct: tipPct,   color: "#f97316" },
                            { label: "Bonuses",    pct: bonusPct, color: "#60a5fa" },
                        ].map(({ label, pct, color }) => (
                            <div key={label} className="breakdown-row">
                                <div className="breakdown-dot" style={{ background: color }} />
                                <div className="breakdown-label">{label}</div>
                                <div className="breakdown-bar-track">
                                    <div className="breakdown-bar-fill" style={{ width: `${pct}%`, background: color }} />
                                </div>
                                <div className="breakdown-pct">{pct}%</div>
                            </div>
                        ))}
                    </div>

                    {/* Weekly bar chart */}
                    <div className="r-block">
                        <div className="r-block-hd">
                            Weekly Earnings
                            <span className="r-block-hd-sub">Mon – Sun</span>
                        </div>
                        <div className="week-bars">
                            {WEEK_DAYS.map(({ day, amount }) => {
                                const heightPct = Math.round((amount / MAX_DAY) * 100);
                                return (
                                    <div key={day} className="week-bar-wrap">
                                        <div className="week-bar-amt">${amount.toFixed(0)}</div>
                                        <div className="week-bar" style={{ height: "60px" }}>
                                            <div
                                                className="week-bar-fill"
                                                style={{ height: `${heightPct}%`, opacity: amount === MAX_DAY ? 1 : 0.6 }}
                                            />
                                        </div>
                                        <div className="week-bar-lbl">{day}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tax summary */}
                    <div className="r-block">
                        <div className="r-block-hd">Tax Summary</div>
                        <div className="tax-row">
                            <span className="tax-lbl">Est. YTD Earnings</span>
                            <span className="tax-val">${ytdEst.toFixed(2)}</span>
                        </div>
                        <div className="tax-row">
                            <span className="tax-lbl">Est. Tax Set-Aside (25%)</span>
                            <span className="tax-val warn">${taxAside.toFixed(2)}</span>
                        </div>
                        <div className="tax-row">
                            <span className="tax-lbl">Filing Status</span>
                            <span className="tax-val">1099-NEC</span>
                        </div>
                        <button className="dl-btn">⬇ Download 1099 (UI only)</button>
                    </div>

                    {/* Mileage & Tax Tracker */}
                    <MileageTracker driverId={driver.id} />
                </div>
            </div>
        </div>
    );
}
