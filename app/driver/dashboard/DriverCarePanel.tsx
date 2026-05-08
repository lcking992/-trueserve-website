import Link from "next/link";
import { AlertTriangle, Clock3, Gauge, HeartHandshake, LifeBuoy, ShieldCheck, TrendingUp, WalletCards } from "lucide-react";

type DriverCarePanelProps = {
    balance: number;
    totalEarnings: number;
    trips: number;
    rating: number;
    activeOrder?: any | null;
    availableCount: number;
};

export default function DriverCarePanel({
    balance,
    totalEarnings,
    trips,
    rating,
    activeOrder,
    availableCount,
}: DriverCarePanelProps) {
    const goal = 100;
    const progress = Math.min(100, Math.round((totalEarnings / goal) * 100));
    const activePay = Number(activeOrder?.totalPay || activeOrder?.total || 0);
    const activeDistance = Number(activeOrder?.distance || 2.4);
    const perMile = activePay > 0 ? activePay / Math.max(activeDistance, 0.1) : 0;

    const careItems = [
        {
            icon: WalletCards,
            label: "Pay clarity",
            value: "Shown before accept",
            tone: "#3dd68c",
        },
        {
            icon: Clock3,
            label: "Wait protection",
            value: "Timer starts at pickup",
            tone: "#f97316",
        },
        {
            icon: ShieldCheck,
            label: "Fair scorecard",
            value: "Merchant delays excluded",
            tone: "#5bcfd4",
        },
    ];

    return (
        <>
            <style>{`
                .driver-care-shell {
                    display: grid;
                    grid-template-columns: minmax(0, 1.15fr) minmax(260px, .85fr);
                    gap: 12px;
                    margin-bottom: 16px;
                }
                .driver-care-card {
                    background: linear-gradient(180deg, #111713 0%, #0d110f 100%);
                    border: 1px solid #202a24;
                    border-radius: 14px;
                    padding: 16px;
                    box-shadow: 0 18px 44px rgba(0,0,0,.18);
                }
                .driver-care-kicker {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    color: #f97316;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: .14em;
                    text-transform: uppercase;
                    margin-bottom: 10px;
                }
                .driver-care-title {
                    margin: 0 0 8px;
                    color: #fff;
                    font-size: 24px;
                    line-height: 1.05;
                    font-weight: 950;
                    letter-spacing: -.02em;
                }
                .driver-care-copy {
                    color: #a5aea8;
                    font-size: 12px;
                    line-height: 1.55;
                    max-width: 720px;
                    margin-bottom: 14px;
                }
                .driver-care-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 8px;
                    margin-bottom: 14px;
                }
                .driver-care-mini {
                    background: rgba(255,255,255,.025);
                    border: 1px solid #202a24;
                    border-radius: 11px;
                    padding: 11px;
                    min-width: 0;
                }
                .driver-care-mini-top {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    color: #dce3df;
                    font-size: 11px;
                    font-weight: 900;
                    margin-bottom: 5px;
                }
                .driver-care-mini-value {
                    color: #8e9993;
                    font-size: 11px;
                    line-height: 1.4;
                    font-weight: 700;
                }
                .driver-care-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .driver-care-btn {
                    min-height: 38px;
                    border-radius: 9px;
                    padding: 0 13px;
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: .1em;
                    text-transform: uppercase;
                    text-decoration: none;
                    border: 1px solid #28342d;
                    color: #d7dfda;
                    background: rgba(255,255,255,.04);
                }
                .driver-care-btn.primary {
                    background: #f97316;
                    color: #071009;
                    border-color: #f97316;
                }
                .driver-care-stat-list {
                    display: grid;
                    gap: 8px;
                }
                .driver-care-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    border: 1px solid #202a24;
                    background: rgba(255,255,255,.025);
                    border-radius: 11px;
                    padding: 11px;
                }
                .driver-care-row span {
                    color: #8e9993;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: .11em;
                    text-transform: uppercase;
                }
                .driver-care-row strong {
                    color: #fff;
                    font-size: 15px;
                    font-weight: 950;
                    text-align: right;
                }
                .driver-goal-bar {
                    height: 7px;
                    overflow: hidden;
                    border-radius: 999px;
                    background: rgba(255,255,255,.08);
                    margin: 8px 0 2px;
                }
                .driver-goal-fill {
                    height: 100%;
                    width: var(--goal);
                    border-radius: inherit;
                    background: linear-gradient(90deg, #f97316, #3dd68c);
                }
                @media (max-width: 980px) {
                    .driver-care-shell {
                        grid-template-columns: 1fr;
                    }
                }
                @media (max-width: 680px) {
                    .driver-care-grid {
                        grid-template-columns: 1fr;
                    }
                    .driver-care-btn {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
            <section className="driver-care-shell" aria-label="Driver care center">
                <div className="driver-care-card">
                    <div className="driver-care-kicker"><HeartHandshake size={14} /> Driver Care Promise</div>
                    <h2 className="driver-care-title">Clarity before the route. Protection during the wait.</h2>
                    <p className="driver-care-copy">
                        TrueServe shows the money, mileage, wait expectations, and support path before drivers commit.
                        If a restaurant delay or unsafe issue happens, the route can be reviewed without blaming the driver.
                    </p>
                    <div className="driver-care-grid">
                        {careItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.label} className="driver-care-mini">
                                    <div className="driver-care-mini-top">
                                        <Icon size={15} color={item.tone} />
                                        {item.label}
                                    </div>
                                    <div className="driver-care-mini-value">{item.value}</div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="driver-care-actions">
                        <Link href="/driver/dashboard/help" className="driver-care-btn primary">
                            <LifeBuoy size={14} /> Care center
                        </Link>
                        <Link href="/driver/dashboard/disputes" className="driver-care-btn">
                            <AlertTriangle size={14} /> Report issue
                        </Link>
                        <Link href="/driver/dashboard/earnings" className="driver-care-btn">
                            <TrendingUp size={14} /> Earnings plan
                        </Link>
                    </div>
                </div>

                <div className="driver-care-card">
                    <div className="driver-care-kicker"><Gauge size={14} /> Today’s Driver View</div>
                    <div className="driver-care-stat-list">
                        <div className="driver-care-row">
                            <span>Daily goal</span>
                            <strong>${totalEarnings.toFixed(0)} / ${goal}</strong>
                        </div>
                        <div className="driver-goal-bar" style={{ "--goal": `${progress}%` } as any}>
                            <div className="driver-goal-fill" />
                        </div>
                        <div className="driver-care-row">
                            <span>Available balance</span>
                            <strong>${balance.toFixed(2)}</strong>
                        </div>
                        <div className="driver-care-row">
                            <span>Route quality</span>
                            <strong>{activeOrder ? `$${perMile.toFixed(2)}/mi` : `${availableCount} open`}</strong>
                        </div>
                        <div className="driver-care-row">
                            <span>Fair score</span>
                            <strong>{rating > 0 ? `${rating.toFixed(1)} · ${trips} trips` : "New driver"}</strong>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
