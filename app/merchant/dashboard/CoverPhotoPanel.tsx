"use client";

import { useRef, useState, useTransition } from "react";
import { updateStoreBanner } from "../actions";

interface CoverPhotoPanelProps {
    restaurantId: string;
    currentImageUrl: string | null;
    restaurantName: string;
}

export default function CoverPhotoPanel({ restaurantId, currentImageUrl, restaurantName }: CoverPhotoPanelProps) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(currentImageUrl);
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // local preview
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target?.result as string);
        reader.readAsDataURL(file);

        // upload
        const fd = new FormData();
        fd.append("image", file);
        setMsg(null);

        startTransition(async () => {
            const res = await updateStoreBanner(null as any, fd);
            if (res?.error) {
                setMsg({ text: res.message || "Upload failed.", ok: false });
                setPreview(currentImageUrl);
            } else {
                setMsg({ text: "Cover photo updated!", ok: true });
                setTimeout(() => setMsg(null), 3000);
            }
        });
    };

    return (
        <>
            <style>{`
                .cp-panel { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; overflow: hidden; }
                .cp-banner {
                    position: relative; width: 100%; height: 140px;
                    background: linear-gradient(135deg, #1a2420 0%, #0f1a14 100%);
                    cursor: pointer;
                    transition: filter 0.15s;
                }
                .cp-banner:hover { filter: brightness(1.08); }
                .cp-banner img { width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; }
                .cp-placeholder {
                    width: 100%; height: 100%;
                    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
                }
                .cp-placeholder-icon {
                    width: 44px; height: 44px; border-radius: 12px;
                    border: 2px dashed rgba(249,115,22,0.4);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 20px;
                }
                .cp-placeholder-text { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.3); letter-spacing: 0.12em; text-transform: uppercase; }
                .cp-overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(to bottom, rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.6) 100%);
                    display: flex; align-items: flex-end; justify-content: space-between;
                    padding: 12px 14px;
                }
                .cp-rest-name { font-size: 14px; font-weight: 800; color: #fff; text-shadow: 0 1px 6px rgba(0,0,0,0.6); }
                .cp-edit-pill {
                    display: flex; align-items: center; gap: 5px;
                    background: rgba(0,0,0,0.55); border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 999px; padding: 4px 10px;
                    font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
                    color: #fff; cursor: pointer; backdrop-filter: blur(4px);
                    transition: background 0.15s;
                }
                .cp-edit-pill:hover { background: rgba(249,115,22,0.5); border-color: rgba(249,115,22,0.6); }
                .cp-footer { padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
                .cp-footer-label { font-size: 11px; color: #555; }
                .cp-upload-btn {
                    font-size: 11px; font-weight: 700; padding: 6px 14px;
                    border-radius: 6px; border: 1px solid rgba(249,115,22,0.35);
                    background: rgba(249,115,22,0.08); color: #f97316;
                    cursor: pointer; white-space: nowrap; transition: all 0.15s;
                }
                .cp-upload-btn:hover { background: rgba(249,115,22,0.15); }
                .cp-upload-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .cp-msg-ok { font-size: 11px; color: #4dca80; }
                .cp-msg-err { font-size: 11px; color: #f87171; }
            `}</style>

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

            <div className="cp-panel">
                <div className="cp-banner" onClick={() => fileRef.current?.click()}>
                    {preview
                        ? <img src={preview} alt="Cover photo" />
                        : (
                            <div className="cp-placeholder">
                                <div className="cp-placeholder-icon"></div>
                                <span className="cp-placeholder-text">Click to add cover photo</span>
                            </div>
                        )
                    }
                    <div className="cp-overlay">
                        <span className="cp-rest-name">{restaurantName}</span>
                        <span className="cp-edit-pill">
                            {isPending ? "Uploading…" : "✎ Change Photo"}
                        </span>
                    </div>
                </div>

                <div className="cp-footer">
                    <span className={msg ? (msg.ok ? "cp-msg-ok" : "cp-msg-err") : "cp-footer-label"}>
                        {msg?.text || "This photo appears as the banner on your restaurant page."}
                    </span>
                    <button
                        className="cp-upload-btn"
                        disabled={isPending}
                        onClick={() => fileRef.current?.click()}
                    >
                        {isPending ? "Uploading…" : preview ? "Replace" : "Upload"}
                    </button>
                </div>
            </div>
        </>
    );
}
