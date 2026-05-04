"use client";

import Link from "next/link";

type InlineSupportEntryProps = {
  kicker: string;
  title: string;
  detail: string;
  prefill: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export default function InlineSupportEntry({
  kicker,
  title,
  detail,
  prefill,
  primaryLabel = "Open Support",
  secondaryHref,
  secondaryLabel,
}: InlineSupportEntryProps) {
  const handleOpenSupport = () => {
    try {
      window.dispatchEvent(new CustomEvent("ts:support:open", { detail: { prefill } }));
    } catch {
      window.location.href = "/contact";
    }
  };

  return (
    <div
      style={{
        background: "rgba(249,115,22,0.07)",
        border: "1px solid rgba(249,115,22,0.18)",
        borderRadius: 12,
        padding: "16px 18px",
        marginBottom: 14,
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 800, color: "#f97316", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>
        {kicker}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.68)", lineHeight: 1.6, marginBottom: 14 }}>
        {detail}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={handleOpenSupport}
          style={{
            background: "#f97316",
            color: "#000",
            border: "none",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          {primaryLabel}
        </button>
        {secondaryHref && secondaryLabel ? (
          <Link
            href={secondaryHref}
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
