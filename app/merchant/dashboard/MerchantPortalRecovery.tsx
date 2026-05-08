import Link from "next/link";

export default function MerchantPortalRecovery() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 640, border: "1px solid rgba(249,115,22,0.22)", background: "rgba(249,115,22,0.08)", borderRadius: 12, padding: 22 }}>
        <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#f97316" }}>
          Merchant portal needs review
        </p>
        <h1 style={{ margin: "0 0 10px", fontSize: 24, color: "#fff", fontWeight: 900 }}>
          We could not load a restaurant for this login.
        </h1>
        <p style={{ margin: "0 0 18px", color: "rgba(255,255,255,0.68)", lineHeight: 1.6 }}>
          You are signed in, but the restaurant record is not attached to this session. Log out and sign back in, or have TrueServe support reconnect the merchant account.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/merchant/login" className="mch-stripe-connect-btn" style={{ textDecoration: "none" }}>
            Back to merchant login
          </Link>
          <Link href="/contact" className="mch-stripe-connect-btn" style={{ textDecoration: "none", background: "rgba(255,255,255,0.08)", color: "#fff" }}>
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}
