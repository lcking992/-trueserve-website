"use client";

import { useState, useEffect } from "react";
import MapWithDirections from "./MapWithDirections";
import { triggerZeroWaitHandoff } from "@/app/driver/actions";

interface ActiveOrderNavigationProps {
    order: any;
    driverLat: number;
    driverLng: number;
}

export default function ActiveOrderNavigation({ order, driverLat, driverLng }: ActiveOrderNavigationProps) {
    const [steps, setSteps] = useState<any[]>([]);
    const [eta, setEta] = useState<string>("Calculating...");
    const [isArriving, setIsArriving] = useState(false);

    const isPickedUp = order.status === 'PICKED_UP';
    const destinationPos = isPickedUp
        ? { lat: Number(order.deliveryLat), lng: Number(order.deliveryLng) }
        : { lat: Number(order.restaurant.lat), lng: Number(order.restaurant.lng) };

    return (
        <div className="card bg-slate-900 border-white/10 overflow-hidden mb-8 shadow-2xl">
            {/* Map Header */}
            <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Live Navigation</h4>
                </div>
                <div className="flex items-center gap-3">
                    {!isPickedUp && (
                        <button 
                            onClick={async () => {
                                setIsArriving(true);
                                await triggerZeroWaitHandoff(order.id);
                            }}
                            disabled={isArriving}
                            className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all
                                ${isArriving 
                                    ? 'bg-primary/20 text-primary border border-primary/30' 
                                    : 'bg-white/10 text-white hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/10'}`}
                        >
                            {isArriving ? "Restaurant Pinged Fast" : "Zero-Wait Ping"}
                        </button>
                    )}
                    <div className="bg-black/40 px-3 py-1 rounded border border-white/5 flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">ETA:</span>
                        <span className="text-xs font-black text-primary">{eta}</span>
                    </div>
                </div>
            </div>

            {/* Map Component */}
            <div className="h-[300px] w-full relative">
                <MapWithDirections
                    origin={{ lat: driverLat, lng: driverLng }}
                    destination={destinationPos}
                    showDriver={true}
                    onDurationUpdate={(duration) => {
                        setEta(duration);
                        // Auto-ping restaurant if driver is less than 3 minutes away
                        if (!isPickedUp && !isArriving && (duration.includes("1 min") || duration.includes("2 min") || duration.includes("3 min"))) {
                            setIsArriving(true);
                            triggerZeroWaitHandoff(order.id).catch(console.error);
                        }
                    }}
                    onStepsUpdate={setSteps}
                />

                {/* Special Instructions Overlay (Bottom) */}
                {order.deliveryInstructions && (
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                        <div className="bg-orange-500/90 backdrop-blur-md p-3 rounded-xl border border-orange-400 shadow-xl flex items-center gap-3">
                            <span className="text-xl">Note</span>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-orange-950/70 mb-0.5">Instruction</p>
                                <p className="text-xs font-bold text-orange-950 leading-tight">{order.deliveryInstructions}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Step by Step Drawer */}
            <div className="max-h-[200px] overflow-y-auto bg-black/40 backdrop-blur-xl border-t border-white/5 custom-scrollbar">
                <div className="p-4 space-y-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Upcoming Maneuvers</p>
                    {steps.length > 0 ? (
                        steps.slice(0, 5).map((step, i) => (
                            <div key={i} className="flex gap-4 items-start py-2 border-b border-white/5 last:border-0">
                                <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-xs shrink-0 text-slate-400 border border-white/5">{i + 1}</span>
                                <div className="space-y-1">
                                    <div
                                        className="text-xs text-slate-200 font-medium leading-normal"
                                        dangerouslySetInnerHTML={{ __html: step.instructions }}
                                    />
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-primary">{step.distance.text}</span>
                                        <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                                        <span className="text-[10px] text-slate-500 font-medium">{step.duration.text}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-4 text-center">
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Awaiting Route steps...</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 bg-emerald-500/10 border-t border-emerald-500/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm">Location</div>
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Target</p>
                        <p className="text-[10px] font-bold text-emerald-100 truncate max-w-[150px]">
                            {isPickedUp ? order.deliveryAddress : order.restaurant.name}
                        </p>
                    </div>
                </div>
                <button className="text-[9px] font-black uppercase tracking-[0.2em] text-primary hover:underline">
                    View Full Details
                </button>
            </div>
        </div>
    );
}
