"use client";

import { useState, useRef, useEffect } from "react";
import { useJsApiLoader } from '@react-google-maps/api';
import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_SCRIPT_ID, GOOGLE_MAPS_API_KEY } from "@/lib/maps-config";

interface AddressInputProps {
    onAddressSelect: (address: string, lat: number | null, lng: number | null) => void;
    initialAddress?: string;
}

export default function AddressInput({ onAddressSelect, initialAddress = "" }: AddressInputProps) {
    const [inputValue, setInputValue] = useState(initialAddress);
    const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Sync input value with external prop changes
    useEffect(() => {
        if (initialAddress) {
            setInputValue(initialAddress);
        }
    }, [initialAddress]);

    // Services
    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
    const placesService = useRef<google.maps.places.PlacesService | null>(null);
    const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

    const { isLoaded } = useJsApiLoader({
        id: GOOGLE_MAPS_SCRIPT_ID,
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES
    });

    useEffect(() => {
        if (isLoaded && !autocompleteService.current && window.google) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
            sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
            const dummyElement = document.createElement('div');
            placesService.current = new window.google.maps.places.PlacesService(dummyElement);
        }
    }, [isLoaded]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        onAddressSelect(val, null, null);

        if (!val) {
            setPredictions([]);
            setIsDropdownOpen(false);
            return;
        }

        if (autocompleteService.current) {
            autocompleteService.current.getPlacePredictions({
                input: val,
                sessionToken: sessionToken.current || undefined,
            }, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    setPredictions(results);
                    setIsDropdownOpen(true);
                } else {
                    setPredictions([]);
                    setIsDropdownOpen(false);
                }
            });
        }
    };

    const handleSelectPrediction = (prediction: google.maps.places.AutocompletePrediction) => {
        setInputValue(prediction.description);
        setIsDropdownOpen(false);

        if (placesService.current && prediction.place_id) {
            try {
                placesService.current.getDetails({
                    placeId: prediction.place_id,
                    fields: ['geometry', 'formatted_address'],
                    sessionToken: sessionToken.current || undefined
                }, (place, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
                        const lat = place.geometry.location.lat();
                        const lng = place.geometry.location.lng();
                        const address = place.formatted_address || prediction.description;

                        // Reset session token
                        sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();

                        onAddressSelect(address, lat, lng);
                    } else {
                        console.warn("AddressInput getDetails failed:", status);
                    }
                });
            } catch (e) {
                console.error("AddressInput error in getDetails:", e);
            }
        }
    };

    if (!isLoaded) {
        return <div className="h-10 w-full bg-slate-800 animate-pulse rounded-lg"></div>;
    }

    return (
        <div className="relative w-full z-40">
            <div className="relative flex items-center bg-white/[0.03] border border-white/10 rounded-2xl focus-within:border-primary/40 transition-all overflow-hidden">
                <input
                    type="text"
                    placeholder="Enter street address..."
                    className="flex-1 min-w-0 w-full bg-transparent border-none focus:outline-none text-white placeholder:text-white/30 px-5 py-4 text-sm font-semibold pr-4 leading-snug"
                    value={inputValue}
                    onChange={handleInput}
                    onFocus={() => {
                        if (predictions.length > 0) setIsDropdownOpen(true);
                    }}
                    onBlur={() => {
                        setTimeout(() => setIsDropdownOpen(false), 200);
                    }}
                />
            </div>

            {isDropdownOpen && predictions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-[#0a0a0b]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-3xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                    {predictions.map((p) => (
                        <div
                            key={p.place_id}
                            className="px-8 py-4 hover:bg-primary/10 cursor-pointer border-b border-white/5 last:border-none transition-all group"
                            onMouseDown={() => handleSelectPrediction(p)}
                        >
                            <div className="font-bold text-white text-sm leading-snug break-words group-hover:text-primary transition-colors">{p.structured_formatting?.main_text || p.description}</div>
                            <div className="text-xs text-slate-500 font-semibold mt-1 leading-snug break-words">{p.structured_formatting?.secondary_text || ""}</div>
                        </div>
                    ))}
                    <div className="bg-black/50 px-4 py-2 flex justify-end">
                        <img src="https://developers.google.com/maps/documentation/images/powered_by_google_on_non_white.png" alt="Powered by Google" className="h-3 opacity-30 grayscale contrast-150" />
                    </div>
                </div>
            )}
        </div>
    );
}
