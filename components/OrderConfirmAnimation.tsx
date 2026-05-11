"use client";
import { useEffect, useState } from "react";

interface OrderConfirmAnimationProps {
    restaurantName: string;
    onComplete: () => void;
}

export default function OrderConfirmAnimation({ restaurantName, onComplete }: OrderConfirmAnimationProps) {
    const [phase, setPhase] = useState<"enter" | "drive" | "exit">("enter");
    const [dots, setDots] = useState(".");

    // Animate ellipsis
    useEffect(() => {
        const d = setInterval(() => setDots(p => p.length >= 3 ? "." : p + "."), 500);
        return () => clearInterval(d);
    }, []);

    // Phase timeline
    useEffect(() => {
        const t1 = setTimeout(() => setPhase("drive"), 500);
        const t2 = setTimeout(() => setPhase("exit"), 3200);
        const t3 = setTimeout(() => onComplete(), 4000);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onComplete]);

    return (
        <div
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden px-4 confirm-screen-root"
            data-phase={phase}
        >
            {/* Radial teal/gold glow */}
            <div className="absolute inset-0 pointer-events-none glow-overlay" />

            {/* Top text */}
            <div className="relative z-10 text-center mb-10 sm:mb-14 w-full max-w-sm sm:max-w-none confirm-header">
                <div className="inline-flex items-center gap-2 mb-4">
                    <span className="confirm-badge">
                        Done&nbsp;&nbsp;Order Confirmed
                    </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic text-white tracking-tight leading-tight confirm-title">
                    On its way from<br />
                    <span className="text-amber-400 not-italic font-black">{restaurantName}.</span>
                </h2>
                <p className="mt-4 text-slate-500 text-sm font-bold tracking-widest italic">
                    Loading your tracking{dots}
                </p>
            </div>

            {/* Road + Vehicle scene — fully responsive */}
            <div className="relative w-full max-w-2xl z-10 select-none h-[160px]">

                {/* Road surface */}
                <div className="absolute bottom-0 left-0 right-0 h-16 road-surface">
                    {/* Lane dashes */}
                    <div className="absolute inset-0 overflow-hidden flex items-center top-1/2 -translate-y-1/2">
                        <div className={`flex gap-6 road-dashes ${phase === "drive" ? "animate-road" : ""}`}>
                            {Array.from({ length: 24 }).map((_, i) => (
                                <div key={i} className="w-10 h-[3px] bg-amber-500/20 rounded-[2px] shrink-0" />
                            ))}
                        </div>
                    </div>
                    {/* Road edge shimmer */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2a8f8f]/25 to-transparent" />
                </div>

                {/* Vehicle — Driver emoji-style SVG, responsive width */}
                <div className={`absolute bottom-7 left-1/2 -translate-x-1/2 w-[min(220px,55vw)] vehicle-container ${phase === "drive" ? "animate-rock" : ""} ${phase === "exit" ? "exit-opacity" : ""}`}>
                    <svg
                        width="100%"
                        viewBox="0 0 220 110"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        className="block"
                    >
                        <defs>
                            <clipPath id="logo-clip-car">
                                <circle cx="110" cy="75" r="13" />
                            </clipPath>
                            {/* Headlight glow filter */}
                            <filter id="hl-glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* === WHEELS (drawn first / behind body) === */}
                        {/* Rear wheel */}
                        <circle cx="52"  cy="88" r="19" fill="#1a1a1e" stroke="#f5a623" strokeWidth="4.5" />
                        <circle cx="52"  cy="88" r="8"  fill="#f5a623" opacity="0.75" />
                        <circle cx="52"  cy="88" r="3.5" fill="#1a1a1e" />
                        {/* Front wheel */}
                        <circle cx="168" cy="88" r="19" fill="#1a1a1e" stroke="#f5a623" strokeWidth="4.5" />
                        <circle cx="168" cy="88" r="8"  fill="#f5a623" opacity="0.75" />
                        <circle cx="168" cy="88" r="3.5" fill="#1a1a1e" />

                        <path
                            d="M 18 88 L 18 74 Q 18 64  26 58 L 52  38 Q 64  18  82  16 L 138  16 Q 158  16  170 36 L 192  58 Q 200 64  200 74 L 200 88 Z"
                            fill="#2a8f8f"
                        />
                        <path
                            d="M 18 88 L 18 78 Q 18 72  25 70 L 195 70 Q 200 70  200 76 L 200 88 Z"
                            fill="#1f6e6e"
                        />
                        <path
                            d="M 28 60 Q 60 22 110 17 Q 155 13 185 52"
                            stroke="rgba(255,255,255,0.10)"
                            strokeWidth="2.5"
                            fill="none"
                            strokeLinecap="round"
                        />

                        {/* === WINDOWS === */}
                        <path
                            d="M 46 54 L 58 30 Q 64 22 75 22 L 93 22 L 93 54 Z"
                            fill="rgba(200,240,240,0.13)"
                            stroke="rgba(200,240,240,0.30)"
                            strokeWidth="1.2"
                        />
                        <path
                            d="M 100 54 L 100 22 L 134 22 Q 148 22 158 32 L 174 54 Z"
                            fill="rgba(200,240,240,0.10)"
                            stroke="rgba(200,240,240,0.28)"
                            strokeWidth="1.2"
                        />
                        <line x1="97" y1="22" x2="97" y2="54" stroke="rgba(42,143,143,0.8)" strokeWidth="3" strokeLinecap="round" />

                        {/* === LOGO BADGE ON DOOR === */}
                        <circle cx="110" cy="75" r="15" fill="#f5a623" opacity="0.12" />
                        <circle cx="110" cy="75" r="14" stroke="#f5a623" strokeWidth="1.2" strokeOpacity="0.4" fill="none" />
                        <image
                            href="/logo.png"
                            x="96" y="61"
                            width="28" height="28"
                            clipPath="url(#logo-clip-car)"
                            preserveAspectRatio="xMidYMid slice"
                        />

                        {/* === HEADLIGHT === */}
                        <ellipse cx="196" cy="68" rx="6" ry="5" fill="#f5a623" opacity="0.95" filter="url(#hl-glow)" />
                        <ellipse cx="196" cy="68" rx="7" ry="6" fill="none" stroke="#f5a623" strokeWidth="1" strokeOpacity="0.5" />

                        {/* === TAILLIGHT === */}
                        <ellipse cx="20" cy="69" rx="4" ry="5.5" fill="#ef4444" opacity="0.9" />
                        <ellipse cx="20" cy="69" rx="4" ry="5.5" fill="#ef4444" opacity="0.25" className="blur-[3px]" />

                        {/* === BUMPERS === */}
                        <rect x="192" y="80" width="14" height="5" rx="2.5" fill="#1f6e6e" stroke="#f5a623" strokeWidth="0.8" strokeOpacity="0.35" />
                        <rect x="14"  y="80" width="12" height="5" rx="2.5" fill="#1f6e6e" stroke="#ef4444" strokeWidth="0.8" strokeOpacity="0.25" />

                        {/* === EXHAUST PUFFS === */}
                        {phase === "drive" && (
                            <g className="animate-exhaust">
                                <circle cx="12" cy="76" r="5" fill="rgba(255,255,255,0.07)" />
                                <circle cx="4"  cy="73" r="3" fill="rgba(255,255,255,0.04)" />
                            </g>
                        )}

                        {/* === SPEED LINES === */}
                        {phase === "drive" && (
                            <g opacity="0.38" className="animate-speed">
                                <line x1="16" y1="38" x2="-14" y2="38" stroke="#f5a623" strokeWidth="2.2" strokeLinecap="round" />
                                <line x1="16" y1="52" x2="-22" y2="52" stroke="#f5a623" strokeWidth="1.4" strokeLinecap="round" />
                                <line x1="16" y1="64" x2="-10" y2="64" stroke="#f5a623" strokeWidth="1"   strokeLinecap="round" />
                            </g>
                        )}
                    </svg>
                </div>

                {/* Headlight beam on road */}
                {phase === "drive" && (
                    <div className="absolute pointer-events-none bottom-[18px] left-[calc(50%+min(100px,25vw))] w-[min(100px,25vw)] h-5 bg-gradient-to-r from-amber-500/15 to-transparent rounded-r-[50%] -skew-x-[10deg]" />
                )}
            </div>

            {/* City skyline silhouette */}
            <div className="absolute bottom-0 left-0 right-0 pointer-events-none h-20">
                <svg width="100%" height="80" preserveAspectRatio="none" viewBox="0 0 1200 80" fill="none" xmlns="http://www.w3.org/2000/svg"
                    className={phase === "drive" ? "animate-city" : ""}>
                    <rect x="50"   y="30" width="30" height="50" fill="rgba(42,143,143,0.05)" />
                    <rect x="90"   y="10" width="20" height="70" fill="rgba(42,143,143,0.04)" />
                    <rect x="120"  y="40" width="40" height="40" fill="rgba(245,166,35,0.04)" />
                    <rect x="170"  y="20" width="25" height="60" fill="rgba(42,143,143,0.03)" />
                    <rect x="250"  y="35" width="35" height="45" fill="rgba(245,166,35,0.04)" />
                    <rect x="295"  y="15" width="18" height="65" fill="rgba(42,143,143,0.03)" />
                    <rect x="400"  y="25" width="50" height="55" fill="rgba(245,166,35,0.05)" />
                    <rect x="460"  y="5"  width="22" height="75" fill="rgba(42,143,143,0.03)" />
                    <rect x="550"  y="30" width="30" height="50" fill="rgba(245,166,35,0.04)" />
                    <rect x="590"  y="10" width="20" height="70" fill="rgba(42,143,143,0.03)" />
                    <rect x="700"  y="20" width="45" height="60" fill="rgba(245,166,35,0.05)" />
                    <rect x="755"  y="40" width="30" height="40" fill="rgba(42,143,143,0.03)" />
                    <rect x="850"  y="15" width="25" height="65" fill="rgba(245,166,35,0.04)" />
                    <rect x="900"  y="35" width="40" height="45" fill="rgba(42,143,143,0.03)" />
                    <rect x="1000" y="10" width="22" height="70" fill="rgba(245,166,35,0.04)" />
                    <rect x="1050" y="30" width="35" height="50" fill="rgba(42,143,143,0.03)" />
                    <rect x="1100" y="20" width="30" height="60" fill="rgba(245,166,35,0.05)" />
                    <rect x="1150" y="40" width="20" height="40" fill="rgba(42,143,143,0.03)" />
                </svg>
            </div>

            {/* Particle sparks */}
            {phase === "drive" && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 rounded-full bg-amber-400 opacity-50 spark-particle"
                            data-index={i}
                        />
                    ))}
                </div>
            )}

            {/* Progress bar at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
                <div
                    className="h-full bg-amber-500 progress-bar"
                    data-phase={phase}
                />
            </div>

            {/* Component-Specific Keyframes & Utility Classes */}
            <style>{`
                .confirm-screen-root { background: #09090b; }
                .glow-overlay { background: radial-gradient(ellipse 80% 55% at 50% 65%, rgba(42,143,143,0.10) 0%, rgba(245,166,35,0.05) 55%, transparent 75%); }
                .confirm-header { transition: opacity 0.5s, transform 0.6s; }
                .confirm-screen-root[data-phase="enter"] .confirm-header { transform: translateY(10px); }
                .confirm-screen-root[data-phase="exit"] .confirm-header { opacity: 0; }
                
                .confirm-badge {
                    background: #f5a623;
                    color: #09090b;
                    font-weight: 900;
                    font-size: 11px;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    border-radius: 9999px;
                    padding: 6px 20px;
                    border: 2px solid #f5a623;
                    display: inline-block;
                }
                .confirm-title { text-shadow: 0 0 40px rgba(245,158,11,0.2); }
                .road-surface { background: linear-gradient(180deg,#1a1a1e 0%,#111115 100%); border-top: 2px solid rgba(42,143,143,0.2); }
                .road-dashes { white-space: nowrap; }
                .vehicle-container { transition: opacity 0.8s ease-in; }
                .exit-opacity { opacity: 0; }
                
                .animate-road { animation: road-scroll 0.5s linear infinite; }
                .animate-rock { animation: vehicle-rock 0.4s ease-in-out infinite; }
                .animate-exhaust { animation: exhaust 0.7s ease-out infinite; }
                .animate-city { animation: cityscape-scroll 4s linear infinite; }
                .animate-speed { animation: speed-lines 0.3s linear infinite; }
                
                .spark-particle {
                    animation-duration: 0.8s;
                    animation-timing-function: ease-out;
                    animation-iteration-count: infinite;
                }
                .spark-particle[data-index="0"] { top: 48%; left: 35%; animation-name: spark-0; animation-delay: 0s; }
                .spark-particle[data-index="1"] { top: 55%; left: 41%; animation-name: spark-1; animation-delay: 0.13s; }
                .spark-particle[data-index="2"] { top: 42%; left: 47%; animation-name: spark-2; animation-delay: 0.26s; }
                .spark-particle[data-index="3"] { top: 50%; left: 53%; animation-name: spark-0; animation-delay: 0.39s; }
                .spark-particle[data-index="4"] { top: 45%; left: 59%; animation-name: spark-1; animation-delay: 0.52s; }
                .spark-particle[data-index="5"] { top: 52%; left: 65%; animation-name: spark-2; animation-delay: 0.65s; }

                .progress-bar { transition: width 3.5s linear; width: 0%; }
                .progress-bar[data-phase="enter"] { width: 0%; }
                .progress-bar[data-phase="drive"] { width: 90%; }
                .progress-bar[data-phase="exit"] { width: 100%; }

                @keyframes road-scroll {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-64px); }
                }
                @keyframes vehicle-rock {
                    0%, 100% { transform: translateX(-50%) translateY(0) rotate(0deg); }
                    25%      { transform: translateX(-50%) translateY(-1.5px) rotate(0.4deg); }
                    75%      { transform: translateX(-50%) translateY(1px) rotate(-0.3deg); }
                }
                @keyframes exhaust {
                    0%   { transform: translateX(0) scale(1); opacity: 0.4; }
                    100% { transform: translateX(-22px) scale(2.2); opacity: 0; }
                }
                @keyframes cityscape-scroll {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-200px); }
                }
                @keyframes spark-0 {
                    0%   { transform: translate(0,0) scale(1); opacity: 0.5; }
                    100% { transform: translate(-8px, -12px) scale(0); opacity: 0; }
                }
                @keyframes spark-1 {
                    0%   { transform: translate(0,0) scale(1); opacity: 0.4; }
                    100% { transform: translate(-4px, -16px) scale(0); opacity: 0; }
                }
                @keyframes spark-2 {
                    0%   { transform: translate(0,0) scale(1); opacity: 0.5; }
                    100% { transform: translate(-12px, -8px) scale(0); opacity: 0; }
                }
                @keyframes speed-lines {
                    from { opacity: 0.38; transform: translateX(0); }
                    to   { opacity: 0;    transform: translateX(-12px); }
                }
            `}</style>
        </div>
    );
}
