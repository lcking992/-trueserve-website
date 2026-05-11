
"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function MerchantRealtime({ restaurantId }: { restaurantId: string }) {
    const supabase = createClient();
    const router = useRouter();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Initialize audio
        audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        
        const channel = supabase
            .channel(`merchant-orders-${restaurantId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'Order',
                    filter: `restaurantId=eq.${restaurantId}`
                },
                (payload: any) => {
                    console.log('New Order Received!', payload);
                    
                    // Play sound
                    if (audioRef.current) {
                        audioRef.current.play().catch(e => console.warn("Audio play blocked by browser:", e));
                    }

                    // Refresh page data to show new order
                    router.refresh();

                    // Optional: Show visual notification
                    if ("Notification" in window && Notification.permission === "granted") {
                        new Notification("New Order! Order", {
                            body: "A new order has arrived. Open the dashboard to view details.",
                            icon: "/logo.png"
                        });
                    }
                }
            )
            .subscribe();

        // Request notification permission on first mount
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }

        return () => {
            supabase.removeChannel(channel);
        };
    }, [restaurantId, supabase, router]);

    return null; // This is a logic-only component
}
