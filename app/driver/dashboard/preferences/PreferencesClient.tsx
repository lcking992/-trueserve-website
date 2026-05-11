'use client';

import { useState } from 'react';
import { saveDriverPreferences } from '../../actions';

interface DriverPrefs {
    navigationApp: string;
    acceptAlcohol: boolean;
    acceptCash: boolean;
    longDistance: boolean;
}

interface Props {
    initial: DriverPrefs;
}

export default function PreferencesClient({ initial }: Props) {
    const [prefs, setPrefs] = useState<DriverPrefs>(initial);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    async function update(next: Partial<DriverPrefs>) {
        const updated = { ...prefs, ...next };
        setPrefs(updated);
        setSaving(true);
        setStatus(null);

        const result = await saveDriverPreferences(updated);

        setSaving(false);
        if (result.error) {
            setStatus({ type: 'error', msg: result.error });
            // Revert optimistic update on error
            setPrefs(prefs);
        } else {
            setStatus({ type: 'success', msg: 'Preferences saved.' });
            setTimeout(() => setStatus(null), 2500);
        }
    }

    function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
        return (
            <button
                type="button"
                onClick={onChange}
                aria-pressed={on}
                style={{
                    width: 36, height: 20, borderRadius: 2,
                    position: 'relative', cursor: 'pointer', flexShrink: 0,
                    marginTop: 2, border: 'none', padding: 0,
                    background: on ? '#f97316' : '#2a2f3a',
                    outline: 'none', transition: 'background .15s',
                }}
            >
                <div style={{
                    width: 16, height: 16, background: '#fff', borderRadius: 1,
                    position: 'absolute', top: 2, transition: 'left .15s',
                    left: on ? 18 : 2,
                }} />
            </button>
        );
    }

    const NAV_OPTIONS = [
        { key: 'google_maps', label: 'Google Maps' },
        { key: 'waze',        label: 'Waze' },
        { key: 'apple_maps',  label: 'Apple Maps' },
        { key: 'native',      label: 'Default Nav' },
    ];

    return (
        <div className="font-sans">
            <style dangerouslySetInnerHTML={{ __html: `
                .page-wrap { padding: 24px 28px; }
                .page-title { font-size: 28px; font-weight: 700; color: #fff; letter-spacing: -0.02em; margin-bottom: 20px; }
                .page-title span { color: #f97316; }
                .prefs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .prefs-section { background: #0f1219; border: 1px solid #1c1f28; border-radius: 8px; overflow: hidden; }
                .prefs-sec-hd { padding: 12px 16px; border-bottom: 1px solid #1c1f28; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #888; }
                .pref-row { display: flex; align-items: flex-start; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #131720; gap: 16px; }
                .pref-row:last-child { border-bottom: none; }
                .pref-info .pref-name { font-size: 13px; font-weight: 700; color: #ccc; margin-bottom: 3px; }
                .pref-info .pref-desc { font-size: 11px; color: #444; line-height: 1.4; }
                .nav-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
                .nav-opt { padding: 10px; border: 1px solid #2a2f3a; text-align: center; cursor: pointer; font-size: 12px; font-weight: 700; color: #555; letter-spacing: 0.06em; transition: all .15s; border-radius: 4px; background: none; font-family: inherit; }
                .nav-opt.active { background: #1a1200; border-color: #f97316; color: #f97316; }
                .status-bar { padding: 10px 16px; font-size: 11px; font-weight: 700; border-radius: 6px; margin-bottom: 14px; }
                .status-bar.success { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #34d399; }
                .status-bar.error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #f87171; }
                .saving-pill { display: inline-flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #555; padding: 4px 10px; border: 1px solid #2a2f3a; border-radius: 20px; }
                @media (max-width: 900px) {
                    .page-wrap { padding: 18px 14px; }
                    .page-title { font-size: 26px; margin-bottom: 14px; }
                    .prefs-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 520px) {
                    .pref-row { flex-direction: column; align-items: flex-start; gap: 8px; }
                }
            ` }} />

            <div className="page-wrap">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div className="page-title" style={{ margin: 0 }}><span>Preferences</span></div>
                    {saving && (
                        <span className="saving-pill">
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316', animation: 'pulse 1s infinite' }} />
                            Saving…
                        </span>
                    )}
                </div>

                {status && (
                    <div className={`status-bar ${status.type}`}>
                        {status.type === 'error' ? 'Issue: ' : 'Saved: '}{status.msg}
                    </div>
                )}

                <div className="prefs-grid">
                    {/* Delivery Settings */}
                    <div className="prefs-section">
                        <div className="prefs-sec-hd">Delivery Settings</div>

                        <div className="pref-row">
                            <div className="pref-info">
                                <div className="pref-name">Alcohol Deliveries</div>
                                <div className="pref-desc">Requires ID verification on drop-off.</div>
                            </div>
                            <Toggle on={prefs.acceptAlcohol} onChange={() => update({ acceptAlcohol: !prefs.acceptAlcohol })} />
                        </div>

                        <div className="pref-row">
                            <div className="pref-info">
                                <div className="pref-name">Cash on Delivery</div>
                                <div className="pref-desc">Collect cash from customers (kept as earnings).</div>
                            </div>
                            <Toggle on={prefs.acceptCash} onChange={() => update({ acceptCash: !prefs.acceptCash })} />
                        </div>

                        <div className="pref-row">
                            <div className="pref-info">
                                <div className="pref-name">Long Distance Trips (8 mi+)</div>
                                <div className="pref-desc">Higher pay, more drive time.</div>
                            </div>
                            <Toggle on={prefs.longDistance} onChange={() => update({ longDistance: !prefs.longDistance })} />
                        </div>
                    </div>

                    {/* App Settings */}
                    <div className="prefs-section">
                        <div className="prefs-sec-hd">App Settings</div>

                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #131720' }}>
                            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>
                                Navigation App
                            </div>
                            <div className="nav-grid">
                                {NAV_OPTIONS.map(opt => (
                                    <button
                                        key={opt.key}
                                        type="button"
                                        className={`nav-opt${prefs.navigationApp === opt.key ? ' active' : ''}`}
                                        onClick={() => update({ navigationApp: opt.key })}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pref-row">
                            <div className="pref-info">
                                <div className="pref-name">Dark Mode</div>
                                <div className="pref-desc">Always on for driver safety.</div>
                            </div>
                            <Toggle on={true} onChange={() => {}} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
