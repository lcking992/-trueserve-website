"use client";

import { useState } from "react";
import { CheckCircle2, Copy, KeyRound, Link2, Plug, RefreshCw, ShieldCheck } from "lucide-react";
import { generateApiKey, savePosCredentials } from "../actions";

interface POSIntegrationProps {
  currentApiKey?: string;
  posType?: string;
  posClientId?: string;
  hasPosSecret?: boolean;
}

const POS_OPTIONS = ["Toast", "Square", "Clover", "Revel"];

export default function POSIntegration({
  currentApiKey,
  posType = "None",
  posClientId = "",
  hasPosSecret = false,
}: POSIntegrationProps) {
  const [apiKey, setApiKey] = useState(currentApiKey || "");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState("");
  const [externalPos, setExternalPos] = useState(posType === "None" ? "Toast" : posType);
  const [clientId, setClientId] = useState(posClientId);
  const [clientSecret, setClientSecret] = useState("");
  const isConnected = Boolean(posType && posType !== "None" && posClientId);

  async function handleGenerate() {
    if (apiKey && !confirm("Rotate this API key? Any external kiosks using the old key will need to be updated.")) return;
    setLoading(true);
    const res = await generateApiKey();
    if (res.success && res.apiKey) {
      setApiKey(res.apiKey);
      setShowKey(true);
    } else {
      alert("Failed to rotate key: " + res.error);
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!clientId.trim()) {
      alert("Enter the POS location ID or restaurant GUID first.");
      return;
    }
    if (!clientSecret.trim() && !hasPosSecret) {
      alert("Enter the POS client secret or webhook secret first.");
      return;
    }

    setSaving(true);
    const res = await savePosCredentials(externalPos, clientId.trim(), clientSecret.trim());
    if (res.success) {
      alert(`${externalPos} connection saved. Send a test order before using it live.`);
    } else {
      alert("Connection save failed: " + res.error);
    }
    setSaving(false);
  }

  async function copyValue(label: string, value: string) {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(""), 1800);
  }

  return (
    <>
      <style>{`
        .pos-wrap { display: grid; gap: 14px; }
        .pos-card { background: #111613; border: 1px solid #202a24; border-radius: 12px; overflow: hidden; }
        .pos-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; padding: 18px; border-bottom: 1px solid #202a24; }
        .pos-title-row { display: flex; align-items: center; gap: 10px; }
        .pos-icon { width: 38px; height: 38px; border-radius: 10px; background: rgba(249,115,22,.1); border: 1px solid rgba(249,115,22,.24); display: flex; align-items: center; justify-content: center; color: #f97316; flex-shrink: 0; }
        .pos-kicker { margin: 0 0 4px; font-size: 10px; font-weight: 900; letter-spacing: .14em; text-transform: uppercase; color: #7b837d; }
        .pos-title { margin: 0; font-size: 18px; font-weight: 900; color: #fff; }
        .pos-sub { margin: 6px 0 0; color: #9aa39d; font-size: 13px; line-height: 1.55; }
        .pos-status { display: inline-flex; align-items: center; gap: 7px; border-radius: 999px; padding: 7px 11px; font-size: 10px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; white-space: nowrap; }
        .pos-status.ok { color: #3dd68c; background: rgba(61,214,140,.1); border: 1px solid rgba(61,214,140,.24); }
        .pos-status.wait { color: #f97316; background: rgba(249,115,22,.1); border: 1px solid rgba(249,115,22,.24); }
        .pos-body { padding: 18px; }
        .pos-grid { display: grid; grid-template-columns: 280px 1fr; gap: 14px; align-items: start; }
        .pos-options { display: grid; gap: 8px; }
        .pos-option { display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%; border-radius: 10px; border: 1px solid #28312d; background: #0b0f0d; color: #d9dfdc; padding: 12px 13px; cursor: pointer; font: inherit; font-size: 12px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; text-align: left; }
        .pos-option.active { color: #f97316; border-color: rgba(249,115,22,.42); background: rgba(249,115,22,.08); }
        .pos-form { display: grid; gap: 12px; }
        .pos-field label { display: block; margin-bottom: 7px; color: #747d78; font-size: 10px; font-weight: 900; letter-spacing: .14em; text-transform: uppercase; }
        .pos-input { width: 100%; min-height: 46px; border-radius: 10px; border: 1px solid #28312d; background: #090d0b; color: #eef2ef; padding: 0 13px; outline: none; font: inherit; font-size: 13px; }
        .pos-input:focus { border-color: rgba(249,115,22,.55); }
        .pos-help { color: #858f89; font-size: 12px; line-height: 1.55; }
        .pos-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 2px; }
        .pos-primary, .pos-secondary { border-radius: 10px; min-height: 44px; padding: 0 16px; border: 1px solid transparent; cursor: pointer; font: inherit; font-size: 11px; font-weight: 900; letter-spacing: .11em; text-transform: uppercase; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
        .pos-primary { background: #f97316; color: #070907; }
        .pos-secondary { background: rgba(255,255,255,.04); border-color: #28312d; color: #d8dedb; }
        .pos-primary:disabled, .pos-secondary:disabled { opacity: .55; cursor: not-allowed; }
        .pos-key-row { display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: center; }
        .pos-key { min-height: 46px; border-radius: 10px; border: 1px solid #28312d; background: #090d0b; display: flex; align-items: center; padding: 0 13px; color: #3dd68c; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; overflow: hidden; }
        .pos-key span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pos-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 14px; }
        .pos-step { border: 1px solid #202a24; border-radius: 10px; padding: 13px; background: rgba(255,255,255,.025); }
        .pos-step strong { display: block; color: #fff; font-size: 13px; margin-bottom: 5px; }
        .pos-step span { color: #88928c; font-size: 12px; line-height: 1.5; }
        @media (max-width: 900px) { .pos-grid { grid-template-columns: 1fr; } .pos-steps { grid-template-columns: 1fr; } .pos-card-head { flex-direction: column; } }
        @media (max-width: 560px) { .pos-body, .pos-card-head { padding: 14px; } .pos-actions { flex-direction: column; } .pos-primary, .pos-secondary { width: 100%; } }
      `}</style>

      <div className="pos-wrap">
        <section className="pos-card">
          <div className="pos-card-head">
            <div className="pos-title-row">
              <div className="pos-icon"><Plug size={18} /></div>
              <div>
                <p className="pos-kicker">POS connection</p>
                <h2 className="pos-title">Connect the restaurant POS</h2>
                <p className="pos-sub">Save the location ID and secret from Toast, Square, Clover, or Revel. Then send one test order before launch.</p>
              </div>
            </div>
            <div className={`pos-status ${isConnected ? "ok" : "wait"}`}>
              {isConnected ? <CheckCircle2 size={14} /> : <Link2 size={14} />}
              {isConnected ? `${posType} connected` : "Needs setup"}
            </div>
          </div>

          <div className="pos-body">
            <div className="pos-grid">
              <div className="pos-options">
                {POS_OPTIONS.map((sys) => (
                  <button key={sys} className={`pos-option ${externalPos === sys ? "active" : ""}`} onClick={() => setExternalPos(sys)}>
                    {sys}
                    {externalPos === sys ? <CheckCircle2 size={15} /> : null}
                  </button>
                ))}
              </div>

              <div className="pos-form">
                <div className="pos-field">
                  <label>{externalPos} location ID or restaurant GUID</label>
                  <input className="pos-input" value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="Paste the Toast restaurant GUID or location ID" />
                </div>
                <div className="pos-field">
                  <label>{externalPos} client secret or webhook secret</label>
                  <input className="pos-input" type="password" value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} placeholder={hasPosSecret ? "Saved. Enter a new secret only if replacing it." : "Paste the secret from the POS admin portal"} />
                </div>
                <p className="pos-help">For Toast, use the restaurant GUID as the location ID. TrueServe uses that ID to match incoming Toast webhooks to the right restaurant.</p>
                <div className="pos-actions">
                  <button className="pos-primary" onClick={handleSave} disabled={saving}>
                    {saving ? <RefreshCw size={15} /> : <ShieldCheck size={15} />}
                    {saving ? "Saving..." : `Save ${externalPos} connection`}
                  </button>
                </div>
              </div>
            </div>

            <div className="pos-steps">
              <div className="pos-step"><strong>1. Save credentials</strong><span>Store the POS location ID and secret here.</span></div>
              <div className="pos-step"><strong>2. Add webhook URL</strong><span>Use https://trueserve.delivery/api/webhook/pos/toast for Toast.</span></div>
              <div className="pos-step"><strong>3. Test an order</strong><span>Confirm the order appears in the merchant dashboard.</span></div>
            </div>
          </div>
        </section>

        <section className="pos-card">
          <div className="pos-card-head">
            <div className="pos-title-row">
              <div className="pos-icon"><KeyRound size={18} /></div>
              <div>
                <p className="pos-kicker">Direct ordering API</p>
                <h2 className="pos-title">Optional API key</h2>
                <p className="pos-sub">Only needed for custom kiosks, third-party dispatchers, or an embedded ordering partner.</p>
              </div>
            </div>
            <div className={`pos-status ${apiKey ? "ok" : "wait"}`}>
              {apiKey ? "Key available" : "No key yet"}
            </div>
          </div>
          <div className="pos-body">
            <div className="pos-key-row">
              <div className="pos-key"><span>{showKey && apiKey ? apiKey : "Hidden until revealed"}</span></div>
              <button className="pos-secondary" onClick={() => copyValue("key", apiKey)} disabled={!showKey || !apiKey}>
                <Copy size={15} /> {copied === "key" ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="pos-actions" style={{ marginTop: 12 }}>
              <button className="pos-secondary" onClick={() => setShowKey((v) => !v)} disabled={!apiKey}>
                {showKey ? "Hide key" : "Reveal key"}
              </button>
              <button className="pos-secondary" onClick={handleGenerate} disabled={loading}>
                <RefreshCw size={15} /> {loading ? "Rotating..." : apiKey ? "Rotate key" : "Generate key"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
