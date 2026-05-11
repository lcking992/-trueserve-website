"use client";

import { useState } from "react";
import WelcomeAnimation from "@/components/WelcomeAnimation";

export default function WelcomeDemoPage() {
  const [active, setActive] = useState<"driver" | "merchant" | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: "#0c0f0d", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 40 }}>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>
        Welcome Animation · Demo
      </p>
      <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 900, marginBottom: 32, textAlign: "center" }}>
        Pick a role to preview
      </h1>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={() => setActive("driver")}
          style={{ padding: "16px 36px", background: "#3dd68c", color: "#0c0f0d", borderRadius: 14, fontWeight: 900, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", border: "none", cursor: "pointer" }}
        >
          Driver Driver Welcome
        </button>
        <button
          onClick={() => setActive("merchant")}
          style={{ padding: "16px 36px", background: "#f97316", color: "#0c0f0d", borderRadius: 14, fontWeight: 900, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", border: "none", cursor: "pointer" }}
        >
          Food Merchant Welcome
        </button>
      </div>

      {active === "driver" && (
        <WelcomeAnimation
          key={`driver-${Date.now()}`}
          name="Marcus"
          role="driver"
          forceShow
          stats={[
            { label: "Orders Nearby", value: "7" },
            { label: "Yesterday", value: "$84" },
            { label: "Rating", value: "4.9★" },
          ]}
        />
      )}

      {active === "merchant" && (
        <WelcomeAnimation
          key={`merchant-${Date.now()}`}
          name="Waldhorn Restaurant"
          role="merchant"
          forceShow
          stats={[
            { label: "Pending Orders", value: "3" },
            { label: "Today's Revenue", value: "$212" },
            { label: "Avg Prep", value: "18m" },
          ]}
        />
      )}
    </div>
  );
}
