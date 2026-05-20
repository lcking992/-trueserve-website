"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";

const STORAGE_KEYS = {
  address: "ts.delivery.address",
  lat: "ts.delivery.lat",
  lng: "ts.delivery.lng",
} as const;

export default function SavedDeliveryBar({ className = "" }: { className?: string }) {
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  useEffect(() => {
    try {
      setAddress(localStorage.getItem(STORAGE_KEYS.address)?.trim() || "");
      setLat(localStorage.getItem(STORAGE_KEYS.lat)?.trim() || "");
      setLng(localStorage.getItem(STORAGE_KEYS.lng)?.trim() || "");
    } catch { }
  }, []);

  const browseHref = useMemo(() => {
    if (!address) return "/restaurants";
    const params = new URLSearchParams({ address });
    if (lat && lng) {
      params.set("lat", lat);
      params.set("lng", lng);
    }
    return `/restaurants?${params.toString()}`;
  }, [address, lat, lng]);

  if (!address) return null;

  return (
    <div className={`saved-delivery-bar ${className}`}>
      <div className="saved-delivery-copy">
        <MapPin size={16} aria-hidden="true" />
        <span>
          <strong>Delivering to</strong>
          <small>{address}</small>
        </span>
      </div>
      <div className="saved-delivery-actions">
        <Link href={browseHref}>Browse</Link>
        <Link href="/restaurants">Change</Link>
      </div>
    </div>
  );
}
