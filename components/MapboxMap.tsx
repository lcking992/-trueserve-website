"use client";

import React, { useRef, useState, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl, ScaleControl, GeolocateControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import Link from 'next/link';

// You need to add your Mapbox token to .env as NEXT_PUBLIC_MAPBOX_TOKEN
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface RestaurantLocation {
    id: string;
    name: string;
    coords: [number, number]; // [lat, lng]
    image?: string;
    rating?: number;
    tags?: string[];
    rotation?: number; // Added for vehicle bearing
}

interface MapProps {
    center: [number, number];
    zoom?: number;
    restaurants?: RestaurantLocation[];
}

export default function MapboxMap({ center, zoom = 13, restaurants = [] }: MapProps) {
    const [popupInfo, setPopupInfo] = useState<RestaurantLocation | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const mapRef = useRef<any>(null);

    // Initial View Store
    const initialViewState = useMemo(() => ({
        latitude: center[0],
        longitude: center[1],
        zoom: zoom
    }), [center, zoom]);

    const deg2rad = (deg: number) => {
        return deg * (Math.PI / 180);
    };

    // Calculate distance if available (Haversine formula for simple km/miles)
    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 3959; // Radius of the earth in miles
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in miles
        return d.toFixed(1);
    };

    // Markers
    const markers = useMemo(() => restaurants.map((rest) => (
        <Marker
            key={rest.id}
            latitude={rest.coords[0]}
            longitude={rest.coords[1]}
            anchor="center" // Center anchor is better for rotating vehicles
            onClick={(e) => {
                e.originalEvent.stopPropagation();
                setPopupInfo(rest);

                if (mapRef.current) {
                    if (userLocation) {
                        // Fit bounds to show both user and restaurant
                        const minLng = Math.min(userLocation[1], rest.coords[1]);
                        const maxLng = Math.max(userLocation[1], rest.coords[1]);
                        const minLat = Math.min(userLocation[0], rest.coords[0]);
                        const maxLat = Math.max(userLocation[0], rest.coords[0]);

                        // Add some padding
                        mapRef.current.fitBounds(
                            [[minLng, minLat], [maxLng, maxLat]],
                            { padding: 100, duration: 1000 }
                        );
                    } else {
                        // Just fly to the restaurant
                        mapRef.current.flyTo({
                            center: [rest.coords[1], rest.coords[0]],
                            zoom: 15,
                            duration: 1000
                        });
                    }
                }
            }}
        >
            <div
                className="cursor-pointer transition-transform duration-500 ease-linear" // Smooth rotation
                style={{ transform: `rotate(${rest.rotation || 0}deg)` }}
                role="img"
                aria-label="marker"
            >
                {rest.tags?.includes("Driver") ? (
                    <div className="text-3xl drop-shadow-md filter drop-shadow-lg">Driver</div>
                ) : (
                    <div className="text-3xl drop-shadow-md hover:scale-125 transition-transform">Location</div>
                )}
            </div>
        </Marker>
    )), [restaurants, userLocation]);

    if (!MAPBOX_TOKEN) {
        return (
            <div className="h-full w-full bg-slate-900 flex items-center justify-center text-red-400 p-6 text-center border border-red-500/20 rounded-xl">
                <div>
                    <h3 className="font-bold text-lg mb-2">Mapbox Token Missing</h3>
                    <p className="text-sm text-slate-400">
                        Please add <code className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">NEXT_PUBLIC_MAPBOX_TOKEN</code> to your .env file.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <Map
            ref={mapRef}
            initialViewState={initialViewState}
            style={{ width: '100%', height: '100%', borderRadius: '1rem' }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
        >
            <GeolocateControl
                position="top-left"
                onGeolocate={(e) => {
                    setUserLocation([e.coords.latitude, e.coords.longitude]);
                }}
            />
            <FullscreenControl position="top-left" />
            <NavigationControl position="top-left" />
            <ScaleControl />

            {markers}

            {popupInfo && (
                <Popup
                    anchor="top"
                    longitude={popupInfo.coords[1]}
                    latitude={popupInfo.coords[0]}
                    onClose={() => setPopupInfo(null)}
                    closeOnClick={false}
                    className="text-black"
                >
                    <div className="min-w-[200px]">
                        {popupInfo.image && (
                            <img src={popupInfo.image} alt={popupInfo.name} className="w-full h-24 object-cover rounded-t-lg mb-2" />
                        )}
                        <div className="p-2">
                            <h3 className="font-bold text-base mb-1">{popupInfo.name}</h3>
                            {popupInfo.rating && (
                                <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
                                    <span className="text-yellow-500">★</span> {popupInfo.rating}
                                </div>
                            )}

                            {userLocation && (
                                <div className="text-xs text-emerald-600 font-bold mb-2 flex items-center gap-1">
                                    <span>Walk</span> {getDistance(userLocation[0], userLocation[1], popupInfo.coords[0], popupInfo.coords[1])} miles away
                                </div>
                            )}

                            {/* Only show menu link if it's not a driver or purely informational marker */}
                            {!popupInfo.tags?.includes("Driver") && (
                                <Link href={`/restaurants/${popupInfo.id}`} className="block w-full text-center bg-primary text-black text-xs font-bold py-1.5 rounded mt-2 hover:opacity-90">
                                    View Menu
                                </Link>
                            )}
                        </div>
                    </div>
                </Popup>
            )}
        </Map>
    );
}
