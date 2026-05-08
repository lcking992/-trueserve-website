"use client";

import { useState } from "react";
import { CalendarClock, Clock3, Plus, Trash2 } from "lucide-react";
import { upsertBusyZone, deleteBusyZone } from "../actions";

interface BusyZonesPanelProps {
    restaurantId: string;
    schedules: any[];
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function BusyZonesPanel({ restaurantId, schedules: initialSchedules }: BusyZonesPanelProps) {
    const [schedules, setSchedules] = useState(initialSchedules);
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const data = {
            dayOfWeek: parseInt(fd.get("dayOfWeek") as string),
            startTime: fd.get("startTime") as string,
            endTime: fd.get("endTime") as string,
            extraPrepTime: parseInt(fd.get("extraPrepTime") as string),
            action: fd.get("action") as string
        };
        await upsertBusyZone(restaurantId, data);
        setIsAdding(false);
    };

    const handleDelete = async (id: string) => {
        await deleteBusyZone(id);
        setSchedules(schedules.filter((s) => s.id !== id));
    };

    return (
        <>
            <style>{`
                .bz-panel {
                    background: linear-gradient(180deg, #111713 0%, #0d110f 100%);
                    border: 1px solid #202a24;
                    border-radius: 14px;
                    padding: 18px;
                    min-height: 100%;
                    box-shadow: 0 16px 40px rgba(0,0,0,.18);
                }
                .bz-hd { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
                .bz-title-row { display: flex; align-items: flex-start; gap: 12px; }
                .bz-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    border: 1px solid rgba(249,115,22,.24);
                    background: rgba(249,115,22,.1);
                    color: #f97316;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .bz-kicker {
                    margin: 0 0 4px;
                    color: #7d867f;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: .14em;
                    text-transform: uppercase;
                }
                .bz-title { margin: 0; font-size: 18px; font-weight: 900; color: #fff; letter-spacing: -0.01em; }
                .bz-add-btn {
                    min-height: 38px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    border-radius: 10px;
                    font-size: 10px; font-weight: 900; letter-spacing: 0.11em; text-transform: uppercase;
                    color: #071009; background: #f97316; border: 1px solid #f97316;
                    padding: 0 13px; cursor: pointer; font: inherit;
                    white-space: nowrap;
                }
                .bz-add-btn:hover { background: #ff8a35; }
                .bz-desc { font-size: 13px; color: #a3aca6; margin: 0 0 16px; line-height: 1.55; max-width: 620px; }
                .bz-empty {
                    min-height: 104px;
                    background: rgba(255,255,255,.025); border: 1px dashed #2a342e; border-radius: 12px; padding: 18px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #8c968f;
                    font-size: 13px;
                    line-height: 1.45;
                }
                .bz-zone-list { display: flex; flex-direction: column; gap: 8px; }
                .bz-zone-item {
                    background: rgba(255,255,255,.025); border: 1px solid #202a24; border-radius: 12px; padding: 12px 13px;
                    display: flex; align-items: center; justify-content: space-between; gap: 12px;
                }
                .bz-zone-info { display: flex; align-items: center; gap: 7px; font-size: 13px; color: #dce2df; }
                .bz-zone-day { font-size: 10px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: #f97316; margin-bottom: 4px; }
                .bz-zone-del {
                    background: rgba(255,255,255,.035); border: 1px solid #2a342e; color: #909991;
                    width: 34px; height: 34px; border-radius: 10px; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                }
                .bz-zone-del:hover { border-color: #e24b4a; color: #e24b4a; }

                /* Add zone modal */
                .bz-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.78); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(8px); }
                .bz-modal { background: #101611; border: 1px solid #28342d; border-radius: 14px; padding: 24px; width: 100%; max-width: 440px; position: relative; box-shadow: 0 24px 80px rgba(0,0,0,.4); }
                .bz-modal-title { font-size: 22px; font-weight: 900; color: #fff; margin-bottom: 20px; letter-spacing: -0.01em; }
                .bz-field { margin-bottom: 14px; }
                .bz-label { font-size: 10px; font-weight: 900; letter-spacing: .13em; text-transform: uppercase; color: #7d867f; display: block; margin-bottom: 7px; }
                .bz-input, .bz-select {
                    width: 100%; min-height: 44px; border-radius: 10px; background: #090d0b; border: 1px solid #28342d; color: #eef2ef;
                    font: inherit; font-size: 13px; padding: 0 12px; outline: none;
                }
                .bz-input:focus, .bz-select:focus { border-color: #f97316; }
                .bz-actions { display: flex; gap: 8px; margin-top: 20px; }
                .bz-cancel {
                    min-height: 44px; border-radius: 10px; font-size: 11px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase;
                    padding: 0 18px; background: rgba(255,255,255,.04); border: 1px solid #28342d; color: #d7dfda;
                    cursor: pointer; font: inherit;
                }
                .bz-submit {
                    min-height: 44px; border-radius: 10px; font-size: 11px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase;
                    padding: 0 18px; background: #f97316; border: none; color: #071009;
                    cursor: pointer; flex: 1; font: inherit;
                }
                @media (max-width: 680px) {
                    .bz-panel { padding: 16px; }
                    .bz-hd { flex-direction: column; }
                    .bz-add-btn { width: 100%; }
                }
            `}</style>

            <div className="bz-panel">
                <div className="bz-hd">
                    <div className="bz-title-row">
                        <div className="bz-icon"><CalendarClock size={19} /></div>
                        <div>
                            <p className="bz-kicker">Rush planning</p>
                            <h2 className="bz-title">Busy hour schedule</h2>
                        </div>
                    </div>
                    <button className="bz-add-btn" onClick={() => setIsAdding(true)}>
                        <Plus size={15} />
                        Add zone
                    </button>
                </div>
                <p className="bz-desc">Add repeat windows for dinner rushes, weekend spikes, or catering blocks so prep times adjust before orders pile up.</p>

                {schedules.length === 0 ? (
                    <div className="bz-empty">
                        <Clock3 size={18} />
                        No busy windows are scheduled yet. Add one for predictable rush periods.
                    </div>
                ) : (
                    <div className="bz-zone-list">
                        {schedules.map((zone) => (
                            <div key={zone.id} className="bz-zone-item">
                                <div>
                                    <div className="bz-zone-day">{DAYS[zone.dayOfWeek]}s</div>
                                    <div className="bz-zone-info"><Clock3 size={14} /> {zone.startTime?.slice(0, 5)} – {zone.endTime?.slice(0, 5)}</div>
                                </div>
                                <button className="bz-zone-del" onClick={() => handleDelete(zone.id)} aria-label="Delete zone"><Trash2 size={15} /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isAdding && (
                <div className="bz-modal-bg" onClick={() => setIsAdding(false)}>
                    <div className="bz-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="bz-modal-title">Create Busy Zone</div>
                        <form onSubmit={handleAdd}>
                            <div className="bz-field">
                                <label className="bz-label" htmlFor="bz-day">Repeat On</label>
                                <select id="bz-day" name="dayOfWeek" className="bz-select">
                                    {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                                </select>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <div className="bz-field">
                                    <label className="bz-label" htmlFor="bz-start">Start Time</label>
                                    <input id="bz-start" type="time" name="startTime" defaultValue="18:00" className="bz-input" />
                                </div>
                                <div className="bz-field">
                                    <label className="bz-label" htmlFor="bz-end">End Time</label>
                                    <input id="bz-end" type="time" name="endTime" defaultValue="20:00" className="bz-input" />
                                </div>
                            </div>
                            <div className="bz-field">
                                <label className="bz-label" htmlFor="bz-prep">Extra Prep Time (mins)</label>
                                <input id="bz-prep" type="number" name="extraPrepTime" defaultValue="15" className="bz-input" />
                            </div>
                            <input type="hidden" name="action" value="BUFFER" />
                            <div className="bz-actions">
                                <button type="button" className="bz-cancel" onClick={() => setIsAdding(false)}>Cancel</button>
                                <button type="submit" className="bz-submit">Create Schedule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
