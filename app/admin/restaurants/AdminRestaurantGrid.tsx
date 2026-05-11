"use client";

import { useState, useTransition, useRef } from "react";
import { updateRestaurantPhoto, updateRestaurantMeta } from "./actions";

interface Restaurant {
    id: string;
    name: string;
    imageUrl: string | null;
    cuisineType: string | null;
    visibility: string | null;
    city: string | null;
    state: string | null;
    stripeAccountId?: string | null;
    openTime?: string | null;
    closeTime?: string | null;
    posSystem?: string | null;
    posType?: string | null;
    posClientId?: string | null;
    menuItems?: { id: string }[] | null;
}

export default function AdminRestaurantGrid({ restaurants }: { restaurants: Restaurant[] }) {
    const [editing, setEditing] = useState<string | null>(null);
    const [urlInputs, setUrlInputs] = useState<Record<string, string>>({});
    const [previews, setPreviews] = useState<Record<string, string>>({});
    const [cuisineInputs, setCuisineInputs] = useState<Record<string, string>>({});
    const [saved, setSaved] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isPending, startTransition] = useTransition();
    const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

    function handleFileChange(id: string, e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setPreviews(p => ({ ...p, [id]: ev.target?.result as string }));
        reader.readAsDataURL(file);
    }

    function handleSave(restaurantId: string) {
        const fileInput = fileRefs.current[restaurantId];
        const file = fileInput?.files?.[0];
        const url = urlInputs[restaurantId] || "";
        const cuisine = cuisineInputs[restaurantId];
        const hasPhoto = !!(file || url);
        const hasCuisine = cuisine !== undefined;

        if (!hasPhoto && !hasCuisine) {
            setErrors(e => ({ ...e, [restaurantId]: "Upload a photo, paste a URL, or update the cuisine type." }));
            return;
        }

        setErrors(e => ({ ...e, [restaurantId]: "" }));

        startTransition(async () => {
            try {
                if (hasPhoto) {
                    const fd = new FormData();
                    if (file) fd.append("photo", file);
                    if (url) fd.append("url", url);
                    await updateRestaurantPhoto(restaurantId, fd);
                }
                if (hasCuisine) {
                    await updateRestaurantMeta(restaurantId, cuisine);
                }
                setSaved(s => ({ ...s, [restaurantId]: true }));
                setEditing(null);
                setTimeout(() => setSaved(s => ({ ...s, [restaurantId]: false })), 3000);
            } catch (err: any) {
                setErrors(e => ({ ...e, [restaurantId]: err.message || "Save failed." }));
            }
        });
    }

    return (
        <>
            <style>{`
                .arg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
                .arg-card { background: #141a18; border: 1px solid #1e2420; border-radius: 10px; overflow: hidden; }
                .arg-thumb { position: relative; height: 150px; background: #0c0f0d; }
                .arg-thumb img { width: 100%; height: 100%; object-fit: cover; object-position: center; }
                .arg-thumb-empty { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; color: #58615c; }
                .arg-body { padding: 14px; }
                .arg-name { font-size: 14px; font-weight: 700; color: #fff; margin: 0 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .arg-meta { font-size: 11px; color: #555; margin: 0 0 12px; }
                .arg-edit-btn { font-size: 11px; font-weight: 700; background: rgba(249,115,22,.1); color: #f97316; border: 1px solid rgba(249,115,22,.25); border-radius: 6px; padding: 6px 12px; cursor: pointer; width: 100%; font-family: inherit; transition: background .15s; }
                .arg-edit-btn:hover { background: rgba(249,115,22,.18); }
                .arg-form { margin-top: 10px; display: flex; flex-direction: column; gap: 8px; }
                .arg-label { font-size: 10px; font-weight: 800; color: #555; text-transform: uppercase; letter-spacing: .12em; margin-bottom: 3px; }
                .arg-input { background: #0c0f0d; border: 1px solid #1e2420; border-radius: 6px; padding: 8px 10px; font-size: 12px; color: #fff; outline: none; width: 100%; box-sizing: border-box; font-family: inherit; }
                .arg-input:focus { border-color: rgba(249,115,22,.4); }
                .arg-file-btn { font-size: 11px; font-weight: 700; background: #0c0f0d; color: #aaa; border: 1px dashed #2a3530; border-radius: 6px; padding: 8px 12px; cursor: pointer; width: 100%; font-family: inherit; text-align: center; }
                .arg-save-btn { font-size: 12px; font-weight: 800; background: #f97316; color: #000; border: none; border-radius: 6px; padding: 9px; cursor: pointer; width: 100%; font-family: inherit; transition: background .15s; }
                .arg-save-btn:hover:not(:disabled) { background: #fb923c; }
                .arg-save-btn:disabled { opacity: .5; cursor: not-allowed; }
                .arg-cancel { font-size: 11px; color: #555; background: none; border: none; cursor: pointer; font-family: inherit; text-align: center; width: 100%; padding: 4px; }
                .arg-cancel:hover { color: #aaa; }
                .arg-error { font-size: 11px; color: #f87171; }
                .arg-saved { font-size: 11px; color: #4dca80; text-align: center; }
                .arg-preview { width: 100%; height: 90px; object-fit: cover; border-radius: 6px; margin-top: 4px; }
                .arg-badge { position: absolute; top: 8px; right: 8px; font-size: 9px; font-weight: 800; padding: 3px 7px; border-radius: 20px; text-transform: uppercase; letter-spacing: .1em; }
                .arg-badge-live { background: rgba(77,202,128,.15); color: #4dca80; border: 1px solid rgba(77,202,128,.3); }
                .arg-badge-hidden { background: rgba(248,113,113,.1); color: #f87171; border: 1px solid rgba(248,113,113,.25); }
                .arg-readiness { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; margin: 10px 0 12px; }
                .arg-ready-chip { display: flex; align-items: center; gap: 6px; min-width: 0; border-radius: 8px; padding: 6px 7px; font-size: 9px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
                .arg-ready-chip.ok { color: #4dca80; background: rgba(77,202,128,.09); border: 1px solid rgba(77,202,128,.2); }
                .arg-ready-chip.wait { color: #a7adba; background: rgba(255,255,255,.035); border: 1px solid rgba(255,255,255,.08); }
                .arg-ready-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; background: currentColor; }
                .arg-score { margin-top: 8px; color: #f97316; font-size: 10px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; }
            `}</style>

            <div className="arg-grid">
                {restaurants.map(r => {
                    const checks = [
                        { label: "Photo", ok: Boolean(r.imageUrl) },
                        { label: "Menu", ok: Boolean(r.menuItems?.length) },
                        { label: "Payout", ok: Boolean(r.stripeAccountId) },
                        { label: "Hours", ok: Boolean(r.openTime && r.closeTime) },
                        { label: "POS", ok: Boolean((r.posSystem && r.posSystem !== "None") || (r.posType && r.posType !== "None") || r.posClientId || r.posSystem === "None" || r.posType === "None") },
                        { label: "Live", ok: r.visibility === "VISIBLE" },
                    ];
                    const readyCount = checks.filter((check) => check.ok).length;
                    const readiness = Math.round((readyCount / checks.length) * 100);
                    return (
                    <div key={r.id} className="arg-card">
                        {/* Thumbnail */}
                        <div className="arg-thumb">
                            {(previews[r.id] || r.imageUrl) ? (
                                <img src={previews[r.id] || r.imageUrl!} alt={r.name} />
                            ) : (
                                <div className="arg-thumb-empty">Needs photo</div>
                            )}
                            <span className={`arg-badge ${r.visibility === "VISIBLE" ? "arg-badge-live" : "arg-badge-hidden"}`}>
                                {r.visibility === "VISIBLE" ? "Live" : "Hidden"}
                            </span>
                        </div>

                        {/* Info */}
                        <div className="arg-body">
                            <p className="arg-name">{r.name}</p>
                            <p className="arg-meta">{[r.cuisineType, r.city, r.state].filter(Boolean).join(" · ")}</p>
                            <div className="arg-score">Launch readiness {readiness}%</div>
                            <div className="arg-readiness">
                                {checks.map((check) => (
                                    <span key={check.label} className={`arg-ready-chip ${check.ok ? "ok" : "wait"}`}>
                                        <span className="arg-ready-dot" />
                                        {check.label}
                                    </span>
                                ))}
                            </div>

                            {saved[r.id] && <p className="arg-saved">Photo saved</p>}

                            {editing === r.id ? (
                                <div className="arg-form">
                                    {/* File upload */}
                                    <div>
                                        <p className="arg-label">Upload file</p>
                                        <label className="arg-file-btn">
                                            Choose image
                                            <input
                                                type="file"
                                                accept="image/*"
                                                style={{ display: "none" }}
                                                ref={el => { fileRefs.current[r.id] = el; }}
                                                onChange={e => handleFileChange(r.id, e)}
                                            />
                                        </label>
                                        {previews[r.id] && (
                                            <img src={previews[r.id]} className="arg-preview" alt="preview" />
                                        )}
                                    </div>

                                    {/* Or paste URL */}
                                    <div>
                                        <p className="arg-label">Or paste image URL</p>
                                        <input
                                            className="arg-input"
                                            placeholder="https://..."
                                            value={urlInputs[r.id] || ""}
                                            onChange={e => {
                                                setUrlInputs(u => ({ ...u, [r.id]: e.target.value }));
                                                if (e.target.value) setPreviews(p => ({ ...p, [r.id]: e.target.value }));
                                            }}
                                        />
                                    </div>

                                    {/* Cuisine type */}
                                    <div>
                                        <p className="arg-label">Cuisine Type</p>
                                        <input
                                            className="arg-input"
                                            placeholder="e.g. American, Fast Food, Burgers…"
                                            value={cuisineInputs[r.id] ?? (r.cuisineType || "")}
                                            onChange={e => setCuisineInputs(u => ({ ...u, [r.id]: e.target.value }))}
                                        />
                                    </div>

                                    {errors[r.id] && <p className="arg-error">{errors[r.id]}</p>}

                                    <button
                                        className="arg-save-btn"
                                        onClick={() => handleSave(r.id)}
                                        disabled={isPending}
                                    >
                                        {isPending ? "Saving…" : "Save Changes"}
                                    </button>
                                    <button className="arg-cancel" onClick={() => {
                                        setEditing(null);
                                        setPreviews(p => { const n = { ...p }; delete n[r.id]; return n; });
                                    }}>
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button className="arg-edit-btn" onClick={() => setEditing(r.id)}>
                                    {r.imageUrl ? "Edit Restaurant" : "Add Photo"}
                                </button>
                            )}
                        </div>
                    </div>
                )})}
            </div>
        </>
    );
}
