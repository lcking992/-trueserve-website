"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function GHLSettingsPanel({ 
    restaurantId, 
    initialGhlUrl 
}: { 
    restaurantId: string, 
    initialGhlUrl?: string 
}) {
    const [ghlUrl, setGhlUrl] = useState(initialGhlUrl || "");
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");

    const saveGHL = async () => {
        setIsSaving(true);
        setMessage("");
        
        let urlToSave = ghlUrl.trim();
        
        // Extract just the src URL if they pasted the full iframe tag
        const srcMatch = urlToSave.match(/src=["']([^"']+)["']/);
        if (srcMatch) urlToSave = srcMatch[1];
        
        const { error } = await supabase
            .from('Restaurant')
            .update({ ghlUrl: urlToSave })
            .eq('id', restaurantId);

        if (error) {
            setMessage("Cancelled Failed to save GHL URL");
            console.error(error);
        } else {
            setGhlUrl(urlToSave);
            setMessage("GHL embed saved — ordering will load automatically");
            setTimeout(() => setMessage(""), 3000);
        }
        setIsSaving(false);
    };

    return (
        <>
            <style>{`
                .ghl-panel {
                    margin-top: 24px;
                    display: grid;
                    gap: 16px;
                }
                .ghl-head {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 12px;
                    flex-wrap: wrap;
                }
                .ghl-title {
                    font-size: 12px;
                    font-weight: 900;
                    line-height: 1.2;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: var(--t3);
                    margin-bottom: 8px;
                }
                .ghl-sub {
                    max-width: 720px;
                    font-size: 13px;
                    line-height: 1.65;
                    color: var(--t2);
                }
                .ghl-badge {
                    padding: 6px 10px;
                    border: 1px solid rgba(249,115,22,0.28);
                    background: rgba(249,115,22,0.08);
                    color: #f97316;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: .12em;
                    text-transform: uppercase;
                    white-space: nowrap;
                }
                .ghl-shell {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) 170px;
                    gap: 12px;
                    align-items: stretch;
                }
                .ghl-input-wrap {
                    border: 1px solid var(--border);
                    background: #0c1016;
                    padding: 14px;
                }
                .ghl-input-label {
                    display: block;
                    margin-bottom: 8px;
                    color: #7f8792;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: .12em;
                    text-transform: uppercase;
                }
                .ghl-input {
                    width: 100%;
                    background: #090c11;
                    border: 1px solid #202733;
                    color: #fff;
                    font-size: 13px;
                    padding: 13px 14px;
                    outline: none;
                    transition: border-color .15s ease, box-shadow .15s ease;
                }
                .ghl-input::placeholder {
                    color: #5f6772;
                }
                .ghl-input:focus {
                    border-color: rgba(249,115,22,0.55);
                    box-shadow: 0 0 0 1px rgba(249,115,22,0.16);
                }
                .ghl-side {
                    border: 1px solid var(--border);
                    background: linear-gradient(180deg, rgba(249,115,22,0.1) 0%, rgba(249,115,22,0.03) 100%);
                    padding: 14px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    gap: 14px;
                }
                .ghl-side-kicker {
                    color: #7f8792;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: .12em;
                    text-transform: uppercase;
                }
                .ghl-side-copy {
                    color: #d7dce4;
                    font-size: 13px;
                    line-height: 1.6;
                }
                .ghl-save {
                    width: 100%;
                    min-height: 42px;
                    margin-top: 0;
                }
                .ghl-foot {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    flex-wrap: wrap;
                }
                .ghl-hint {
                    color: #7f8792;
                    font-size: 11px;
                    line-height: 1.6;
                }
                .ghl-message {
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: .04em;
                }
                .ghl-message.success { color: var(--green); }
                .ghl-message.error { color: var(--red); }
                @media (max-width: 900px) {
                    .ghl-shell {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
            <div className="md-stat-block ghl-panel">
                <div className="ghl-head">
                    <div>
                        <div className="ghl-title">GHL Integration</div>
                        <p className="ghl-sub">
                            Connect your Go High Level ordering or booking experience here. We support either the direct iframe source URL or the full embed code, and we’ll normalize it for the rest of the storefront tools automatically.
                        </p>
                    </div>
                    <div className="ghl-badge">
                        {ghlUrl ? "Embed Connected" : "Needs Embed"}
                    </div>
                </div>

                <div className="ghl-shell">
                    <div className="ghl-input-wrap">
                        <label className="ghl-input-label" htmlFor="ghl-embed-url">
                            Embed URL or iframe code
                        </label>
                        <input
                            id="ghl-embed-url"
                            className="ghl-input"
                            type="text"
                            value={ghlUrl}
                            onChange={(e) => setGhlUrl(e.target.value)}
                            placeholder="https://api.leadconnectorhq.com/widget/booking/..."
                        />
                    </div>

                    <div className="ghl-side">
                        <div>
                            <div className="ghl-side-kicker">Launch Use</div>
                            <div className="ghl-side-copy">
                                Save your GHL embed once and TrueServe will use it across your storefront and direct-order tools.
                            </div>
                        </div>
                        <button
                            onClick={saveGHL}
                            disabled={isSaving}
                            className="md-stripe-btn ghl-save"
                        >
                            {isSaving ? "Saving..." : "Save Embed"}
                        </button>
                    </div>
                </div>

                <div className="ghl-foot">
                    <div className="ghl-hint">
                        Best practice: paste the public ordering iframe source, not an internal admin URL.
                    </div>
                    {message && (
                        <div className={`ghl-message ${message.startsWith('Done') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
