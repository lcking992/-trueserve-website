"use client";

import { useState } from "react";
import { initiateMaskedCall } from "@/app/driver/actions";

export default function DriverCallButton({ orderId }: { orderId: string }) {
    const [loading, setLoading] = useState(false);

    const handleCall = async () => {
        setLoading(true);
        try {
            const res = await initiateMaskedCall(orderId);
            if (res.error) {
                alert(res.error);
                return;
            }
            if (res.maskedUri) {
                // Navigate to the masked tel: link which will open the native phone dialer safely
                window.location.href = res.maskedUri;
            }
        } catch (e: any) {
            alert("Call masking failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleCall}
            disabled={loading}
            className={`btn bg-white/10 text-white px-4 flex items-center justify-center border border-white/10 hover:bg-emerald-500/20 transition-all text-lg ${loading ? 'opacity-50 animate-pulse' : ''}`}
            title="Call Customer (Masked)"
        >
            Phone
        </button>
    );
}
