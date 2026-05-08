import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, ExternalLink, Link2, QrCode, Rocket, Store } from "lucide-react";

type LaunchCenterProps = {
    restaurantName: string;
    storefrontUrl: string;
    storefrontPath: string;
    readyItems: Array<{
        label: string;
        done: boolean;
    }>;
};

export default function LaunchCenter({
    restaurantName,
    storefrontUrl,
    storefrontPath,
    readyItems,
}: LaunchCenterProps) {
    const completed = readyItems.filter((item) => item.done).length;
    const total = readyItems.length || 1;
    const score = Math.round((completed / total) * 100);
    const qrUrl = `/api/qr?size=220&data=${encodeURIComponent(storefrontUrl)}`;

    return (
        <>
            <style>{`
                .launch-center {
                    display: grid;
                    grid-template-columns: minmax(0, 1.25fr) minmax(220px, .75fr);
                    gap: 12px;
                    margin-bottom: 14px;
                }
                .launch-card {
                    background: linear-gradient(180deg, #111713 0%, #0d110f 100%);
                    border: 1px solid #202a24;
                    border-radius: 14px;
                    padding: 16px;
                    box-shadow: 0 18px 44px rgba(0,0,0,.18);
                }
                .launch-topline {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    margin-bottom: 14px;
                }
                .launch-kicker {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    color: #f97316;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: .14em;
                    text-transform: uppercase;
                }
                .launch-score {
                    color: #3dd68c;
                    background: rgba(61,214,140,.09);
                    border: 1px solid rgba(61,214,140,.22);
                    border-radius: 999px;
                    padding: 6px 10px;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: .12em;
                    text-transform: uppercase;
                    white-space: nowrap;
                }
                .launch-title {
                    margin: 0 0 8px;
                    color: #fff;
                    font-size: 24px;
                    line-height: 1.05;
                    font-weight: 900;
                    letter-spacing: -.02em;
                }
                .launch-copy {
                    color: #a5aea8;
                    font-size: 12px;
                    line-height: 1.55;
                    max-width: 660px;
                    margin-bottom: 14px;
                }
                .launch-readiness {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 8px;
                    margin-bottom: 14px;
                }
                .launch-ready-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255,255,255,.025);
                    border: 1px solid #202a24;
                    border-radius: 10px;
                    padding: 10px;
                    color: #dce3df;
                    font-size: 11px;
                    font-weight: 800;
                    min-width: 0;
                }
                .launch-ready-item.pending {
                    color: #9ea6a1;
                }
                .launch-ready-item svg {
                    flex-shrink: 0;
                }
                .launch-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .launch-btn {
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
                .launch-btn.primary {
                    background: #f97316;
                    color: #071009;
                    border-color: #f97316;
                }
                .launch-qr-card {
                    display: grid;
                    gap: 12px;
                    align-content: start;
                }
                .launch-qr-box {
                    background: #fff;
                    border-radius: 12px;
                    padding: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 178px;
                }
                .launch-url {
                    background: #0b0f0d;
                    border: 1px solid #202a24;
                    border-radius: 10px;
                    padding: 10px;
                    color: #f97316;
                    font-size: 11px;
                    line-height: 1.45;
                    word-break: break-word;
                    font-weight: 800;
                }
                @media (max-width: 980px) {
                    .launch-center {
                        grid-template-columns: 1fr;
                    }
                    .launch-readiness {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }
                @media (max-width: 640px) {
                    .launch-topline {
                        align-items: flex-start;
                        flex-direction: column;
                    }
                    .launch-readiness {
                        grid-template-columns: 1fr;
                    }
                    .launch-btn {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
            <section className="launch-center" aria-label="Merchant launch center">
                <div className="launch-card">
                    <div className="launch-topline">
                        <div className="launch-kicker"><Rocket size={14} /> Launch Center</div>
                        <div className="launch-score">{score}% ready</div>
                    </div>
                    <h2 className="launch-title">Get {restaurantName} ready to take direct orders.</h2>
                    <p className="launch-copy">
                        Use this as the restaurant's launch command center: payout setup, menu readiness,
                        hours, storefront assets, and the direct ordering link all in one place.
                    </p>
                    <div className="launch-readiness">
                        {readyItems.map((item) => (
                            <div key={item.label} className={`launch-ready-item${item.done ? "" : " pending"}`}>
                                {item.done ? <CheckCircle2 size={15} color="#3dd68c" /> : <Clock3 size={15} color="#f97316" />}
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="launch-actions">
                        <Link href="/merchant/dashboard/storefront" className="launch-btn primary">
                            Marketing kit <ArrowRight size={14} />
                        </Link>
                        <Link href="/merchant/dashboard/integrations" className="launch-btn">
                            POS setup <Link2 size={14} />
                        </Link>
                        <Link href={storefrontPath} target="_blank" className="launch-btn">
                            View storefront <ExternalLink size={14} />
                        </Link>
                    </div>
                </div>

                <div className="launch-card launch-qr-card">
                    <div className="launch-kicker"><QrCode size={14} /> Counter QR</div>
                    <div className="launch-qr-box">
                        <img src={qrUrl} alt={`${restaurantName} direct ordering QR code`} width={150} height={150} />
                    </div>
                    <div className="launch-url">
                        <Store size={13} style={{ display: "inline", marginRight: 6, verticalAlign: -2 }} />
                        {storefrontUrl}
                    </div>
                </div>
            </section>
        </>
    );
}
