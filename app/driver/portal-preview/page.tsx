import Link from "next/link";
import DriverPortalWrapper from "@/app/driver/dashboard/DriverPortalWrapper";

const availableTrips = [
  { restaurant: "Nearby Restaurant", address: "Your area", payout: "Varies", distance: "— mi" },
  { restaurant: "Nearby Restaurant", address: "Your area", payout: "Varies", distance: "— mi" },
  { restaurant: "Nearby Restaurant", address: "Your area", payout: "Varies", distance: "— mi" },
];

const routeRows = [
  { label: "Balance", value: "—" },
  { label: "Weather", value: "—" },
  { label: "Trip Count", value: "—" },
  { label: "Rating", value: "—" },
];

export default function DriverPortalPreviewPage() {
  return (
    <DriverPortalWrapper>
      <style>{`
        .dpp-preview-note {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 14px;
          margin-bottom: 14px;
          background: rgba(249,115,22,0.08);
          border: 1px solid rgba(249,115,22,0.18);
          border-radius: 8px;
          color: #f0bd63;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }
        .dpp-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 22px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .dpp-page-title {
          font-size: 20px;
          font-weight: 600;
          color: #fff;
          letter-spacing: -0.01em;
        }
        .dpp-page-sub {
          font-size: 13px;
          color: #666;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-top: 6px;
          font-weight: 600;
        }
        .dpp-live-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 800;
          color: #3ecf6e;
          background: rgba(61,214,140,0.08);
          border: 1px solid rgba(61,214,140,0.16);
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }
        .dpp-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #3ecf6e;
          animation: dppPulse 1.8s ease-in-out infinite;
        }
        @keyframes dppPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .dpp-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
          margin-bottom: 2px;
        }
        .dpp-stat-card {
          background: #141a18;
          border: 1px solid #1e2420;
          padding: 20px 22px;
        }
        .dpp-stat-card:first-child { border-radius: 8px 0 0 0; }
        .dpp-stat-card:last-child { border-radius: 0 8px 0 0; }
        .dpp-stat-label {
          font-size: 10px;
          font-weight: 800;
          color: #777;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .dpp-stat-value {
          font-size: 30px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -1px;
        }
        .dpp-stat-value.gold { color: #f97316; }
        .dpp-stat-value.grn { color: #3ecf6e; }
        .dpp-weather-card {
          background: #141a18;
          border: 1px solid #1e2420;
          border-radius: 0 0 8px 8px;
          padding: 18px 22px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .dpp-weather-label {
          font-size: 10px;
          font-weight: 800;
          color: #777;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .dpp-weather-temp { font-size: 28px; font-weight: 700; color: #3ecf6e; letter-spacing: -0.5px; }
        .dpp-stripe-banner {
          background: #141a18;
          border: 1px solid #1e2420;
          border-radius: 8px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          gap: 16px;
        }
        .dpp-stripe-banner.connected {
          border-color: #0f2a1a;
          background: #0d1a0f;
        }
        .dpp-stripe-left { display: flex; align-items: center; gap: 14px; }
        .dpp-stripe-icon {
          width: 40px;
          height: 28px;
          border-radius: 6px;
          background: #0f1210;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .dpp-stripe-icon.connected { background: #0f2a1a; }
        .dpp-stripe-icon::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 3px;
          background: rgba(255,255,255,0.7);
          border-radius: 2px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -60%);
        }
        .dpp-stripe-icon::before {
          content: '';
          position: absolute;
          width: 13px;
          height: 3px;
          background: rgba(255,255,255,0.35);
          border-radius: 2px;
          top: 50%;
          left: 10px;
          transform: translateY(40%);
        }
        .dpp-stripe-title {
          display: block;
          color: #fff;
          font-weight: 700;
          font-size: 13px;
          margin-bottom: 3px;
        }
        .dpp-stripe-sub { font-size: 11px; color: #aab4c8; }
        .dpp-stripe-connected { font-size: 12px; color: #3ecf6e; font-weight: 700; white-space: nowrap; }
        .dpp-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        .dpp-bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        .dpp-panel {
          background: #141a18;
          border: 1px solid #1e2420;
          border-radius: 8px;
          padding: 20px;
        }
        .dpp-panel-section-label {
          font-size: 10px;
          font-weight: 800;
          color: #777;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .dpp-panel-title {
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 12px;
          letter-spacing: -0.3px;
        }
        .dpp-empty-state {
          background: #0f1210;
          border: 1px solid #1e2420;
          border-radius: 8px;
          padding: 14px 16px;
          font-size: 12px;
          color: #aab4c8;
          text-align: center;
        }
        .dpp-order-card,
        .dpp-avail-card,
        .dpp-summary-row {
          background: #0b0f17;
          border: 1px solid #1e2420;
          border-radius: 8px;
        }
        .dpp-order-card { padding: 16px; margin-bottom: 8px; }
        .dpp-order-status {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #f97316;
          font-weight: 800;
          margin-bottom: 4px;
        }
        .dpp-order-name { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 10px; }
        .dpp-addr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px; }
        .dpp-addr-block {
          background: #141a18;
          border: 1px solid #1e2420;
          border-radius: 8px;
          padding: 10px 12px;
        }
        .dpp-addr-label {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #777;
          margin-bottom: 3px;
          font-weight: 800;
        }
        .dpp-addr-val { font-size: 12px; font-weight: 700; color: #e0e0e0; }
        .dpp-progress-bar-wrap {
          height: 4px;
          background: #1e2420;
          border-radius: 4px;
          overflow: hidden;
          margin: 10px 0 6px;
        }
        .dpp-progress-bar {
          height: 100%;
          background: #f97316;
          border-radius: 4px;
          width: 68%;
        }
        .dpp-avail-card { padding: 16px; margin-bottom: 8px; }
        .dpp-avail-name { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .dpp-avail-addr { font-size: 11px; color: #aab4c8; margin-bottom: 10px; }
        .dpp-badge-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
        .dpp-badge {
          border-radius: 8px;
          padding: 3px 10px;
          font-size: 10px;
          font-weight: 800;
        }
        .dpp-badge-green { background: rgba(62,207,110,0.1); border: 1px solid rgba(62,207,110,0.25); color: #3ecf6e; }
        .dpp-badge-muted { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #777; }
        .dpp-badge-red { background: rgba(232,64,64,0.1); border: 1px solid rgba(232,64,64,0.25); color: #e84040; }
        .dpp-accept-btn {
          width: 100%;
          background: #f97316;
          color: #000;
          border: none;
          border-radius: 8px;
          padding: 10px;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          transition: background 0.15s;
          font-family: inherit;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }
        .dpp-accept-btn:hover { background: #ea6c10; }
        .dpp-summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          margin-bottom: 6px;
        }
        .dpp-summary-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #777;
          font-weight: 800;
        }
        .dpp-summary-val {
          font-size: 12px;
          font-weight: 700;
          color: #e0e0e0;
        }
        .dpp-btn-gold,
        .dpp-btn-ghost {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.15s;
          margin-bottom: 6px;
          width: 100%;
          text-transform: uppercase;
          letter-spacing: 0.11em;
        }
        .dpp-btn-gold {
          background: #f97316;
          color: #000;
          border: none;
        }
        .dpp-btn-ghost {
          background: transparent;
          color: #999;
          border: 1px solid #1e2420;
        }
        .dpp-btn-ghost:hover { color: #f97316; border-color: rgba(249,115,22,0.35); background: rgba(249,115,22,0.06); }
        .dpp-essentials-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-top: 10px;
        }
        .dpp-footer-note {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 12px;
        }
        @media (max-width: 1024px) {
          .dpp-two-col, .dpp-bottom-grid { grid-template-columns: 1fr; }
          .dpp-stat-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .dpp-stat-grid { grid-template-columns: 1fr 1fr; }
          .dpp-addr-grid { grid-template-columns: 1fr; }
          .dpp-essentials-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dpp-preview-note">
        <span>Mock data only — shell matches the live driver portal.</span>
        <Link href="/driver/tutorial-preview" className="dpp-btn-gold" style={{ width: "auto", marginBottom: 0, textDecoration: "none" }}>
          View Tutorial
        </Link>
      </div>

      <div className="dpp-topbar">
        <div>
          <div className="dpp-page-title">Driver Dashboard Preview</div>
          <div className="dpp-page-sub">Portal preview · mirrors the live driver dashboard</div>
        </div>
        <div className="dpp-live-pill">
          <span className="dpp-live-dot" />
          Live Routes
        </div>
      </div>

      <div className="dpp-stat-grid">
        <div className="dpp-stat-card">
          <div className="dpp-stat-label">Daily Yield</div>
          <div className="dpp-stat-value gold">$126</div>
        </div>
        <div className="dpp-stat-card">
          <div className="dpp-stat-label">Trips</div>
          <div className="dpp-stat-value">7</div>
        </div>
        <div className="dpp-stat-card">
          <div className="dpp-stat-label">Rating</div>
          <div className="dpp-stat-value">4.9 ★</div>
        </div>
        <div className="dpp-stat-card">
          <div className="dpp-stat-label">Weather</div>
          <div className="dpp-stat-value grn">68°F</div>
        </div>
      </div>

      <div className="dpp-weather-card">
        <div>
          <div className="dpp-weather-label">Weather</div>
          <div className="dpp-weather-temp">68°F</div>
        </div>
        <div style={{ fontSize: 11, color: "#555", textAlign: "right" }}>
          <div>Clear</div>
          <div style={{ marginTop: 3, color: "#3a3a3a" }}>Location pending</div>
        </div>
      </div>

      <div className="dpp-stripe-banner connected">
        <div className="dpp-stripe-left">
          <div className="dpp-stripe-icon connected" />
          <div>
            <span className="dpp-stripe-title">Stripe payouts active.</span>
            <span className="dpp-stripe-sub">This preview mirrors the live driver layout for routes, earnings, and payout status.</span>
          </div>
        </div>
        <div className="dpp-stripe-connected">Done Active</div>
      </div>

      <div className="dpp-two-col">
        <div className="dpp-panel">
          <div className="dpp-panel-section-label">Active Mission</div>
          <div className="dpp-panel-title">Current Route</div>
          <div className="dpp-order-card">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
              <div>
                <div className="dpp-order-status">Picked Up</div>
                <div className="dpp-order-name">Active Restaurant</div>
              </div>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#555" }}>
                #TRV-XXXX
              </div>
            </div>
            <div className="dpp-addr-grid">
              <div className="dpp-addr-block">
                <div className="dpp-addr-label">Pickup</div>
                <div className="dpp-addr-val">Restaurant Address</div>
              </div>
              <div className="dpp-addr-block">
                <div className="dpp-addr-label">Drop-off</div>
                <div className="dpp-addr-val">Customer Address</div>
                <div style={{ fontSize: 10, color: "#5bcfd4", marginTop: 3 }}>Customer: —</div>
              </div>
            </div>
            <div className="dpp-progress-bar-wrap">
              <div className="dpp-progress-bar" />
            </div>
            <div style={{ fontSize: 10, color: "#f97316", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              En route
            </div>
            <button className="dpp-accept-btn" disabled type="button">
              Preview Only
            </button>
          </div>
          <div className="dpp-info-card">
            <div className="dpp-panel-section-label">Route Snapshot</div>
            <div className="mt-1 text-[15px] font-bold text-white">Customer drop-off and pickup cards match the live route board.</div>
          </div>
        </div>

        <div className="dpp-panel">
          <div className="dpp-panel-section-label">Driver Essentials</div>
          <div className="dpp-panel-title">Payments and Tools</div>
          <div className="dpp-essentials-grid mt-5">
            <button className="dpp-btn-gold opacity-60 cursor-not-allowed" disabled type="button">Stripe Payout Setup</button>
            <button className="dpp-btn-gold opacity-60 cursor-not-allowed" disabled type="button">Compliance Checklist</button>
            <button className="dpp-btn-ghost opacity-60 cursor-not-allowed" disabled type="button">Settlement History</button>
            <button className="dpp-btn-ghost opacity-60 cursor-not-allowed" disabled type="button">TrueServe AI Support</button>
          </div>
          <div className="dpp-footer-note">
            <div className="dpp-panel-section-label">Navigation</div>
            <div className="text-xs uppercase tracking-[0.12em] text-white/35">Live Map + Heatmap</div>
          </div>
          <div className="mt-3 dpp-info-card">
            <div className="text-[10px] uppercase tracking-[0.14em] text-white/40 font-black">Preview route view</div>
            <div className="mt-4 space-y-3">
              {[
                { stop: "Pickup", place: "Restaurant Name", detail: "Restaurant Address · — mi" },
                { stop: "Drop-off", place: "Customer Address", detail: "Customer: — · — mi" },
              ].map((stop) => (
                <div key={stop.stop} className="dpp-addr-block">
                  <div className="dpp-addr-label">{stop.stop}</div>
                  <div className="mt-1 text-[13px] font-semibold text-white/90">{stop.place}</div>
                  <div className="mt-0.5 text-xs text-white/50">{stop.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="dpp-bottom-grid">
        <div className="dpp-panel">
          <div className="dpp-panel-section-label">Available Orders</div>
          <div className="dpp-panel-title">Nearby Opportunities</div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {availableTrips.map((trip) => (
              <div key={trip.restaurant} className="dpp-avail-card">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-black text-white">{trip.restaurant}</h3>
                  <span className="text-[11px] uppercase tracking-[0.12em] text-[#68c7cc]">Live</span>
                </div>
                <p className="mb-4 text-sm leading-6 text-white/65">{trip.address}</p>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#3dd68c]/30 bg-[#3dd68c]/10 px-3 py-1 text-xs font-bold text-[#3dd68c]">
                    {trip.payout} payout
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-white/65">{trip.distance}</span>
                </div>
                <button className="dpp-accept-btn" disabled type="button">
                  Accept Order
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="dpp-panel">
          <div className="dpp-panel-section-label">Route Summary</div>
          <div className="dpp-panel-title">Today at a glance</div>
          <div className="mt-5 space-y-3">
            {routeRows.map((row) => (
              <div key={row.label} className="dpp-summary-row">
                <span className="dpp-summary-label">{row.label}</span>
                <span className="dpp-summary-val">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-2">
            <button className="dpp-btn-gold opacity-60 cursor-not-allowed" disabled type="button">
              Open Compliance
            </button>
            <button className="dpp-btn-ghost opacity-60 cursor-not-allowed" disabled type="button">
              View Settlements
            </button>
            <button className="dpp-btn-ghost opacity-60 cursor-not-allowed" disabled type="button">
              Get Support
            </button>
          </div>
        </div>
      </div>
    </DriverPortalWrapper>
  );
}
