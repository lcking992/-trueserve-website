"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getComplianceHelp } from "@/lib/complianceHelpBot";
import ChatBot from "@/components/ChatBot";
import type { BotMessage, ComplianceContext } from "@/lib/complianceHelpBot";

type DriverComplianceSnapshot = {
    id: string;
    name: string;
    complianceScore: number;
    complianceStatus: string;
    lastComplianceAttestationAt?: string | null;
    trainingStatus: string;
    bagSanitationAcknowledged: boolean;
    temperatureControlAcknowledged: boolean;
    foodSafetyTrainingComplete: boolean;
    notes?: string;
};

type AttestationRecord = {
    id: string;
    checklistType: string;
    status: string;
    score?: number | null;
    completedAt?: string | null;
};

export default function DriverComplianceClient({
    driver,
    attestations,
}: {
    driver: DriverComplianceSnapshot;
    attestations: AttestationRecord[];
}) {
    const router = useRouter();
    const [trainingComplete, setTrainingComplete] = useState(driver.foodSafetyTrainingComplete);
    const [bagAck, setBagAck] = useState(driver.bagSanitationAcknowledged);
    const [tempAck, setTempAck] = useState(driver.temperatureControlAcknowledged);
    const [notes, setNotes] = useState(driver.notes || "");
    const [message, setMessage] = useState("");
    const [messageOk, setMessageOk] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [chatOpen, setChatOpen] = useState(false);

    const handleBotMessage = async (userMessage: string): Promise<BotMessage> => {
        return getComplianceHelp(userMessage, {
            userType: 'DRIVER',
            complianceScore: driver.complianceScore,
            complianceStatus: driver.complianceStatus,
            incompleteItems: [
                !trainingComplete && 'Food Safety Training',
                !bagAck && 'Bag Sanitation',
                !tempAck && 'Temperature Control',
            ].filter(Boolean) as string[],
        } as ComplianceContext);
    };

    const estimatedScore = useMemo(() => {
        let score = 0;
        if (trainingComplete) score += 40;
        if (bagAck) score += 30;
        if (tempAck) score += 30;
        return score;
    }, [bagAck, tempAck, trainingComplete]);

    function submitAttestation() {
        startTransition(async () => {
            setMessage("");
            const response = await fetch(`/api/compliance/drivers/${driver.id}/attestations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    checklistType: "driver_attestation",
                    trainingStatus: trainingComplete ? "ACTIVE" : "PENDING",
                    foodSafetyTrainingComplete: trainingComplete,
                    bagSanitationAcknowledged: bagAck,
                    temperatureControlAcknowledged: tempAck,
                    notes,
                    score: estimatedScore,
                }),
            });

            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                setMessageOk(false);
                setMessage(result?.error || "Unable to save attestation.");
                return;
            }
            setMessageOk(true);
            setMessage("Compliance attestation saved.");
            router.refresh();
        });
    }

    const checklistItems = [
        { key: "training", label: "Food safety training complete",       helper: "Confirms you've reviewed the pilot safety standards.",        checked: trainingComplete, onChange: setTrainingComplete },
        { key: "bag",      label: "Delivery bag sanitation acknowledged", helper: "Shows your bag or container is clean and ready.",             checked: bagAck,           onChange: setBagAck },
        { key: "temp",     label: "Temperature control acknowledged",     helper: "Confirms you'll keep food hot/cold as instructed.",           checked: tempAck,          onChange: setTempAck },
    ];

    const allChecked = trainingComplete && bagAck && tempAck;

    return (
        <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            <style dangerouslySetInnerHTML={{ __html: `
                .comp-wrap { max-width: 860px; }
                .comp-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
                .comp-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.02em; }
                .comp-title span { color: #f97316; }
                .comp-status-badge {
                    font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.16em;
                    padding: 5px 12px; border-radius: 6px;
                }
                .comp-status-badge.active  { background: rgba(62,207,110,0.1); border: 1px solid rgba(62,207,110,0.25); color: #3ecf6e; }
                .comp-status-badge.pending { background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.25); color: #f97316; }
                .comp-status-badge.flagged { background: rgba(232,64,64,0.1);  border: 1px solid rgba(232,64,64,0.25);  color: #e84040; }

                /* Score bar */
                .comp-score-wrap { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; padding: 18px 20px; margin-bottom: 14px; }
                .comp-score-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
                .comp-score-label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.16em; color: #555; }
                .comp-score-val { font-size: 28px; font-weight: 900; color: #fff; letter-spacing: -0.03em; }
                .comp-score-val span { font-size: 14px; color: #555; font-weight: 600; }
                .comp-bar-bg { height: 6px; background: rgba(255,255,255,0.06); border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.04); }
                .comp-bar-fill { height: 100%; border-radius: 6px; transition: width 0.6s ease-out; }

                /* Stats row */
                .comp-stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 14px; }
                @media (max-width: 600px) { .comp-stats-row { grid-template-columns: 1fr 1fr; } }
                @media (max-width: 400px) { .comp-stats-row { grid-template-columns: 1fr; } }
                .comp-stat { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; padding: 14px 14px; }
                .comp-stat-lbl { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.14em; color: #555; margin-bottom: 6px; }
                .comp-stat-val { font-size: 18px; font-weight: 800; color: #fff; }

                /* Layout */
                .comp-grid { display: grid; grid-template-columns: 1fr 260px; gap: 12px; }
                @media (max-width: 800px) { .comp-grid { grid-template-columns: 1fr; } }

                /* Checklist */
                .comp-card { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; overflow: hidden; margin-bottom: 12px; }
                .comp-card-hd { padding: 12px 16px; border-bottom: 1px solid #1e2420; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.16em; color: #f97316; }
                .comp-check-row {
                    display: flex; align-items: flex-start; gap: 14px;
                    padding: 14px 16px; border-bottom: 1px solid #131720;
                    cursor: pointer; transition: background 0.12s;
                }
                .comp-check-row:last-child { border-bottom: none; }
                .comp-check-row:hover { background: rgba(255,255,255,0.02); }
                .comp-check-row.checked { background: rgba(62,207,110,0.04); }
                .comp-checkbox {
                    width: 18px; height: 18px; border-radius: 4px; flex-shrink: 0; margin-top: 2px;
                    border: 1.5px solid #333; background: #0f1210; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.12s;
                }
                .comp-checkbox.checked { background: #3ecf6e; border-color: #3ecf6e; }
                .comp-check-label { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 3px; }
                .comp-check-helper { font-size: 11px; color: #555; line-height: 1.5; }

                /* Notes */
                .comp-textarea {
                    width: 100%; background: #0f1210; border: 1px solid #1e2420;
                    border-radius: 6px; padding: 12px 14px; font-size: 13px; color: #ccc;
                    resize: vertical; outline: none; font-family: inherit;
                    transition: border-color 0.15s;
                }
                .comp-textarea:focus { border-color: rgba(249,115,22,0.4); }
                .comp-textarea::placeholder { color: #444; }

                /* Submit */
                .comp-submit-btn {
                    width: 100%; background: #f97316; color: #000; border: none;
                    border-radius: 8px; padding: 12px; font-size: 11px; font-weight: 800;
                    text-transform: uppercase; letter-spacing: 0.14em; cursor: pointer;
                    font-family: inherit; transition: background 0.15s;
                }
                .comp-submit-btn:hover:not(:disabled) { background: #ea6c10; }
                .comp-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                /* Message */
                .comp-msg { padding: 10px 14px; border-radius: 6px; font-size: 11px; font-weight: 700; margin-top: 10px; }
                .comp-msg.ok  { background: rgba(62,207,110,0.08); border: 1px solid rgba(62,207,110,0.2); color: #3ecf6e; }
                .comp-msg.err { background: rgba(232,64,64,0.08);  border: 1px solid rgba(232,64,64,0.2);  color: #e84040; }

                /* Right panel */
                .comp-right-card { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; overflow: hidden; margin-bottom: 12px; }
                .comp-right-hd { padding: 12px 16px; border-bottom: 1px solid #1e2420; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.14em; color: #777; }
                .comp-right-body { padding: 14px 16px; }
                .comp-attest-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; border-bottom: 1px solid #131720; gap: 12px; }
                .comp-attest-row:last-child { border-bottom: none; }

                /* Chat */
                .comp-chat-toggle {
                    width: 100%; background: transparent; border: 1px solid #1e2420;
                    border-radius: 8px; padding: 11px 16px; font-size: 11px; font-weight: 800;
                    text-transform: uppercase; letter-spacing: 0.12em; color: #666;
                    cursor: pointer; font-family: inherit; transition: all 0.15s; margin-bottom: 12px;
                }
                .comp-chat-toggle:hover { color: #f97316; border-color: rgba(249,115,22,0.35); background: rgba(249,115,22,0.05); }
                .comp-chat-wrap { border: 1px solid #1e2420; border-radius: 8px; overflow: hidden; height: 420px; max-height: 70vh; margin-bottom: 12px; background: #0b0f17; box-shadow: 0 18px 44px rgba(0,0,0,0.28); }

                @media (max-width: 767px) {
                    .comp-wrap { padding-bottom: 0; }
                }
                @media (max-width: 640px) {
                    .comp-title { font-size: 22px; margin-bottom: 14px; }
                    .comp-card { padding: 14px 14px; }
                    .comp-section-title { font-size: 13px; }
                    .comp-chat-wrap { height: 320px; }
                }
            ` }} />

            <div className="comp-wrap">
                {/* Header */}
                <div className="comp-header">
                    <div className="comp-title">Driver <span>Compliance</span></div>
                    <span className={`comp-status-badge ${driver.complianceStatus === 'ACTIVE' ? 'active' : driver.complianceStatus === 'FLAGGED' ? 'flagged' : 'pending'}`}>
                        {driver.complianceStatus}
                    </span>
                </div>

                {/* Score bar */}
                <div className="comp-score-wrap">
                    <div className="comp-score-row">
                        <div>
                            <div className="comp-score-label">Compliance Score</div>
                            <div className="comp-score-val">{estimatedScore}<span>/100</span></div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div className="comp-score-label">Driver</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#ccc', marginTop: 4 }}>{driver.name}</div>
                        </div>
                    </div>
                    <div className="comp-bar-bg">
                        <div
                            className="comp-bar-fill"
                            style={{
                                width: `${estimatedScore}%`,
                                background: estimatedScore >= 80 ? '#3ecf6e' : estimatedScore >= 50 ? '#f97316' : '#e84040',
                                boxShadow: estimatedScore >= 80 ? '0 0 8px rgba(62,207,110,0.4)' : '0 0 8px rgba(249,115,22,0.4)',
                            }}
                        />
                    </div>
                </div>

                {/* 3 stat tiles */}
                <div className="comp-stats-row">
                    {[
                        { label: 'Estimated Score', value: `${estimatedScore}/100` },
                        { label: 'Last Attestation', value: driver.lastComplianceAttestationAt ? new Date(driver.lastComplianceAttestationAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—' },
                        { label: 'Training', value: trainingComplete ? 'Complete' : 'Pending' },
                    ].map(s => (
                        <div key={s.label} className="comp-stat">
                            <div className="comp-stat-lbl">{s.label}</div>
                            <div className="comp-stat-val" style={{ color: s.label === 'Training' ? (trainingComplete ? '#3ecf6e' : '#f97316') : '#fff' }}>
                                {s.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main 2-col grid */}
                <div className="comp-grid">
                    {/* Left: checklist + notes */}
                    <div>
                        <div className="comp-card">
                            <div className="comp-card-hd">Compliance Checklist</div>
                            {checklistItems.map((item) => (
                                <label key={item.key} className={`comp-check-row${item.checked ? ' checked' : ''}`}>
                                    <div className={`comp-checkbox${item.checked ? ' checked' : ''}`}>
                                        {item.checked && (
                                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                <path d="M1 4L3.5 6.5L9 1" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        )}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={item.checked}
                                        onChange={e => item.onChange(e.target.checked)}
                                        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                                    />
                                    <div>
                                        <div className="comp-check-label">{item.label}</div>
                                        <div className="comp-check-helper">{item.helper}</div>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <div className="comp-card">
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e2420', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#777' }}>Notes</span>
                                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#444' }}>Optional</span>
                            </div>
                            <div style={{ padding: '12px 16px' }}>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Optional notes for the compliance record"
                                    rows={4}
                                    className="comp-textarea"
                                />
                            </div>
                        </div>

                        {message && (
                            <div className={`comp-msg ${messageOk ? 'ok' : 'err'}`}>
                                {messageOk ? 'Saved: ' : 'Issue: '}{message}
                            </div>
                        )}
                    </div>

                    {/* Right: submit + history */}
                    <div>
                        <div className="comp-right-card">
                            <div className="comp-right-hd">Submission Status</div>
                            <div className="comp-right-body">
                                <p style={{ fontSize: 11, color: '#555', lineHeight: 1.6, marginBottom: 14 }}>
                                    Submitting updates your compliance score and notifies dispatch of your readiness.
                                </p>
                                {allChecked ? (
                                    <div style={{ fontSize: 10, color: '#3ecf6e', fontWeight: 700, marginBottom: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                        All items checked — ready to submit
                                    </div>
                                ) : (
                                    <div style={{ fontSize: 10, color: '#f97316', fontWeight: 700, marginBottom: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                        {3 - [trainingComplete, bagAck, tempAck].filter(Boolean).length} item(s) remaining
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={submitAttestation}
                                    disabled={isPending}
                                    className="comp-submit-btn"
                                >
                                    {isPending ? 'Saving…' : 'Save Attestation'}
                                </button>
                            </div>
                        </div>

                        <div className="comp-right-card">
                            <div className="comp-right-hd">Recent Attestations</div>
                            {attestations.length === 0 ? (
                                <div style={{ padding: '18px 16px', fontSize: 11, color: '#444', fontStyle: 'italic' }}>
                                    No attestation history yet.
                                </div>
                            ) : (
                                attestations.slice(0, 5).map(entry => (
                                    <div key={entry.id} className="comp-attest-row">
                                        <div>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: '#ccc', marginBottom: 2 }}>
                                                {entry.checklistType}
                                            </div>
                                            <div style={{ fontSize: 10, color: '#555' }}>
                                                {entry.status} · {entry.completedAt ? new Date(entry.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : 'No date'}
                                            </div>
                                        </div>
                                        <span style={{
                                            fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6,
                                            background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: '#f97316',
                                            flexShrink: 0,
                                        }}>
                                            {entry.score ?? 0}/100
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* AI Help toggle */}
                <button className="comp-chat-toggle" onClick={() => setChatOpen(!chatOpen)}>
                    {chatOpen ? '× Close Compliance Help' : 'Ask Compliance Assistant'}
                </button>
                {chatOpen && (
                    <div className="comp-chat-wrap">
                        <ChatBot
                            title="Compliance Help"
                            placeholder="Ask about food safety, bag sanitation, temperature control…"
                            onSendMessage={handleBotMessage}
                            initialMessage="Hi! I'm your compliance assistant. Ask me about food safety training, bag sanitation, temperature control, or anything else to help you pass compliance checks."
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
