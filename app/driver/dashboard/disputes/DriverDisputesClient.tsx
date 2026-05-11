'use client';

import { useState } from 'react';

type Urgency = 'LOW' | 'HIGH';
type DisputeStatus = 'OPEN' | 'RESOLVED';

interface PastDispute {
    id: string;
    date: string;
    issueType: string;
    status: DisputeStatus;
    description: string;
    urgency: Urgency;
}

interface Props {
    driverName: string;
    pastDisputes: PastDispute[];
}

const ISSUE_TYPES = [
    'Restaurant closed when arrived',
    'Customer unreachable',
    'Wrong address',
    'Order not ready',
    'Food quality issue',
    'Payment problem',
    'Other',
];

export default function DriverDisputesClient({ driverName, pastDisputes }: Props) {
    const [issueType, setIssueType] = useState('');
    const [orderId, setOrderId]     = useState('');
    const [description, setDescription] = useState('');
    const [urgency, setUrgency]     = useState<Urgency>('LOW');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading]     = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!description.trim() || !issueType) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
        }, 900);
    }

    function handleReset() {
        setIssueType('');
        setOrderId('');
        setDescription('');
        setUrgency('LOW');
        setSubmitted(false);
    }

    return (
        <div style={{ fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
            <style dangerouslySetInnerHTML={{ __html: `
                /* ── page heading ── */
                .disp-title { font-size: 36px; font-weight: 700; color: #fff; letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 6px; }
                .disp-title span { color: #f97316; }
                .disp-sub { font-size: 10px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: #333; margin-bottom: 32px; display: block; }

                /* ── two-col ── */
                .disp-grid { display: grid; grid-template-columns: 1fr 360px; gap: 24px; }
                @media (max-width: 1024px) { .disp-grid { grid-template-columns: 1fr; } }

                /* ── form card ── */
                .disp-card { background: #0c0e13; border: 1px solid #1c1f28; padding: 24px; }
                .disp-card-title { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 20px; letter-spacing: -0.01em; }

                /* ── form fields ── */
                .form-group { margin-bottom: 16px; }
                .form-label { display: block; font-size: 9px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: #555; margin-bottom: 6px; }
                .form-label span { color: #e24b4a; }
                .form-select, .form-input, .form-textarea {
                    width: 100%; background: #0f1219; border: 1px solid #1c1f28; color: #ccc;
                    font-size: 13px; padding: 10px 12px; outline: none;
                    transition: border-color .15s; font-family: inherit;
                    border-radius: 0;
                }
                .form-select:focus, .form-input:focus, .form-textarea:focus { border-color: #f97316; }
                .form-select option { background: #0f1219; }
                .form-textarea { resize: vertical; min-height: 100px; }
                .form-hint { font-size: 10px; color: #444; margin-top: 4px; }

                /* ── urgency toggle ── */
                .urgency-row { display: flex; gap: 8px; }
                .urgency-btn {
                    flex: 1; padding: 9px; font-size: 11px; font-weight: 800;
                    letter-spacing: 0.1em; text-transform: uppercase;
                    border: 1px solid #1c1f28; background: transparent;
                    color: #555; cursor: pointer; transition: all .15s; font-family: inherit;
                }
                .urgency-btn.low-active  { background: #0d2a1a; border-color: #1a4a2a; color: #3dd68c; }
                .urgency-btn.high-active { background: #2a0d0d; border-color: #4a1a1a; color: #e24b4a; }

                /* ── submit btn ── */
                .submit-btn {
                    width: 100%; padding: 12px; background: #f97316; border: none;
                    font-size: 12px; font-weight: 800; letter-spacing: 0.12em;
                    text-transform: uppercase; color: #000; cursor: pointer;
                    transition: opacity .15s; font-family: inherit;
                    margin-top: 4px;
                }
                .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .submit-btn:hover:not(:disabled) { opacity: 0.85; }

                /* ── success state ── */
                .success-box { background: rgba(61,214,140,0.06); border: 1px solid rgba(61,214,140,0.2); padding: 28px 24px; text-align: center; }
                .success-icon { font-size: 36px; margin-bottom: 12px; }
                .success-title { font-size: 20px; font-weight: 700; color: #3dd68c; margin-bottom: 6px; letter-spacing: -0.01em; }
                .success-msg { font-size: 12px; color: #666; margin-bottom: 16px; }
                .success-reset { font-size: 10px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #f97316; background: transparent; border: 1px solid rgba(249,115,22,0.3); padding: 8px 16px; cursor: pointer; font-family: inherit; }

                /* ── past disputes ── */
                .past-hd { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 14px; letter-spacing: -0.01em; }
                .dispute-row { background: #0c0e13; border: 1px solid #1c1f28; padding: 14px 16px; margin-bottom: 8px; }
                .dispute-row-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
                .dispute-type { font-size: 12px; font-weight: 700; color: #ccc; }
                .status-badge { font-size: 9px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; padding: 3px 8px; }
                .status-open     { background: #2a0d0d; border: 1px solid #4a1a1a; color: #e24b4a; }
                .status-resolved { background: #0d2a1a; border: 1px solid #1a4a2a; color: #3dd68c; }
                .dispute-desc { font-size: 11px; color: #555; line-height: 1.5; }
                .dispute-meta { display: flex; align-items: center; gap: 12px; margin-top: 8px; }
                .dispute-meta-item { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #333; }
                .urgency-hi { color: #e24b4a; }
                .urgency-lo { color: #3dd68c; }

                /* ── empty state ── */
                .empty-state { background: #080808; border: 1px solid #131720; padding: 36px; text-align: center; font-size: 11px; color: #222; font-style: italic; }

                @media (max-width: 640px) {
                    .disp-title { font-size: 22px; }
                    .disp-sub { margin-bottom: 18px; }
                    .disp-card { padding: 16px; }
                    .disp-card-title { font-size: 15px; margin-bottom: 14px; }
                    .success-box { padding: 20px 16px; }
                }
            ` }} />

            <div className="disp-title">Report <span>an Issue</span></div>
            <div className="disp-sub">Submit a dispute or flag a problem with a delivery</div>

            <div className="disp-grid">
                {/* ── FORM ── */}
                <div>
                    <div className="disp-card">
                        <div className="disp-card-title">New Dispute</div>

                        {submitted ? (
                            <div className="success-box">
                                <div className="success-icon">Done</div>
                                <div className="success-title">Dispute Submitted</div>
                                <p className="success-msg">
                                    Your report has been logged. Our team reviews disputes within 24 hours.<br />
                                    You&apos;ll be notified of any updates.
                                </p>
                                <button className="success-reset" onClick={handleReset}>
                                    Submit Another
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                {/* Issue Type */}
                                <div className="form-group">
                                    <label className="form-label">
                                        Issue Type <span>*</span>
                                    </label>
                                    <select
                                        className="form-select"
                                        value={issueType}
                                        onChange={e => setIssueType(e.target.value)}
                                        required
                                    >
                                        <option value="">— Select issue type —</option>
                                        {ISSUE_TYPES.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Order ID */}
                                <div className="form-group">
                                    <label className="form-label">Order ID (optional)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. A3F92B — leave blank if not order-specific"
                                        value={orderId}
                                        onChange={e => setOrderId(e.target.value)}
                                    />
                                    <div className="form-hint">Leave blank if not order-specific</div>
                                </div>

                                {/* Description */}
                                <div className="form-group">
                                    <label className="form-label">
                                        Description <span>*</span>
                                    </label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Describe the issue in detail…"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Urgency */}
                                <div className="form-group">
                                    <label className="form-label">Urgency</label>
                                    <div className="urgency-row">
                                        <button
                                            type="button"
                                            className={`urgency-btn${urgency === 'LOW' ? ' low-active' : ''}`}
                                            onClick={() => setUrgency('LOW')}
                                        >
                                            Low
                                        </button>
                                        <button
                                            type="button"
                                            className={`urgency-btn${urgency === 'HIGH' ? ' high-active' : ''}`}
                                            onClick={() => setUrgency('HIGH')}
                                        >
                                            High
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={loading || !issueType || !description.trim()}
                                >
                                    {loading ? 'Submitting…' : 'Submit Dispute'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* ── PAST DISPUTES ── */}
                <div>
                    <div className="past-hd">Past Disputes</div>

                    {pastDisputes.length === 0 ? (
                        <div className="empty-state">No past disputes on record.</div>
                    ) : (
                        pastDisputes.map(dispute => (
                            <div key={dispute.id} className="dispute-row">
                                <div className="dispute-row-top">
                                    <div className="dispute-type">{dispute.issueType}</div>
                                    <span className={`status-badge ${dispute.status === 'OPEN' ? 'status-open' : 'status-resolved'}`}>
                                        {dispute.status}
                                    </span>
                                </div>
                                <div className="dispute-desc">{dispute.description}</div>
                                <div className="dispute-meta">
                                    <span className="dispute-meta-item">{dispute.date}</span>
                                    <span className={`dispute-meta-item ${dispute.urgency === 'HIGH' ? 'urgency-hi' : 'urgency-lo'}`}>
                                        {dispute.urgency === 'HIGH' ? 'High' : 'Low'} urgency
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
