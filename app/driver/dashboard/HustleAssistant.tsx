"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, Clock3, MapPinned, ShieldCheck } from "lucide-react";

interface HustleAssistantProps {
  activeOrderId?: string | null;
  activeOrderStatus?: string | null;
  activeOrderPay?: number | null;
  activeOrderDistance?: number | null;
}

const WAIT_RATE_PER_MINUTE = 0.25;
const GRACE_MINUTES = 5;

export default function HustleAssistant({
  activeOrderId,
  activeOrderStatus,
  activeOrderPay,
  activeOrderDistance,
}: HustleAssistantProps) {
  const storageKey = activeOrderId ? `ts-driver-wait-start-${activeOrderId}` : "ts-driver-wait-start-idle";
  const noteKey = "ts-driver-route-note";
  const [waitStartedAt, setWaitStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [mpg, setMpg] = useState(26);
  const [fuelPrice, setFuelPrice] = useState(3.35);
  const [taxReserve, setTaxReserve] = useState(15);
  const [evMode, setEvMode] = useState(false);
  const [routeNote, setRouteNote] = useState("");

  useEffect(() => {
    const savedWait = Number(window.localStorage.getItem(storageKey));
    if (Number.isFinite(savedWait) && savedWait > 0) setWaitStartedAt(savedWait);
    const savedNote = window.localStorage.getItem(noteKey);
    if (savedNote) setRouteNote(savedNote);
  }, [storageKey]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const waitMinutes = waitStartedAt ? Math.max(0, Math.floor((now - waitStartedAt) / 60000)) : 0;
  const waitPayMinutes = Math.max(0, waitMinutes - GRACE_MINUTES);
  const waitPay = waitPayMinutes * WAIT_RATE_PER_MINUTE;
  const grossPay = Number(activeOrderPay || 0) + waitPay;
  const routeMiles = Number(activeOrderDistance || 0);
  const expense = evMode ? routeMiles * 0.05 : mpg > 0 ? (routeMiles / mpg) * fuelPrice : 0;
  const tax = grossPay * (taxReserve / 100);
  const estimatedNet = Math.max(0, grossPay - expense - tax);

  const waitStatus = useMemo(() => {
    if (!activeOrderId) return "No active route";
    if (!waitStartedAt) return "Tap arrived when you reach the restaurant.";
    if (waitPayMinutes > 0) return `Wait-pay active: $${waitPay.toFixed(2)} added so far.`;
    return `${Math.max(0, GRACE_MINUTES - waitMinutes)} min until wait-pay starts.`;
  }, [activeOrderId, waitPayMinutes, waitPay, waitStartedAt, waitMinutes]);

  function startWaitTimer() {
    const stamp = Date.now();
    setWaitStartedAt(stamp);
    window.localStorage.setItem(storageKey, String(stamp));
  }

  function resetWaitTimer() {
    setWaitStartedAt(null);
    window.localStorage.removeItem(storageKey);
  }

  function saveRouteNote(value: string) {
    setRouteNote(value);
    window.localStorage.setItem(noteKey, value);
  }

  return (
    <section className="hustle-card" aria-label="Driver hustle assistant">
      <style>{`
        .hustle-card {
          margin-bottom: 16px;
          border-radius: 12px;
          border: 1px solid rgba(249,115,22,.18);
          background: linear-gradient(180deg, rgba(22,28,24,.96), rgba(12,15,13,.98));
          box-shadow: 0 18px 44px rgba(0,0,0,.24);
          overflow: hidden;
        }
        .hustle-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 16px 18px;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }
        .hustle-kicker {
          margin: 0 0 5px;
          color: #f97316;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: .16em;
          text-transform: uppercase;
        }
        .hustle-head h2 {
          margin: 0;
          color: #fff;
          font-size: 20px;
          line-height: 1.1;
          font-weight: 900;
        }
        .hustle-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          border: 1px solid rgba(62,207,110,.2);
          background: rgba(62,207,110,.08);
          color: #3ecf6e;
          padding: 7px 10px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .1em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .hustle-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0;
        }
        .hustle-panel {
          min-width: 0;
          padding: 16px;
          border-right: 1px solid rgba(255,255,255,.06);
        }
        .hustle-panel:last-child { border-right: 0; }
        .hustle-panel-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          color: #fff;
          font-size: 13px;
          font-weight: 900;
        }
        .hustle-panel-title svg { color: #f97316; }
        .hustle-large {
          color: #fff;
          font-size: 30px;
          font-weight: 950;
          letter-spacing: -.04em;
          line-height: 1;
          margin-bottom: 6px;
        }
        .hustle-copy {
          color: #9aa49d;
          font-size: 12px;
          line-height: 1.5;
          font-weight: 650;
        }
        .hustle-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 12px;
        }
        .hustle-btn {
          min-height: 38px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 9px;
          background: #0f1210;
          color: #b9c1bd;
          font-family: inherit;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: .12em;
          text-transform: uppercase;
          cursor: pointer;
        }
        .hustle-btn.primary {
          border-color: rgba(249,115,22,.36);
          background: #f97316;
          color: #050706;
        }
        .hustle-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 10px;
        }
        .hustle-field {
          display: grid;
          gap: 5px;
          color: #717a74;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .12em;
          text-transform: uppercase;
        }
        .hustle-field input,
        .hustle-field select {
          width: 100%;
          border: 1px solid #1e2420;
          border-radius: 9px;
          background: #0f1210;
          color: #e8eee9;
          font-family: inherit;
          font-size: 12px;
          font-weight: 800;
          padding: 9px 10px;
        }
        .hustle-note-grid {
          display: grid;
          gap: 8px;
        }
        .hustle-note-btn {
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 9px;
          background: rgba(255,255,255,.035);
          color: #c7cec9;
          min-height: 36px;
          font-family: inherit;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          text-align: left;
          padding: 0 11px;
        }
        .hustle-note-btn.active {
          border-color: rgba(249,115,22,.35);
          background: rgba(249,115,22,.08);
          color: #f97316;
        }
        @media (max-width: 980px) {
          .hustle-grid { grid-template-columns: 1fr; }
          .hustle-panel { border-right: 0; border-bottom: 1px solid rgba(255,255,255,.06); }
          .hustle-panel:last-child { border-bottom: 0; }
        }
        @media (max-width: 640px) {
          .hustle-head { align-items: flex-start; flex-direction: column; }
          .hustle-status { white-space: normal; }
          .hustle-inputs { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="hustle-head">
        <div>
          <p className="hustle-kicker">Hustle Assistant</p>
          <h2>Real pay, wait protection, and safer route notes.</h2>
        </div>
        <div className="hustle-status">
          <ShieldCheck size={14} aria-hidden="true" />
          Driver-first tools
        </div>
      </div>

      <div className="hustle-grid">
        <div className="hustle-panel">
          <div className="hustle-panel-title"><Clock3 size={16} aria-hidden="true" /> Patience Pay Timer</div>
          <div className="hustle-large">{waitStartedAt ? `${waitMinutes}m` : "--"}</div>
          <div className="hustle-copy">{waitStatus}</div>
          <div className="hustle-actions">
            <button className="hustle-btn primary" type="button" disabled={!activeOrderId} onClick={startWaitTimer}>
              Arrived
            </button>
            <button className="hustle-btn" type="button" disabled={!waitStartedAt} onClick={resetWaitTimer}>
              Reset
            </button>
          </div>
        </div>

        <div className="hustle-panel">
          <div className="hustle-panel-title"><Calculator size={16} aria-hidden="true" /> Real Pay View</div>
          <div className="hustle-large">${estimatedNet.toFixed(2)}</div>
          <div className="hustle-copy">
            Est. net after {evMode ? "EV energy" : "fuel"} and {taxReserve}% tax reserve. Gross route: ${grossPay.toFixed(2)}.
          </div>
          <div className="hustle-inputs">
            <label className="hustle-field">
              Mode
              <select value={evMode ? "ev" : "gas"} onChange={(event) => setEvMode(event.target.value === "ev")}>
                <option value="gas">Gas</option>
                <option value="ev">EV</option>
              </select>
            </label>
            {!evMode ? (
              <label className="hustle-field">
                MPG
                <input type="number" min="1" value={mpg} onChange={(event) => setMpg(Number(event.target.value || 0))} />
              </label>
            ) : (
              <label className="hustle-field">
                Energy est.
                <input type="text" value="$0.05/mi" readOnly />
              </label>
            )}
            <label className="hustle-field">
              Fuel $
              <input type="number" min="0" step="0.01" value={fuelPrice} onChange={(event) => setFuelPrice(Number(event.target.value || 0))} />
            </label>
            <label className="hustle-field">
              Tax %
              <input type="number" min="0" max="50" value={taxReserve} onChange={(event) => setTaxReserve(Number(event.target.value || 0))} />
            </label>
          </div>
        </div>

        <div className="hustle-panel">
          <div className="hustle-panel-title"><MapPinned size={16} aria-hidden="true" /> Route Notes</div>
          <div className="hustle-note-grid">
            {["Well-lit parking", "Clean restroom", "Confusing entrance", "Hard parking", "Unsafe dropoff"].map((note) => (
              <button
                key={note}
                type="button"
                className={`hustle-note-btn${routeNote === note ? " active" : ""}`}
                onClick={() => saveRouteNote(routeNote === note ? "" : note)}
              >
                {note}
              </button>
            ))}
          </div>
          <div className="hustle-copy" style={{ marginTop: 10 }}>
            These notes stay local for now. Next version shares verified route tips with nearby drivers.
          </div>
        </div>
      </div>
    </section>
  );
}
