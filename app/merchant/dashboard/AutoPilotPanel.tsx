"use client";

import { useState } from "react";
import { Gauge, PauseCircle, ShieldCheck } from "lucide-react";
import { updateAutoPilotSettings } from "../actions";

interface AutoPilotPanelProps {
    restaurantId: string;
    autoPilotEnabled: boolean;
    capacityThreshold: number;
}

export default function AutoPilotPanel({ restaurantId, autoPilotEnabled, capacityThreshold }: AutoPilotPanelProps) {
    const [enabled, setEnabled] = useState(autoPilotEnabled);
    const [threshold, setThreshold] = useState(capacityThreshold);

    const handleToggle = async () => {
        const next = !enabled;
        setEnabled(next);
        await updateAutoPilotSettings(restaurantId, next, threshold);
    };

    return (
        <>
            <style>{`
                .ap-panel {
                    background: linear-gradient(180deg, #111713 0%, #0d110f 100%);
                    border: 1px solid #202a24;
                    border-radius: 14px;
                    padding: 18px;
                    min-height: 100%;
                    box-shadow: 0 16px 40px rgba(0,0,0,.18);
                }
                .ap-hd { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
                .ap-title-row { display: flex; align-items: flex-start; gap: 12px; color: #f2f5f3; }
                .ap-icon {
                    width: 40px; height: 40px; border-radius: 10px; background: rgba(249,115,22,.1); border: 1px solid rgba(249,115,22,.24);
                    display: flex; align-items: center; justify-content: center;
                    color: #f97316; flex-shrink: 0;
                }
                .ap-kicker {
                    margin: 0 0 4px;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: .14em;
                    text-transform: uppercase;
                    color: #7d867f;
                }
                .ap-title {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 900;
                    letter-spacing: -0.01em;
                    color: #fff;
                }
                .ap-toggle {
                    width: 48px; height: 28px; background: #222923; border-radius: 999px;
                    position: relative; cursor: pointer; border: none; padding: 0; flex-shrink: 0;
                    transition: background 0.15s, box-shadow 0.15s;
                }
                .ap-toggle.on { background: rgba(249,115,22,0.92); box-shadow: 0 0 0 3px rgba(249,115,22,.12); }
                .ap-knob {
                    width: 22px; height: 22px; background: #8b928d; border-radius: 999px;
                    position: absolute; top: 3px; left: 3px; transition: left 0.15s, background 0.15s;
                }
                .ap-toggle.on .ap-knob { left: 23px; background: #071009; }
                .ap-desc { font-size: 13px; color: #a3aca6; line-height: 1.55; margin: 0 0 16px; max-width: 680px; }
                .ap-status-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 10px;
                }
                .ap-stat {
                    border: 1px solid #202a24;
                    border-radius: 12px;
                    background: rgba(255,255,255,.025);
                    padding: 13px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    min-width: 0;
                }
                .ap-stat-icon { color: #f97316; flex-shrink: 0; }
                .ap-stat-label { font-size: 10px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; color: #7d867f; margin-bottom: 3px; }
                .ap-stat-value { font-size: 14px; font-weight: 900; color: #f6f7f5; }
                @media (max-width: 680px) {
                    .ap-panel { padding: 16px; }
                    .ap-hd { align-items: center; }
                    .ap-status-grid { grid-template-columns: 1fr; }
                }
            `}</style>
            <div className="ap-panel">
                <div className="ap-hd">
                    <div className="ap-title-row">
                        <div className="ap-icon">
                            <Gauge size={19} />
                        </div>
                        <div>
                            <p className="ap-kicker">Kitchen pacing</p>
                            <h2 className="ap-title">Smart pause control</h2>
                        </div>
                    </div>
                    <button className={`ap-toggle${enabled ? " on" : ""}`} onClick={handleToggle} aria-label="Toggle AI Auto-Pilot">
                        <div className="ap-knob"></div>
                    </button>
                </div>
                <p className="ap-desc">
                    TrueServe watches active order volume and can pause new orders briefly when the kitchen reaches its limit.
                </p>
                <div className="ap-status-grid">
                    <div className="ap-stat">
                        <ShieldCheck className="ap-stat-icon" size={18} />
                        <div>
                            <div className="ap-stat-label">Mode</div>
                            <div className="ap-stat-value">{enabled ? "Monitoring active" : "Manual control"}</div>
                        </div>
                    </div>
                    <div className="ap-stat">
                        <PauseCircle className="ap-stat-icon" size={18} />
                        <div>
                            <div className="ap-stat-label">Pause trigger</div>
                            <div className="ap-stat-value">{threshold} active orders</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
