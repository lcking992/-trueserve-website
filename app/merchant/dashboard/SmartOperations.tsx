"use client";

import { useState } from "react";
import { upsertBusyZone, deleteBusyZone, updateAutoPilotSettings } from "../actions";

interface SmartOperationsProps {
    restaurantId: string;
    schedules: any[];
    autoPilotEnabled: boolean;
    capacityThreshold: number;
}

export default function SmartOperations({
    restaurantId,
    schedules,
    autoPilotEnabled,
    capacityThreshold
}: SmartOperationsProps) {
    const [isAddingZone, setIsAddingZone] = useState(false);
    const [threshold, setThreshold] = useState(capacityThreshold);
    const [autoPilot, setAutoPilot] = useState(autoPilotEnabled);

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const handleToggleAutoPilot = async () => {
        const next = !autoPilot;
        setAutoPilot(next);
        await updateAutoPilotSettings(restaurantId, next, threshold);
    };

    const handleThresholdChange = async (val: number) => {
        setThreshold(val);
        await updateAutoPilotSettings(restaurantId, autoPilot, val);
    };

    const handleAddZone = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            dayOfWeek: parseInt(formData.get("dayOfWeek") as string),
            startTime: formData.get("startTime") as string,
            endTime: formData.get("endTime") as string,
            extraPrepTime: parseInt(formData.get("extraPrepTime") as string),
            action: formData.get("action") as string
        };
        await upsertBusyZone(restaurantId, data);
        setIsAddingZone(false);
    };

    const handleDeleteZone = async (id: string) => {
        await deleteBusyZone(id);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* AI Auto-Pilot Card */}
            <div className="card bg-indigo-500/5 border-indigo-500/20 p-6 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-100">
                            <span></span> AI Auto-Pilot
                        </h3>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={autoPilot} onChange={handleToggleAutoPilot} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                        </label>
                    </div>

                    <p className="text-xs text-slate-400 mb-8 leading-relaxed">
                        When enabled, TrueServe AI monitors your kitchen load. If pending orders exceed your capacity, it initiates a 15-minute "Smart Pause" to let you catch up.
                    </p>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Capacity Threshold</label>
                            <span className="text-sm font-black text-indigo-400">{threshold} Orders</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={threshold}
                            onChange={(e) => setThreshold(parseInt(e.target.value))}
                            onMouseUp={() => handleThresholdChange(threshold)}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                        <div className="flex justify-between text-[8px] text-slate-600 font-bold uppercase tracking-tighter">
                            <span>Boutique (5)</span>
                            <span>High Volume (30+)</span>
                        </div>
                    </div>
                </div>

                <div className={`mt-8 p-4 rounded-2xl border ${autoPilot ? 'bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'bg-slate-900/50 border-white/5 opacity-50'}`}>
                    <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">Current Status</p>
                    <p className="text-sm font-bold text-white">
                        {autoPilot ? "Monitoring active load..." : "Auto-Pilot Offline"}
                    </p>
                </div>
            </div>

            {/* Recurring Busy Zones Card */}
            <div className="lg:col-span-2 card bg-white/5 border-white/10 p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white">Recurring Busy Zones</h3>
                        <p className="text-xs text-slate-500">Proactively manage known rush hours (e.g. Friday nights).</p>
                    </div>
                    <button
                        onClick={() => setIsAddingZone(true)}
                        className="btn btn-primary text-[10px] px-4 py-2"
                    >
                        Add Zone
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {schedules.map((zone) => (
                        <div key={zone.id} className="group relative bg-white/5 border border-white/5 rounded-2xl p-4 hover:border-white/20 transition-all">
                            <button
                                onClick={() => handleDeleteZone(zone.id)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                ×
                            </button>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">{days[zone.dayOfWeek]}s</span>
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${zone.action === 'PAUSE' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                    {zone.action === 'PAUSE' ? 'Auto-Pause' : `+${zone.extraPrepTime}m Buffer`}
                                </span>
                            </div>
                            <p className="text-lg font-black text-white">
                                {zone.startTime.slice(0, 5)} - {zone.endTime.slice(0, 5)}
                            </p>
                        </div>
                    ))}

                    {schedules.length === 0 && !isAddingZone && (
                        <div className="col-span-2 py-12 text-center border border-dashed border-white/10 rounded-2xl">
                            <p className="text-slate-500 italic text-sm">No scheduled busy zones yet.</p>
                        </div>
                    )}
                </div>

                {/* Add Zone Modal Overlay */}
                {isAddingZone && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsAddingZone(false)}></div>
                        <form onSubmit={handleAddZone} className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl animate-fade-in-up">
                            <h3 className="text-2xl font-black mb-6">Create Busy Zone</h3>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Repeat On</label>
                                    <select name="dayOfWeek" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-primary/50">
                                        {days.map((day, idx) => <option key={day} value={idx}>{day}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Start Time</label>
                                        <input type="time" name="startTime" defaultValue="18:00" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-primary/50" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">End Time</label>
                                        <input type="time" name="endTime" defaultValue="20:00" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-primary/50" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">System Action</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <label className="cursor-pointer">
                                            <input type="radio" name="action" value="BUFFER" defaultChecked className="peer sr-only" />
                                            <div className="p-3 text-center rounded-xl border border-white/10 peer-checked:border-primary peer-checked:bg-primary/10 text-xs font-bold transition-all">Add Buffer</div>
                                        </label>
                                        <label className="cursor-pointer">
                                            <input type="radio" name="action" value="PAUSE" className="peer sr-only" />
                                            <div className="p-3 text-center rounded-xl border border-white/10 peer-checked:border-red-500 peer-checked:bg-red-500/10 text-xs font-bold transition-all">Full Pause</div>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Extra Prep Time (mins)</label>
                                    <input type="number" name="extraPrepTime" defaultValue="15" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-primary/50" />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button type="button" onClick={() => setIsAddingZone(false)} className="flex-1 btn btn-outline py-4 text-xs font-black uppercase tracking-widest border-white/10">Cancel</button>
                                <button type="submit" className="flex-1 btn btn-primary py-4 text-xs font-black uppercase tracking-widest">Create Schedule</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
