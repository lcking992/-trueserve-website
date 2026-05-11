"use client";

import { useState, useRef } from "react";
import { completeDelivery, completePhotoDelivery } from "../actions";

export default function CompleteDeliveryForm({ orderId, customerName, deliveryInstructions }: { orderId: string, customerName?: string, deliveryInstructions?: string }) {
    const [mode, setMode] = useState<'PIN' | 'PHOTO'>(deliveryInstructions?.toLowerCase().includes('leave') ? 'PHOTO' : 'PIN');
    const [digits, setDigits] = useState<string[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [photoCaptured, setPhotoCaptured] = useState<Blob | null>(null);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
            setStream(mediaStream);
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
        } catch {
            setError("Camera access required to take a delivery photo.");
        }
    };

    const stopCamera = () => {
        if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null); }
    };

    const handleTabChange = (newMode: 'PIN' | 'PHOTO') => {
        setMode(newMode);
        setError("");
        setPhotoCaptured(null);
        setDigits([]);
        if (newMode === 'PHOTO') startCamera();
        else stopCamera();
    };

    const takePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx?.drawImage(videoRef.current, 0, 0);
        canvasRef.current.toBlob(blob => { if (blob) { setPhotoCaptured(blob); stopCamera(); } }, 'image/jpeg', 0.8);
    };

    const enterDigit = (d: string) => { if (digits.length < 4) setDigits(prev => [...prev, d]); };
    const delDigit = () => setDigits(prev => prev.slice(0, -1));

    const submitDelivery = async () => {
        if (mode === 'PIN' && digits.length < 4) return;
        if (mode === 'PHOTO' && !photoCaptured) return;
        setLoading(true);
        setError("");

        const doSubmit = async (lat: number, lng: number) => {
            try {
                let res;
                if (mode === 'PIN') {
                    res = await completeDelivery(orderId, digits.join(""), lat, lng);
                } else {
                    const fd = new FormData();
                    fd.append('orderId', orderId);
                    fd.append('driverLat', lat.toString());
                    fd.append('driverLng', lng.toString());
                    if (photoCaptured) fd.append('photo', photoCaptured, 'delivery.jpg');
                    res = await completePhotoDelivery(fd);
                }
                if (res?.error) { setError(res.error); setLoading(false); }
                else setDone(true);
            } catch {
                setError("Failed to complete delivery."); setLoading(false);
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => doSubmit(pos.coords.latitude, pos.coords.longitude),
                () => { setError("Location access required."); setLoading(false); }
            );
        } else {
            setError("Geolocation not supported."); setLoading(false);
        }
    };

    const numpad = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

    if (done) {
        return (
            <div style={{
                background: 'rgba(62,207,110,0.08)', border: '1px solid rgba(62,207,110,0.25)',
                borderRadius: 8, padding: '14px 16px', textAlign: 'center', marginTop: 8,
            }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#3ecf6e', letterSpacing: '0.08em' }}>
                    Delivery Complete
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: '#111418', borderRadius: 10, padding: 14, marginTop: 8, border: '1px solid #1e2420' }}>

            {/* Mode toggle */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                background: '#0f1210', borderRadius: 8,
                padding: 3, gap: 3, marginBottom: 12,
            }}>
                {(['PIN', 'PHOTO'] as const).map(m => {
                    const label = m === 'PIN' ? 'Hand to Me' : 'Leave at Door';
                    const active = mode === m;
                    return (
                        <button
                            key={m}
                            type="button"
                            onClick={() => handleTabChange(m)}
                            style={{
                                fontSize: 11, fontWeight: 800, letterSpacing: '0.1em',
                                padding: '8px 10px',
                                border: active ? '1px solid rgba(249,115,22,0.4)' : '1px solid transparent',
                                borderRadius: 6, cursor: 'pointer',
                                background: active ? 'rgba(249,115,22,0.12)' : 'transparent',
                                color: active ? '#f97316' : '#555',
                                transition: 'all 0.15s',
                                fontFamily: 'inherit',
                                textTransform: 'uppercase',
                            }}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            {error && (
                <div style={{ background: 'rgba(232,64,64,0.08)', border: '1px solid rgba(232,64,64,0.25)', borderRadius: 6, padding: '8px 12px', marginBottom: 10 }}>
                    <p style={{ color: '#e84040', fontSize: 10, fontWeight: 700, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{error}</p>
                </div>
            )}

            {mode === 'PIN' ? (
                <div style={{ background: '#0f1210', border: '1px solid #1e2420', borderRadius: 8, padding: 12, marginBottom: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', color: '#555', marginBottom: 10, textTransform: 'uppercase' }}>
                        4-Digit PIN from {customerName || 'Customer'}
                    </div>

                    {/* PIN boxes */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                        {[0,1,2,3].map(i => {
                            const filled = i < digits.length;
                            const active = i === digits.length;
                            return (
                                <div key={i} style={{
                                    width: 48, height: 52,
                                    background: '#141a18',
                                    border: `2px solid ${filled ? '#f97316' : active ? 'rgba(249,115,22,0.4)' : '#1e2420'}`,
                                    borderRadius: 8,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 28, fontWeight: 800, color: '#f97316',
                                    transition: 'border-color 0.15s',
                                    userSelect: 'none',
                                }}>
                                    {digits[i] ?? '\u00a0'}
                                </div>
                            );
                        })}
                    </div>

                    {/* Numpad */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                        {numpad.map((key, i) => {
                            if (key === '') return <div key={i} />;
                            const isDel = key === '⌫';
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => isDel ? delDigit() : enterDigit(key)}
                                    style={{
                                        background: '#141a18', border: '1px solid #1e2420',
                                        borderRadius: 7, padding: '10px',
                                        fontSize: isDel ? 13 : 18, fontWeight: 700,
                                        color: isDel ? '#555' : '#ccc',
                                        cursor: 'pointer', transition: 'background 0.1s',
                                        fontFamily: 'inherit',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#1e2420')}
                                    onMouseLeave={e => (e.currentTarget.style.background = '#141a18')}
                                >
                                    {key}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div style={{ marginBottom: 10 }}>
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#080808', borderRadius: 8, overflow: 'hidden', border: '1px solid #1e2420', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {!photoCaptured ? (
                            <>
                                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                {stream && (
                                    <button
                                        type="button"
                                        onClick={takePhoto}
                                        style={{ position: 'absolute', bottom: 16, width: 56, height: 56, background: '#f97316', borderRadius: '50%', border: '3px solid white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <div style={{ width: 18, height: 18, background: 'black', borderRadius: '50%' }} />
                                    </button>
                                )}
                                {!stream && !error && (
                                    <span style={{ fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Starting camera…</span>
                                )}
                            </>
                        ) : (
                            <>
                                <img src={URL.createObjectURL(photoCaptured)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Proof" />
                                <button
                                    type="button"
                                    onClick={() => { setPhotoCaptured(null); startCamera(); }}
                                    style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontFamily: 'inherit' }}
                                >
                                    Retake
                                </button>
                            </>
                        )}
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>
                </div>
            )}

            {/* Submit */}
            <button
                type="button"
                onClick={submitDelivery}
                disabled={loading || (mode === 'PIN' && digits.length < 4) || (mode === 'PHOTO' && !photoCaptured)}
                style={{
                    width: '100%', padding: '11px',
                    background: (mode === 'PIN' && digits.length < 4) || (mode === 'PHOTO' && !photoCaptured)
                        ? 'transparent' : '#f97316',
                    color: (mode === 'PIN' && digits.length < 4) || (mode === 'PHOTO' && !photoCaptured)
                        ? '#444' : '#000',
                    border: (mode === 'PIN' && digits.length < 4) || (mode === 'PHOTO' && !photoCaptured)
                        ? '1px solid #1e2420' : 'none',
                    borderRadius: 8, cursor: loading ? 'wait' : 'pointer',
                    fontSize: 11, fontWeight: 800, letterSpacing: '0.14em',
                    textTransform: 'uppercase', transition: 'background 0.15s',
                    fontFamily: 'inherit',
                }}
            >
                {loading ? 'Confirming…' : 'Complete Delivery'}
            </button>
        </div>
    );
}
