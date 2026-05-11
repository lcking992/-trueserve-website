import Link from "next/link";
import MerchantDashboardWrapper from "@/app/merchant/dashboard/MerchantDashboardWrapper";

const incomingOrders = [
  { name: "Pilot Order A", status: "PREPARING", total: "$34.20", note: "2 items · 12 min" },
  { name: "Pilot Order B", status: "READY FOR PICKUP", total: "$19.75", note: "1 item · 6 min" },
  { name: "Pilot Order C", status: "PENDING", total: "$28.10", note: "4 items · 3 min" },
];

const opsRows = [
  { label: "Prep Time", value: "15 min" },
  { label: "Terminal", value: "Online" },
  { label: "Capacity", value: "10 orders" },
  { label: "Support", value: "Ready" },
];

export default function MerchantPortalPreviewPage() {
  return (
    <MerchantDashboardWrapper restaurantName="Pilot Kitchen">
      <style>{`
        .mch-preview-note {
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
        .mpp-stat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 14px;
        }
        .mpp-stat-card {
          background: #141a18;
          border: 1px solid #1e2420;
          border-radius: 8px;
          padding: 14px;
        }
        .mpp-stat-label {
          font-size: 11px;
          color: #777;
          margin-bottom: 7px;
          display: flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
          letter-spacing: 0.11em;
          font-weight: 800;
        }
        .mpp-stat-icon {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          background: #0f1210;
          border: 1px solid #1e2420;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
        }
        .mpp-stat-value {
          font-size: 27px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.5px;
        }
        .mpp-stripe-banner {
          background: #141a18;
          border: 1px solid #1e2420;
          border-radius: 8px;
          padding: 13px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          gap: 12px;
        }
        .mpp-stripe-banner.connected {
          border-color: #1e3a2a;
          background: #0f1a14;
        }
        .mpp-stripe-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .mpp-stripe-icon {
          width: 22px;
          height: 15px;
          border-radius: 3px;
          background: #635bff;
          flex-shrink: 0;
        }
        .mpp-stripe-icon.connected { background: #1e3a2a; }
        .mpp-stripe-title {
          display: block;
          color: #fff;
          font-weight: 700;
          font-size: 12px;
          margin-bottom: 2px;
        }
        .mpp-stripe-sub { font-size: 11px; color: #aab4c8; }
        .mpp-stripe-connected {
          font-size: 11px;
          color: #4dca80;
          font-weight: 800;
          white-space: nowrap;
        }
        .mpp-section-head {
          font-size: 10px;
          font-weight: 800;
          color: #777;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .mpp-tab-row {
          display: flex;
          gap: 8px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }
        .mpp-tab-pill {
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          text-decoration: none;
          border: 1px solid #1e2420;
          color: #999;
          transition: all 0.15s;
          text-transform: uppercase;
          letter-spacing: 0.11em;
          background: transparent;
        }
        .mpp-tab-pill:hover {
          color: #f97316;
          border-color: rgba(249,115,22,0.35);
          background: rgba(249,115,22,0.06);
        }
        .mpp-tab-pill.active {
          background: rgba(249,115,22,0.08);
          color: #f97316;
          border-color: rgba(249,115,22,0.35);
        }
        .mpp-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 14px;
        }
        .mpp-bottom-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 10px;
        }
        .mpp-panel-title {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #fff;
        }
        .mpp-text-muted { color: #aab4c8; }
        .mpp-small {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #777;
          font-weight: 800;
        }
        .mpp-order-card,
        .mpp-mini-card,
        .mpp-info-card {
          background: #0b0f17;
          border: 1px solid #1e2420;
          border-radius: 8px;
          padding: 14px;
        }
        .mpp-order-card + .mpp-order-card { margin-top: 8px; }
        .mpp-mini-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .mpp-mini-card .label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #777;
          margin-bottom: 4px;
          font-weight: 800;
        }
        .mpp-mini-card .value {
          font-size: 18px;
          font-weight: 800;
          color: #fff;
        }
        @media (max-width: 900px) {
          .mpp-stat-grid,
          .mpp-two-col,
          .mpp-bottom-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="mch-preview-note">
        <span>Mock data only — shell matches the live merchant portal.</span>
        <Link href="/merchant/tutorial-preview" className="mpp-tab-pill active" style={{ textDecoration: "none" }}>
          View Tutorial
        </Link>
      </div>

      <div className="mpp-stat-grid">
        <div className="mpp-stat-card">
          <div className="mpp-stat-label">
            <div className="mpp-stat-icon">Order</div>
            Incoming Orders
          </div>
          <div className="mpp-stat-value">3</div>
        </div>
        <div className="mpp-stat-card">
          <div className="mpp-stat-label">
            <div className="mpp-stat-icon">Food</div>
            Menu Items
          </div>
          <div className="mpp-stat-value">42</div>
        </div>
        <div className="mpp-stat-card">
          <div className="mpp-stat-label">
            <div className="mpp-stat-icon">Revenue</div>
            Net Revenue
          </div>
          <div className="mpp-stat-value" style={{ color: "#f97316" }}>$82.05</div>
        </div>
      </div>

      <div className="mpp-stripe-banner connected">
        <div className="mpp-stripe-left">
          <div className="mpp-stripe-icon connected" />
          <div>
            <span className="mpp-stripe-title">Stripe account connected.</span>
            <span className="mpp-stripe-sub">This preview mirrors the live merchant workflow for orders, automation, and payouts.</span>
          </div>
        </div>
        <div className="mpp-stripe-connected">Done Payouts Active</div>
      </div>

      <div className="mpp-tab-row">
        <span className="mpp-tab-pill active">POS + API</span>
        <span className="mpp-tab-pill">Compliance</span>
        <span className="mpp-tab-pill">Storefront</span>
      </div>

      <div className="mpp-two-col">
        <div className="mpp-stat-card">
          <div className="mpp-small">Merchant Integration Hub</div>
          <div className="mpp-panel-title mt-2">Keep Everything Connected</div>
          <p className="mt-4 text-sm leading-6 text-[#aab4c8]">
            POS, compliance, storefront, and payments are grouped into one control area so the portal stays simple and easy to scan.
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <button className="portal-btn-gold portal-btn-gold-block opacity-60 cursor-not-allowed" type="button" disabled>
              POS + API
            </button>
            <button className="portal-btn-gold portal-btn-gold-block opacity-60 cursor-not-allowed" type="button" disabled>
              Compliance
            </button>
            <button className="portal-btn-outline portal-btn-outline-block opacity-60 cursor-not-allowed" type="button" disabled>
              Storefront
            </button>
            <button className="portal-btn-outline portal-btn-outline-block opacity-60 cursor-not-allowed" type="button" disabled>
              Stripe Connected
            </button>
          </div>
        </div>

        <div className="mpp-stat-card">
          <div className="mpp-small">Operations Assistant</div>
          <div className="mpp-panel-title mt-2">Support + Guidance</div>
          <div className="mt-5 space-y-3">
            {[
              { label: "Tutorials", value: "Available" },
              { label: "AI Support", value: "Ready" },
              { label: "Preview Mode", value: "Pilot build" },
            ].map((row) => (
              <div key={row.label} className="mpp-mini-card flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.12em] text-[#777]">{row.label}</span>
                <span className="text-sm font-bold text-white/80">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <button className="portal-btn-gold portal-btn-gold-block opacity-60 cursor-not-allowed" type="button" disabled>
              Tutorials On
            </button>
            <button className="portal-btn-outline portal-btn-outline-block opacity-60 cursor-not-allowed" type="button" disabled>
              Support Ready
            </button>
          </div>
        </div>
      </div>

      <div className="mpp-bottom-grid mt-3">
        <div className="mpp-stat-card">
          <div className="mpp-small">Live Orders</div>
          <div className="mpp-panel-title mt-2">Incoming Kitchen Queue</div>
          <div className="mt-5 space-y-3">
            {incomingOrders.map((order) => (
              <div key={order.name} className="mpp-order-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-[#777]">{order.status}</div>
                    <div className="mt-1 text-[15px] font-bold text-white">{order.name}</div>
                    <div className="mt-1 text-xs text-[#aab4c8]">{order.note}</div>
                  </div>
                  <div className="text-[15px] font-black text-[#f97316]">{order.total}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mpp-stat-card">
          <div className="mpp-small">Operations Snapshot</div>
          <div className="mpp-panel-title mt-2">Prep, Terminal, and Capacity</div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {opsRows.map((row) => (
              <div key={row.label} className="mpp-mini-card">
                <div className="label">{row.label}</div>
                <div className="value">{row.value}</div>
              </div>
            ))}
          </div>
          <div className="mpp-info-card mt-5">
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#777] font-black">Automation</div>
            <div className="mt-1 text-[15px] font-bold text-white">AutoPilot enabled with a 10 order capacity threshold.</div>
            <p className="mt-2 text-sm leading-6 text-[#aab4c8]">
              Busy windows and support controls stay visible so the merchant portal feels organized and easy to scan.
            </p>
          </div>
        </div>
      </div>
    </MerchantDashboardWrapper>
  );
}
