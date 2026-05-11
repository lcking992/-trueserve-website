"use client";

import React, { useState, useTransition } from "react";
import { inviteTeamMember, sendPasswordReset, updateMemberPhone } from "@/app/admin/team/actions";

function PhoneEditor({ member, onMessage }: { member: any; onMessage: (msg: { text: string; type: "success" | "error" }) => void }) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(member.phone || "");
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        const res = await updateMemberPhone(member.id, member.email, value);
        setSaving(false);
        if (res?.error) {
            onMessage({ text: res.error, type: "error" });
        } else if (res?.success) {
            onMessage({ text: res.success, type: "success" });
            member.phone = value || null;
            setEditing(false);
        }
    };

    if (editing) {
        return (
            <div className="iam-phone-input-row">
                <input
                    autoFocus
                    className="iam-phone-input"
                    placeholder="+18005551234"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
                    disabled={saving}
                />
                <button className="iam-phone-save" onClick={handleSave} disabled={saving}>
                    {saving ? "…" : "Save"}
                </button>
                <button className="iam-phone-cancel" onClick={() => { setValue(member.phone || ""); setEditing(false); }}>
                    Close
                </button>
            </div>
        );
    }

    return (
        <div className="iam-phone-row">
            {member.phone
                ? <span className="iam-phone-text">Phone {member.phone}</span>
                : <span className="iam-phone-missing">Warning No phone</span>
            }
            {!member.isDirectoryEntry && (
                <button className="iam-phone-edit-btn" title="Edit phone" onClick={() => setEditing(true)}>✏</button>
            )}
        </div>
    );
}

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
    ADMIN: { bg: "#2a1a00", color: "#f5a623" },
    PM: { bg: "#2a1a00", color: "#f5a623" },
    OPS: { bg: "#2a1a00", color: "#f5a623" },
    SUPPORT: { bg: "#2a1a00", color: "#f5a623" },
    FINANCE: { bg: "#2a1a00", color: "#f5a623" },
    READONLY: { bg: "#1a1d22", color: "#94a3b8" },
    QA_TESTER: { bg: "#2a1a00", color: "#f5a623" },
};

