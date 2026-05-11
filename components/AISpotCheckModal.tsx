"use client";

import { useState, useRef, useEffect } from "react";
import { performAISpotCheck } from "@/app/driver/actions";

export default function AISpotCheckModal({ onVerified }: { onVerified: () => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [successMsg, setSuccessMsg] = useState<string>("");

    useEffect(() => {
        // Automatically start the camera on load
        async function startCamera() {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: "user" }, // Force front camera for selfie
                    audio: false 
                });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                setError("Camera access required for AI Identity Verification.");
            }
        }
        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const captureAndVerify = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        setLoading(true);
        setError("");

        try {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context?.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

            // Convert to a File object
            canvasRef.current.toBlob(async (blob) => {
                if (!blob) {
                    setError("Failed to capture image.");
                    setLoading(false);
                    return;
                }

                if (stream) stream.getTracks().forEach(track => track.stop());

                const formData = new FormData();
                formData.append('selfie', blob, 'selfie.jpg');

                const res = await performAISpotCheck(formData);
                if (res.success) {
                    setSuccessMsg(res.message || "Identity Verified.");
                    setTimeout(() => onVerified(), 1500); // Close modal automatically
                } else {
                    setError(res.error || "Identity check failed. Please try again.");
                    setLoading(false);
                    // Restart camera
                    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
                    setStream(mediaStream);
                    videoRef.current!.srcObject = mediaStream;
                }
            }, 'image/jpeg', 0.8);
            
        } catch (e: any) {
            setError("Failed to run verification: " + e.message);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
             <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center">
                 <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary text-2xl mb-4 relative">
                    User
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border border-slate-900"></span>
                    </span>
                 </div>
                 <h2 className="text-xl font-black text-white text-center mb-1">Identity Spot Check</h2>
                 <p className="text-xs text-slate-400 text-center mb-6">TrueServe routinely verifies active drivers. Please take a clear Live Selfie.</p>

                 {error && (
                     <div className="w-full bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-center text-red-400 text-[10px] font-bold uppercase tracking-widest">
                         {error}
                     </div>
                 )}
                 {successMsg && (
                     <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 mb-4 text-center text-emerald-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                         {successMsg}
                     </div>
                 )}

                 <div className="relative w-full aspect-[3/4] bg-black rounded-2xl overflow-hidden mb-4 border-2 border-primary/50 shadow-[0_0_15px_rgba(255,153,42,0.3)]">
                     {/* The Target Area */}
                     <div className="absolute inset-x-8 inset-y-12 border-2 border-white/30 rounded-full border-dashed z-10 pointer-events-none opacity-50 flex items-center justify-center">
                         <span className="text-[10px] uppercase font-black tracking-widest text-white/50 bg-black/30 px-2 py-1 rounded">Face Here</span>
                     </div>
                     <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className={`w-full h-full object-cover transform -scale-x-100 ${loading ? 'opacity-30 blur-sm' : ''}`} 
                     />
                     <canvas ref={canvasRef} className="hidden" />
                 </div>

                 <button 
                    onClick={captureAndVerify}
                    disabled={loading || !stream || !!successMsg}
                    className="w-full btn bg-primary text-black font-black uppercase tracking-[0.2em] py-4 rounded-xl disabled:opacity-50 disabled:scale-100 transform active:scale-95 transition-all shadow-[0_0_20px_rgba(255,153,42,0.4)]"
                 >
                     {loading ? "Verifying..." : (successMsg ? "Cleared" : "Take Live Selfie")}
                 </button>
             </div>
        </div>
    );
}
