"use client";

import { useState, useRef } from "react";
import { confirmPickupWithPhoto } from "../actions";

export default function PickupPhotoForm({ orderId, restaurantName }: { orderId: string; restaurantName?: string }) {
    const [showCamera, setShowCamera] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [photoCaptured, setPhotoCaptured] = useState<Blob | null>(null);

    const startCamera = async () => {
        try {
            setShowCamera(true);
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
            setStream(mediaStream);
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
        } catch {
            setError("Camera access required. Allow camera permissions and try again.");
        }
    };

    const stopCamera = () => {
        if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null); }
    };

    const takePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx?.drawImage(videoRef.current, 0, 0);
        canvasRef.current.toBlob(blob => { if (blob) { setPhotoCaptured(blob); stopCamera(); } }, "image/jpeg", 0.8);
    };

    const submitPickup = async () => {
        if (!photoCaptured) return;
        setLoading(true);
        setError("");
        try {
            const formData = new FormData();
            formData.append("orderId", orderId);
            formData.append("photo", photoCaptured, "pickup.jpg");
            const res = await confirmPickupWithPhoto(formData);
            if (res?.error) { setError(res.error); setLoading(false); }
        } catch {
            setError("Failed to confirm pickup."); setLoading(false);
        }
    };

    if (error) {
        return (
            <div style={{ background: 'rgba(232,64,64,0.08)', border: '1px solid rgba(232,64,64,0.25)', borderRadius: 8, padding: '10px 14px', marginTop: 8 }}>
                <p style={{ color: '#e84040', fontSize: 10, fontWeight: 700, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{error}</p>
            </div>
        );
    }

    if (!showCamera) {
        return (
            <button
                onClick={startCamera}
                style={{
                    width: '100%', padding: '11px', marginTop: 8,
                    background: '#f97316', color: '#000', border: 'none',
                    borderRadius: 8, fontSize: 11, fontWeight: 800,
                    cursor: 'pointer', letterSpacing: '0.14em',
                    textTransform: 'uppercase', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#ea6c10')}
                onMouseLeave={e => (e.currentTarget.style.background = '#f97316')}
            >
                 Confirm Pickup with Photo
            </button>
        );
    }

    return (
        <div style={{ background: '#111418', borderRadius: 10, padding: 14, marginTop: 8, border: '1px solid #1e2420' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2 }}>
                        Pickup Photo
                    </div>
                    <div style={{ fontSize: 10, color: '#555' }}>{restaurantName || 'Restaurant'}</div>
                </div>
                <button
                    onClick={() => { stopCamera(); setShowCamera(false); setPhotoCaptured(null); }}
                    style={{ background: '#1e2420', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: '#666', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}
                >
                    ×
                </button>
            </div>

            {/* Camera */}
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#080808', borderRadius: 8, overflow: 'hidden', border: '1px solid #1e2420', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                {!photoCaptured ? (
                    <>
                        <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {stream && (
                            <button
                                onClick={takePhoto}
                                style={{ position: 'absolute', bottom: 14, width: 52, height: 52, background: '#f97316', borderRadius: '50%', border: '3px solid white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <div style={{ width: 16, height: 16, background: 'black', borderRadius: '50%' }} />
                            </button>
                        )}
                        {!stream && (
                            <span style={{ fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Starting camera…</span>
                        )}
                    </>
                ) : (
                    <>
                        <img src={URL.createObjectURL(photoCaptured)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Pickup proof" />
                        <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(62,207,110,0.9)', color: '#000', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 10px', borderRadius: 6 }}>
                            Photo taken
                        </div>
                        <button
                            onClick={() => { setPhotoCaptured(null); startCamera(); }}
                            style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                            Retake
                        </button>
                    </>
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            {/* Checklist */}
            <div style={{ background: '#0f1210', border: '1px solid #1e2420', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
                <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#555', marginBottom: 6 }}>Before you go</div>
                {['Sealed bag / container', 'Restaurant counter or branded bag visible', 'All items accounted for'].map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#3ecf6e', flexShrink: 0 }} />
                        <span style={{ fontSize: 10, color: '#666' }}>{item}</span>
                    </div>
                ))}
            </div>

            {/* Submit */}
            <button
                onClick={submitPickup}
                disabled={loading || !photoCaptured}
                style={{
                    width: '100%', padding: '11px',
                    background: !photoCaptured ? 'transparent' : '#f97316',
                    color: !photoCaptured ? '#444' : '#000',
                    border: !photoCaptured ? '1px solid #1e2420' : 'none',
                    borderRadius: 8, cursor: loading ? 'wait' : !photoCaptured ? 'default' : 'pointer',
                    fontSize: 11, fontWeight: 800, letterSpacing: '0.14em',
                    textTransform: 'uppercase', transition: 'background 0.15s',
                    fontFamily: 'inherit',
                }}
            >
                {loading ? 'Confirming…' : 'Confirm Pickup'}
            </button>
        </div>
    );
}
