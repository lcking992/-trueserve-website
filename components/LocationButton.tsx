"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LocationButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLocationClick = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Charlotte: 35.2271, -80.8431
            // Ramsey: 45.2611, -93.4566

            const distCharlotte = Math.sqrt(Math.pow(lat - 35.2271, 2) + Math.pow(lng - (-80.8431), 2));
            const distRamsey = Math.sqrt(Math.pow(lat - 45.2611, 2) + Math.pow(lng - (-93.4566), 2));

            // Rough degree to mile conversion: 1 deg ~ 69 miles. 50 miles ~ 0.72 deg
            const threshold = 5.0; // wildly generous "service area" for demo purposes (~300 miles)

            if (distCharlotte < distRamsey && distCharlotte < threshold) {
                router.push("?location=Charlotte, NC");
                router.refresh();
            } else if (distRamsey < distCharlotte && distRamsey < threshold) {
                router.push("?location=Ramsey, MN");
                router.refresh();
            } else {
                alert("We do not currently serve your area. Try searching for 'Charlotte' or 'Ramsey'.");
            }
            setLoading(false);
        }, (error) => {
            console.error(error);
            alert("Unable to retrieve your location");
            setLoading(false);
        });
    };

    return (
        <button
            type="button"
            onClick={handleLocationClick}
            className={`btn btn-sm md:btn-md btn-ghost join-item border-none hover:bg-white/10 px-3 h-full flex items-center justify-center ${loading ? 'loading' : ''}`}
            title="Use my location"
        >
            <span className="text-lg">{loading ? '' : 'Location'}</span>
        </button>
    );
}
