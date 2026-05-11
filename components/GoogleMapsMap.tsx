"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, OverlayView } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '1rem'
};

interface RestaurantLocation {
    id: string;
    name: string;
    coords: [number, number]; // [lat, lng]
    image?: string;
    rotation?: number;
    tags?: string[];
}

interface MapProps {
    center: [number, number];
    zoom?: number;
    restaurants?: RestaurantLocation[];
}

import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_SCRIPT_ID, GOOGLE_MAPS_API_KEY } from "@/lib/maps-config";

function GoogleMapsMap({ center, zoom = 13, restaurants = [] }: MapProps) {
    const { isLoaded } = useJsApiLoader({
        id: GOOGLE_MAPS_SCRIPT_ID,
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const win = window as any;
        const previousAuthFailure = win.gm_authFailure;

        win.gm_authFailure = () => {
            setAuthError("Google Maps authorization failed for this domain. Allow this host in your Google Maps key restrictions.");
            if (typeof previousAuthFailure === "function") {
                previousAuthFailure();
            }
        };

        return () => {
            win.gm_authFailure = previousAuthFailure;
        };
    }, []);

    // Handle updates to center or restaurants
    useEffect(() => {
        if (!map) return;

        if (restaurants.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            restaurants.forEach(r => bounds.extend({ lat: r.coords[0], lng: r.coords[1] }));
            // Also include the "center" (user search location) in the bounds so it's not off-screen
            bounds.extend({ lat: center[0], lng: center[1] });
            map.fitBounds(bounds);
        } else {
            // No restaurants, just pan to the search location
            map.panTo({ lat: center[0], lng: center[1] });
            map.setZoom(zoom);
        }
    }, [map, center, restaurants, zoom]);

    if (!isLoaded) {
        return <div className="h-full w-full bg-slate-900 border border-white/5 animate-pulse rounded-xl flex items-center justify-center text-primary/50 font-bold tracking-widest text-sm uppercase">Loading Map...</div>;
    }

    if (!GOOGLE_MAPS_API_KEY) {
        return (
            <div className="h-full w-full bg-slate-900 rounded-xl flex items-center justify-center flex-col text-red-500 p-4 border border-red-500/20 text-center font-bold">
                <span className="text-2xl mb-2">Map</span>
                <span>Error: Missing Google Maps API Key</span>
                <span className="text-sm font-normal text-slate-400 mt-2">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file</span>
            </div>
        );
    }

    if (authError) {
        return (
            <div className="h-full w-full bg-slate-900 rounded-xl flex items-center justify-center flex-col text-red-500 p-4 border border-red-500/20 text-center font-bold">
                <span className="text-2xl mb-2">Map</span>
                <span>Google Maps authorization failed</span>
                <span className="text-sm font-normal text-slate-400 mt-2">{authError}</span>
            </div>
        );
    }

    return (
        <div className="h-full w-full rounded-xl overflow-hidden shadow-lg border border-white/10 relative z-0">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={{ lat: center[0], lng: center[1] }}
                zoom={zoom}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    styles: [
                        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                        {
                            featureType: "administrative.locality",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#d59563" }],
                        },
                        {
                            featureType: "poi",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#d59563" }],
                        },
                        {
                            featureType: "poi.park",
                            elementType: "geometry",
                            stylers: [{ color: "#263c3f" }],
                        },
                        {
                            featureType: "poi.park",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#6b9a76" }],
                        },
                        {
                            featureType: "road",
                            elementType: "geometry",
                            stylers: [{ color: "#38414e" }],
                        },
                        {
                            featureType: "road",
                            elementType: "geometry.stroke",
                            stylers: [{ color: "#212a37" }],
                        },
                        {
                            featureType: "road",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#9ca5b3" }],
                        },
                        {
                            featureType: "road.highway",
                            elementType: "geometry",
                            stylers: [{ color: "#746855" }],
                        },
                        {
                            featureType: "road.highway",
                            elementType: "geometry.stroke",
                            stylers: [{ color: "#1f2835" }],
                        },
                        {
                            featureType: "road.highway",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#f3d19c" }],
                        },
                        {
                            featureType: "water",
                            elementType: "geometry",
                            stylers: [{ color: "#17263c" }],
                        },
                        {
                            featureType: "water",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#515c6d" }],
                        },
                        {
                            featureType: "water",
                            elementType: "labels.text.stroke",
                            stylers: [{ color: "#17263c" }],
                        },
                    ]
                }}
            >
                {/* User Location Marker */}
                <Marker
                    position={{ lat: center[0], lng: center[1] }}
                    title="Search Location"
                    icon={{
                        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                    }}
                />

                {/* Restaurant Markers */}
                {restaurants.map(rest => {
                    // Use OverlayView for rotated markers (Driver)
                    if (rest.rotation !== undefined) {
                        return (
                            <OverlayView
                                key={rest.id}
                                position={{ lat: rest.coords[0], lng: rest.coords[1] }}
                                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                            >
                                <div style={{ transform: `translate(-50%, -50%) rotate(${rest.rotation}deg)` }} className="text-3xl filter drop-shadow-lg">
                                    Driver
                                </div>
                            </OverlayView>
                        );
                    }

                    // Standard Marker for others
                    return (
                        <Marker
                            key={rest.id}
                            position={{ lat: rest.coords[0], lng: rest.coords[1] }}
                            title={rest.name}
                            icon={rest.image ? {
                                url: rest.image,
                                scaledSize: new window.google.maps.Size(40, 40),
                                origin: new window.google.maps.Point(0, 0),
                                anchor: new window.google.maps.Point(20, 20)
                            } : undefined}
                        />
                    );
                })}
            </GoogleMap>
        </div>
    );
}

export default React.memo(GoogleMapsMap);