export default function TeamManagerUI({ initialMembers }: { initialMembers: any[] }) {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
    const directoryMembers = initialMembers.filter((member) => member.isDirectoryEntry);

    const handleAction = async (actionFn: () => Promise<any>) => {
        setMessage(null);
        startTransition(async () => {
            try {
                const res = await actionFn();
                if (res?.error) setMessage({ text: res.error, type: "error" });
                else if (res?.success) setMessage({ text: res.success, type: "success" });
            } catch (error: any) {
                setMessage({ text: error.message || "An error occurred", type: "error" });
            }
        });
    };

    const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        await handleAction(() => inviteTeamMember(formData));
        event.currentTarget.reset();
    };

    return (
        <>
            <style>{`
                .iam-shell {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .iam-header {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    gap: 24px;
                    flex-wrap: wrap;
                }

                .iam-title {
                    font-size: 25px;
                    font-weight: 800;
                    color: #ffffff;
                    margin: 0 0 4px 0;
                    letter-spacing: -0.5px;
                }

                .iam-subtitle {
                    font-size: 13px;
                    color: #7a7f75;
                    margin: 0;
                    max-width: 700px;
                    line-height: 1.5;
                }

                .iam-invite-block {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 8px;
                    flex-shrink: 0;
                }

                .iam-invite-label {
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    color: #7a7f75;
                    text-transform: uppercase;
                }

                .iam-invite-row {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                    flex-wrap: wrap;
                }

                .iam-input,
                .iam-select {
                    background: #0f1210;
                    border: 1px solid #243028;
                    color: #fff;
                    font-size: 13px;
                    border-radius: 6px;
                    outline: none;
                }

                .iam-input {
                    padding: 10px 12px;
                    width: 260px;
                }

                .iam-input::placeholder { color: #444; }
                .iam-input:focus,
                .iam-select:focus {
                    border-color: #f97316;
                    box-shadow: 0 0 0 1px rgba(249,115,22,0.15);
                }

                .iam-select {
                    padding: 10px 10px;
                    cursor: pointer;
                }

                .iam-invite-btn {
                    background: #f97316;
                    color: #000;
                    font-size: 12px;
                    font-weight: 700;
                    padding: 10px 18px;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    white-space: nowrap;
                    letter-spacing: 0.04em;
                }

                .iam-invite-btn:hover { background: #fb923c; }
                .iam-invite-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                .iam-msg {
                    padding: 10px 14px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 500;
                }

                .iam-msg.success {
                    background: rgba(52,211,153,0.1);
                    color: #34d399;
                    border: 1px solid rgba(52,211,153,0.2);
                }

                .iam-msg.error {
                    background: rgba(248,113,113,0.1);
                    color: #f87171;
                    border: 1px solid rgba(248,113,113,0.2);
                }

                .iam-staff-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .iam-staff-copy {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    min-width: 0;
                }

                .iam-staff-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 700;
                    color: #e5e7eb;
                }

                .iam-staff-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #3b82f6;
                    flex-shrink: 0;
                }

                .iam-staff-note {
                    font-size: 12px;
                    color: #7a7f75;
                    line-height: 1.45;
                }

                .iam-count-pill {
                    padding: 8px 12px;
                    border-radius: 999px;
                    border: 1px solid rgba(59,130,246,0.22);
                    background: rgba(59,130,246,0.08);
                    color: #93c5fd;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    white-space: nowrap;
                }

                .iam-table-wrap {
                    background: #141a18;
                    border: 1px solid #1e2420;
                    border-radius: 8px;
                    overflow-x: auto;
                }

                .iam-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                }

                .iam-table th {
                    padding: 10px 16px;
                    text-align: left;
                    color: #555;
                    font-weight: 500;
                    border-bottom: 1px solid #1e2420;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }

                .iam-table th.right { text-align: right; }

                .iam-table td {
                    padding: 12px 16px;
                    color: #aaa;
                    border-bottom: 1px solid #1e2420;
                    vertical-align: middle;
                }

                .iam-table tr:last-child td { border-bottom: none; }
                .iam-table tr:hover td { background: rgba(255,255,255,0.01); }

                .iam-name {
                    color: #fff;
                    font-weight: 500;
                    font-size: 13px;
                }

                .iam-email {
                    font-size: 12px;
                    color: #555;
                    margin-top: 2px;
                }

                .iam-member-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    margin-top: 6px;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: #93c5fd;
                }

                .iam-member-chip .dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #3b82f6;
                }

                .iam-role {
                    font-size: 11px;
                    padding: 3px 10px;
                    border-radius: 4px;
                    font-weight: 600;
                    letter-spacing: 0.04em;
                }

                .iam-action-btn {
                    font-size: 12px;
                    padding: 7px 14px;
                    border-radius: 5px;
                    border: 1px solid #2e3830;
                    background: #1e2420;
                    color: #aaa;
                    cursor: pointer;
                    white-space: nowrap;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }

                .iam-action-btn:hover { border-color: #f97316; color: #f97316; }
                .iam-action-btn:disabled { opacity: 0.4; cursor: not-allowed; }

                .iam-empty {
                    color: #7a7f75;
                    padding: 34px 16px;
                    text-align: center;
                    font-size: 13px;
                    line-height: 1.55;
                }

                .iam-footer {
                    font-size: 12px;
                    color: #7a7f75;
                    padding: 10px 16px;
                    border-top: 1px solid #1e2420;
                    display: flex;
                    justify-content: space-between;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .iam-phone-row {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-top: 4px;
                }
                .iam-phone-text {
                    font-size: 11px;
                    color: #7a7f75;
                }
                .iam-phone-missing {
                    font-size: 11px;
                    color: #f97316;
                    font-weight: 600;
                }
                .iam-phone-edit-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #555;
                    font-size: 11px;
                    padding: 1px 4px;
                    border-radius: 3px;
                    line-height: 1;
                }
                .iam-phone-edit-btn:hover { color: #f97316; }
                .iam-phone-input-row {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-top: 4px;
                }
                .iam-phone-input {
                    background: #0f1210;
                    border: 1px solid #f97316;
                    color: #fff;
                    font-size: 12px;
                    border-radius: 5px;
                    padding: 5px 8px;
                    width: 160px;
                    outline: none;
                }
                .iam-phone-save {
                    background: #f97316;
                    color: #000;
                    border: none;
                    border-radius: 5px;
                    padding: 5px 10px;
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                }
                .iam-phone-save:disabled { opacity: 0.5; cursor: not-allowed; }
                .iam-phone-cancel {
                    background: none;
                    border: none;
                    color: #7a7f75;
                    font-size: 11px;
                    cursor: pointer;
                    padding: 4px;
                }
                .iam-phone-cancel:hover { color: #fff; }

                @media (max-width: 768px) {
                    .iam-header { flex-direction: column; align-items: flex-start; }
                    .iam-invite-block { align-items: flex-start; width: 100%; }
                    .iam-invite-row { width: 100%; }
                    .iam-input,
                    .iam-select,
                    .iam-invite-btn { width: 100%; }
                    .iam-staff-header { align-items: flex-start; flex-direction: column; }
                    .iam-count-pill { align-self: flex-start; }
                }
            `}</style>

            <div className="iam-shell">
                <div className="iam-header">
                    <div className="iam-title-block">
                        <h2 className="iam-title">Identity &amp; Access</h2>
                        <p className="iam-subtitle">
                            Manage internal staff, portal permissions, and the approved access directory. Eric&apos;s
                            <code style={{ color: "#f97316", background: "rgba(249,115,22,0.08)", padding: "1px 6px", borderRadius: 4, marginLeft: 4 }}>
                                admin@trueserve.com
                            </code>
                            alias now appears here.
                        </p>
                    </div>

                    <div className="iam-invite-block">
                        <div className="iam-invite-label">Invite New Team Member</div>
                        <form onSubmit={handleInvite}>
                            <div className="iam-invite-row">
                                <input
                                    required
                                    name="email"
                                    type="email"
                                    placeholder="employee@trueserve.delivery"
                                    className="iam-input"
                                    disabled={isPending}
                                />
                                <select required name="role" className="iam-select" disabled={isPending}>
                                    <option value="OPS">Ops</option>
                                    <option value="SUPPORT">Support</option>
                                    <option value="FINANCE">Finance</option>
                                    <option value="PM">PM</option>
                                    <option value="QA_TESTER">QA Tester</option>
                                    <option value="READONLY">Read Only</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                                <button type="submit" className="iam-invite-btn" disabled={isPending}>
                                    {isPending ? "Sending…" : "Invite"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {message && <div className={`iam-msg ${message.type}`}>{message.text}</div>}

                <div className="iam-staff-header">
                    <div className="iam-staff-copy">
                        <span className="iam-staff-label">
                            <span className="iam-staff-dot" />
                            Active Staff
                        </span>
                        <span className="iam-staff-note">
                            Real staff accounts plus the approved access directory. Whitelisted admins stay visible even before their first sync.
                        </span>
                    </div>
                    <div className="iam-count-pill">
                        {initialMembers.length} Member{initialMembers.length !== 1 ? "s" : ""}
                    </div>
                </div>

                <div className="iam-table-wrap">
                    <table className="iam-table">
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Role</th>
                                <th className="right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {initialMembers.map((member: any) => {
                                const roleStyle = ROLE_COLORS[member.role] || { bg: "rgba(85,85,85,0.2)", color: "#888" };

                                return (
                                    <tr key={member.id}>
                                        <td>
                                            <div className="iam-name">{member.name || "Unknown"}</div>
                                            <div className="iam-email">{member.email}</div>
                                            <PhoneEditor member={member} onMessage={setMessage} />
                                            <div className="iam-member-chip">
                                                <span className="dot" />
                                                {member.isDirectoryEntry ? "Directory sync" : "Active account"}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="iam-role" style={{ background: roleStyle.bg, color: roleStyle.color }}>
                                                {member.role}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            {member.isDirectoryEntry ? (
                                                <button className="iam-action-btn" disabled>
                                                    Sync pending
                                                </button>
                                            ) : (
                                                <button
                                                    className="iam-action-btn"
                                                    disabled={isPending}
                                                    onClick={() => handleAction(() => sendPasswordReset(member.id, member.email))}
                                                >
                                                    Reset Password
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}

                            {initialMembers.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="iam-empty">
                                        No staff entries are synced yet. Whitelisted admin emails will appear here once they sign in, or you can add staff with the invite form above.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {initialMembers.length > 0 && (
                        <div className="iam-footer">
                            <span>{initialMembers.length} member{initialMembers.length !== 1 ? "s" : ""} shown</span>
                            <span>{directoryMembers.length} from the access directory</span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
