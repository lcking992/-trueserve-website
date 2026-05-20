
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker, OverlayView } from '@react-google-maps/api';
import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_SCRIPT_ID, GOOGLE_MAPS_API_KEY } from "@/lib/maps-config";

const baseContainerStyle = {
    width: '100%',
    borderRadius: '1rem'
};

interface MapWithDirectionsProps {
    origin?: string | google.maps.LatLngLiteral;
    destination?: string | google.maps.LatLngLiteral;
    routeOrigin?: string | google.maps.LatLngLiteral; // For calculating the blue line (stable)
    driverRotation?: number;
    showDriver?: boolean;
    height?: number | string;
    onDurationUpdate?: (duration: string) => void;
    onDistanceUpdate?: (distance: string) => void;
    onStepsUpdate?: (steps: any[]) => void;
    onDestinationChange?: (destination: google.maps.LatLngLiteral) => void;
    destinationDraggable?: boolean;
}

export default function MapWithDirections({
    origin,
    destination,
    routeOrigin,
    driverRotation = 0,
    showDriver = true,
    height = 400,
    onDurationUpdate,
    onDistanceUpdate,
    onStepsUpdate,
    onDestinationChange,
    destinationDraggable = false
}: MapWithDirectionsProps) {
    const { isLoaded } = useJsApiLoader({
        id: GOOGLE_MAPS_SCRIPT_ID,
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES
    });



    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [tilesLoaded, setTilesLoaded] = useState(false);
    const mapHeight = typeof height === "number" ? `${height}px` : height;
    const containerStyle = { ...baseContainerStyle, height: mapHeight };

    useEffect(() => {
        if (typeof window === "undefined") return;

        const win = window as any;
        const previousAuthFailure = win.gm_authFailure;

        win.gm_authFailure = () => {
            setError("Google Maps authorization failed for this domain. Allow this host in your Google Maps key restrictions.");
            if (typeof previousAuthFailure === "function") {
                previousAuthFailure();
            }
        };

        return () => {
            win.gm_authFailure = previousAuthFailure;
        };
    }, []);

    // Use routeOrigin (Restaurant) for the path if provided, otherwise stick to origin (Driver)
    // This allows the path to be stable (Restaurant -> Customer) while the car moves
    const startPoint = routeOrigin || origin;

    // Fetch Directions Imperatively - Only if startPoint or destination changes
    useEffect(() => {
        if (!isLoaded || !startPoint || !destination) {
            return;
        }

        setError(null); // Reset error
        setDirections(null);
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route({
            origin: startPoint,
            destination: destination,
            travelMode: window.google.maps.TravelMode.DRIVING,
            provideRouteAlternatives: false
        }, (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK && result) {
                setDirections(result);
                if (onDurationUpdate && result.routes[0]?.legs[0]?.duration?.text) {
                    onDurationUpdate(result.routes[0].legs[0].duration.text);
                }
                if (onDistanceUpdate && result.routes[0]?.legs[0]?.distance?.text) {
                    onDistanceUpdate(result.routes[0].legs[0].distance.text);
                }
                if (onStepsUpdate && result.routes[0]?.legs[0]?.steps) {
                    onStepsUpdate(result.routes[0].legs[0].steps);
                }
            } else {
                console.error(`Directions request failed due to ${status}`);
                setError(`Route Error: ${status}`);
            }
        });

    }, [destination, isLoaded, onDistanceUpdate, onDurationUpdate, onStepsUpdate, startPoint]);


    const mapRef = React.useRef<google.maps.Map | null>(null);
    const onLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
        setTilesLoaded(false);
        window.google.maps.event.addListenerOnce(map, "tilesloaded", () => {
            setTilesLoaded(true);
        });
    }, []);

    // Fit bounds when directions load
    useEffect(() => {
        if (directions && mapRef.current) {
            const bounds = new window.google.maps.LatLngBounds();
            // Also fit the route bounds if available
            if (directions.routes[0]?.bounds) {
                mapRef.current.fitBounds(directions.routes[0].bounds);
            } else {
                if (startPoint && typeof startPoint === 'object' && 'lat' in startPoint) bounds.extend(startPoint);
                if (destination && typeof destination === 'object' && 'lat' in destination) bounds.extend(destination);
                if (!bounds.isEmpty()) mapRef.current.fitBounds(bounds);
            }
        }
    }, [directions, startPoint, destination]);

    useEffect(() => {
        if (!isLoaded || !startPoint || !destination || directions || error || tilesLoaded) return;

        const timeoutId = window.setTimeout(() => {
            setError("Route preview is temporarily unavailable. Please continue checkout or open full maps tracking after order placement.");
        }, 8000);

        return () => window.clearTimeout(timeoutId);
    }, [destination, directions, error, isLoaded, startPoint, tilesLoaded]);


    // Guard: show clear error if API key is missing
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
        return (
            <div className="h-full w-full min-h-[300px] bg-slate-900 rounded-2xl flex flex-col items-center justify-center gap-4 border border-red-500/30 p-6 text-center" style={{ height: mapHeight }}>
                <span className="text-4xl">Map</span>
                <div>
                    <p className="font-black text-red-400 text-sm mb-1">Google Maps API Key Missing</p>
                    <p className="text-xs text-slate-400 max-w-xs">
                        Add <code className="bg-white/10 px-1 py-0.5 rounded text-primary text-[10px]">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your <code className="bg-white/10 px-1 py-0.5 rounded text-[10px]">.env.local</code> file and restart the dev server.
                    </p>
                    <a
                        href="https://console.cloud.google.com/apis/credentials"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                    >
                        Get API Key →
                    </a>
                </div>
            </div>
        );
    }

    if (!isLoaded) return (
        <div style={{ width: '100%', height: mapHeight, background: '#0f1210', border: '1px solid #1e2420', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Loading map…
        </div>
    );

    if (error) {
        return (
            <div style={{
                width: '100%', height: mapHeight,
                background: '#0f1210', border: '1px solid rgba(232,64,64,0.25)',
                borderRadius: 10, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '16px', textAlign: 'center', gap: 6,
            }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#e84040', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Map unavailable
                </div>
                <div style={{ fontSize: 10, color: '#555', maxWidth: 220, lineHeight: 1.5 }}>
                    {error.includes('authorization') ? 'API key domain restriction — add this host in Google Cloud Console.' : error}
                </div>
            </div>
        );
    }

    // Standard Light Mode (Matches reference image)
    const defaultLightStyle: google.maps.MapTypeStyle[] = [];

    // Center map on origin first, otherwise route start/destination.
    const mapCenter =
        (typeof origin === 'object' && origin !== null && 'lat' in origin)
            ? origin
            : ((typeof startPoint === 'object' && startPoint !== null && 'lat' in startPoint)
                ? startPoint
                : ((typeof destination === 'object' && destination !== null && 'lat' in destination)
                    ? destination
                    : null));

    if (!mapCenter) {
        return (
            <div style={{ width: '100%', height: mapHeight, background: '#0f1210', border: '1px solid #1e2420', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Waiting for route coordinates…
            </div>
        );
    }

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={14} // Zoomed in slightly more for better view
            onLoad={onLoad}
            options={{
                styles: defaultLightStyle,
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
            }}
        >
            {/* 1. The Route Line - Google Blue */}
            {directions && (
                <DirectionsRenderer
                    options={{
                        directions: directions,
                        suppressMarkers: true,
                        polylineOptions: {
                            strokeColor: "#4285F4", // Google Blue
                            strokeWeight: 6,
                            strokeOpacity: 0.8,
                        }
                    }}
                />
            )}

            {/* 0. Restaurant/Start Marker - Only if routeOrigin is coordinates */}
            {routeOrigin && typeof routeOrigin === 'object' && (
                <Marker
                    position={routeOrigin}
                    title="Restaurant"
                    label={{
                        text: "Restaurant",
                        fontSize: "20px"
                    }}
                />
            )}

            {/* 2. Driver Marker (Rotated Car) - Only define if origin is coordinates */}
            {origin && typeof origin === 'object' && showDriver && (
                <OverlayView
                    position={origin}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                    <div className="relative flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
                        {/* Radar Pulse Effect */}
                        <div className="absolute w-16 h-16 bg-blue-500/20 border-2 border-blue-500/40 rounded-full animate-ping pointer-events-none"></div>
                        <div className="absolute w-24 h-24 bg-blue-500/10 rounded-full animate-pulse blur-sm pointer-events-none"></div>

                        {/* Vehicle Icon */}
                        <div
                            className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-2xl border-2 border-blue-500 z-10 duration-1000 ease-in-out transition-transform"
                            style={{
                                '--driver-rotation': `${driverRotation}deg`,
                                transform: 'rotate(var(--driver-rotation))',
                                filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))',
                            } as React.CSSProperties}
                        >
                            Driver
                        </div>
                    </div>
                </OverlayView>
            )}

            {/* 4. Route Info Overlay (Mimics User Reference Image) */}
            {directions && directions.routes[0] && directions.routes[0].legs[0] && (() => {
                const leg = directions.routes[0].legs[0];
                const steps = leg.steps;
                // Find a midpoint step for the label position
                const midStepIndex = Math.floor(steps.length / 2);
                const infoPosition = steps[midStepIndex]?.end_location || leg.end_location;

                return (
                    <OverlayView
                        position={infoPosition}
                        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                        <div className="bg-white px-3 py-2 rounded-lg shadow-xl border border-slate-200 transform -translate-x-1/2 -translate-y-[120%] flex flex-col items-center min-w-[120px]">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg font-bold text-slate-800">{leg.duration?.text || "Calculating..."}</span>
                            </div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                {leg.distance?.text || ""}
                            </div>
                            {/* Little triangle arrow at bottom */}
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white filter drop-shadow-sm"></div>
                        </div>
                    </OverlayView>
                );
            })()}

            {/* 3. Destination Marker (Customer) - Red Pin - Only define if destination is coordinates */}
            {destination && typeof destination === 'object' && (
                <Marker
                    position={destination}
                    title="Delivery Location"
                    draggable={destinationDraggable}
                    onDragEnd={(event) => {
                        const lat = event.latLng?.lat();
                        const lng = event.latLng?.lng();
                        if (typeof lat === "number" && typeof lng === "number") {
                            onDestinationChange?.({ lat, lng });
                        }
                    }}
                    animation={typeof google !== 'undefined' ? google.maps.Animation.DROP : undefined}
                />
            )}
        </GoogleMap>
    );
}
