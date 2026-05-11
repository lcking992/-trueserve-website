"use client";

import { useEffect, useRef, useState } from "react";
import { driverLocChannel } from "@/lib/ramen/types";

interface Props {
  driverId: string;
  orderId?: string;
  /** Publish interval in ms. Default: 4000 */
  intervalMs?: number;
}

/**
 * Invisible component — mounts in the driver dashboard sidebar/layout,
 * obtains the browser geolocation every N seconds, and pushes the ping
 * to RAMEN via POST /api/ramen/publish.
 */
export default function DriverLocationTracker({ driverId, orderId, intervalMs = 4000 }: Props) {
  const [status, setStatus] = useState<"idle" | "tracking" | "denied">("idle");
  const lastPos = useRef<{ lat: number; lng: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const publish = (lat: number, lng: number, heading?: number) => {
      fetch("/api/ramen/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: driverLocChannel(driverId),
          type: "driver_location",
          payload: { driverId, orderId, lat, lng, heading },
        }),
      }).catch(() => {/* fire and forget */});
    };

    const tick = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lng, heading } = pos.coords;
          // Skip publish if position hasn't changed meaningfully (>~5 m)
          const prev = lastPos.current;
          if (prev) {
            const dlat = lat - prev.lat;
            const dlng = lng - prev.lng;
            const distDeg = Math.sqrt(dlat * dlat + dlng * dlng);
            if (distDeg < 0.00005) return; // ~5 m threshold
          }
          lastPos.current = { lat, lng };
          publish(lat, lng, heading ?? undefined);
          setStatus("tracking");
        },
        () => setStatus("denied"),
        { enableHighAccuracy: true, timeout: 5000 },
      );
    };

    tick(); // immediate first ping
    timerRef.current = setInterval(tick, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [driverId, orderId, intervalMs]);

  if (status === "denied") {
    return (
      <div style={{
        fontSize: 10, color: "#f87171", padding: "4px 10px",
        borderRadius: 6, background: "rgba(248,113,113,0.1)",
        border: "1px solid rgba(248,113,113,0.2)",
        display: "inline-flex", alignItems: "center", gap: 6,
      }}>
        <span>Warning</span> Location access denied — customers can't track you
      </div>
    );
  }

  if (status === "tracking") {
    return (
      <div style={{
        fontSize: 10, color: "#4dca80", padding: "4px 10px",
        borderRadius: 6, background: "rgba(77,202,128,0.08)",
        border: "1px solid rgba(77,202,128,0.2)",
        display: "inline-flex", alignItems: "center", gap: 6,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%", background: "#4dca80",
          animation: "ddPulse 1.4s ease-in-out infinite",
          flexShrink: 0,
        }} />
        Live location broadcasting
      </div>
    );
  }

  return null;
}
