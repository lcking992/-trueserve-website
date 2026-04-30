"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, ImagePlus, Palette, UserCircle2, X } from "lucide-react";
import { updateAvatarDetails } from "@/app/user/settings/actions";
import { supabase } from "@/lib/supabase";

type ProfileAvatarProps = {
    userId: string;
    initialName: string;
    initialColor?: string;
    initialUrl?: string;
    className?: string;
};

const DEFAULT_COLOR = "#E8A230";

const COLOR_OPTIONS = [
    "#E8A230",
    "#F97316",
    "#22C55E",
    "#0EA5E9",
    "#6366F1",
    "#EC4899",
    "#EF4444",
    "#334155",
];

const AVATAR_PRESETS = [
    { id: "sunrise", label: "Sunrise", url: "/avatars/customer-sunrise.svg", color: "#F59E0B" },
    { id: "spark",   label: "Spark",   url: "/avatars/customer-spark.svg",   color: "#0EA5E9" },
    { id: "chef",    label: "Chef",    url: "/avatars/customer-chef.svg",    color: "#22C55E" },
    { id: "hero",    label: "Hero",    url: "/avatars/customer-hero.svg",    color: "#8B5CF6" },
    { id: "gold",    label: "Gold",    url: "/avatars/customer-gold.svg",    color: "#E8A230" },
    { id: "night",   label: "Night",   url: "/avatars/customer-night.svg",   color: "#334155" },
];

const normalizeColor = (value?: string) => {
    if (!value) return DEFAULT_COLOR;
    if (value.startsWith("#")) return value;
    return DEFAULT_COLOR;
};

const getInitials = (name: string) => {
    const chunks = name.trim().split(/\s+/).filter(Boolean);
    if (!chunks.length) return "U";
    if (chunks.length === 1) return chunks[0].slice(0, 2).toUpperCase();
    return `${chunks[0][0]}${chunks[chunks.length - 1][0]}`.toUpperCase();
};

export default function ProfileAvatar({
    userId,
    initialName,
    initialColor,
    initialUrl,
    className = "",
}: ProfileAvatarProps) {
    const router = useRouter();
    const [color, setColor] = useState(normalizeColor(initialColor));
    const [url, setUrl] = useState(initialUrl || "");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errorText, setErrorText] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const sizeClass = className.trim() || "h-16 w-16";
    const initials = getInitials(initialName);

    const saveAvatar = async (nextColor: string, nextUrl: string | null, closeMenu = false) => {
        setErrorText("");
        setIsSaving(true);
        const result = await updateAvatarDetails(userId, nextColor, nextUrl);
        setIsSaving(false);
        if (result?.error) { setErrorText(result.error); return; }
        if (closeMenu) setIsMenuOpen(false);
        router.refresh();
    };

    const handleColorPick  = async (c: string) => { setColor(c); setUrl(""); await saveAvatar(c, null, true); };
    const handlePresetPick = async (p: { color: string; url: string }) => { setColor(p.color); setUrl(p.url); await saveAvatar(p.color, p.url, true); };
    const handleUseMonogram = async () => { setUrl(""); await saveAvatar(color, null, true); };

    const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        setErrorText("");
        const fileExt = file.name.split(".").pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        try {
            const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName);
            setUrl(publicUrl);
            await saveAvatar(color, publicUrl, true);
        } catch (err) {
            console.error("Avatar upload error:", err);
            setErrorText("Failed to upload photo. Please try again.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const hasImage = Boolean(url);

    return (
        <div className={`relative inline-flex aspect-square shrink-0 items-center justify-center ${sizeClass}`}>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileUpload}
            />

            {/* Outer glow ring matching avatar color */}
            <div
                className="pointer-events-none absolute inset-[-3px] rounded-full opacity-60"
                style={{ boxShadow: `0 0 0 2px ${color}55, 0 0 20px ${color}30` }}
            />

            <button
                onClick={() => setIsMenuOpen(true)}
                disabled={isUploading || isSaving}
                className="group relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-white/10 font-black transition-all hover:scale-[1.03] hover:border-white/25"
                style={!hasImage ? { backgroundColor: color, color: "#fff" } : undefined}
                aria-label="Customize avatar"
                aria-haspopup="dialog"
            >
                {hasImage ? (
                    <img src={url} alt="Profile avatar" className="h-full w-full object-cover" />
                ) : isUploading || isSaving ? (
                    <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                    <span className="px-2 text-[clamp(1.4rem,3vw,2.8rem)] leading-none">{initials}</span>
                )}

                {/* Camera overlay on hover */}
                <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity backdrop-blur-[2px]">
                    <Camera size={18} className="text-white" />
                    <span className="text-[9px] text-white uppercase tracking-widest font-black">Edit</span>
                </div>
            </button>

            {/* Customization Modal */}
            {isMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
                        onClick={() => setIsMenuOpen(false)}
                    />

                    {/* Modal — full height on mobile, centered card on desktop */}
                    <div className="fixed inset-x-3 top-3 bottom-3 z-50 flex flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#0c0f0d] shadow-[0_32px_80px_rgba(0,0,0,0.7)] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[min(700px,calc(100vw-32px))] sm:max-h-[90vh] sm:-translate-x-1/2 sm:-translate-y-1/2">

                        {/* Header */}
                        <div className="shrink-0 border-b border-white/8 px-5 py-4 sm:px-7 sm:py-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Customer Profile</p>
                                    <h4 className="mt-1.5 text-2xl font-black text-white tracking-tight sm:text-3xl">Avatar Customization</h4>
                                    <p className="mt-1 text-sm text-white/50 leading-relaxed max-w-md">
                                        Upload a photo, pick a preset, or choose a monogram color.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="shrink-0 h-9 w-9 flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                                    aria-label="Close"
                                >
                                    <X size={15} />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable body */}
                        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
                            <div className="grid gap-4 sm:grid-cols-[180px_1fr]">

                                {/* Preview panel */}
                                <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 flex flex-col items-center text-center gap-3 sm:sticky sm:top-0">
                                    <p className="self-start text-[10px] font-black uppercase tracking-[0.16em] text-white/35">Preview</p>
                                    <div
                                        className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-white/10 font-black text-3xl text-white shadow-lg"
                                        style={!hasImage ? { backgroundColor: color } : undefined}
                                    >
                                        {hasImage
                                            ? <img src={url} alt="Preview" className="h-full w-full object-cover" />
                                            : <span style={{ fontSize: "2rem", lineHeight: 1 }}>{initials}</span>
                                        }
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{initialName || "Your profile"}</p>
                                        <p className="text-xs text-white/40 mt-0.5 leading-relaxed">
                                            Appears across your customer account
                                        </p>
                                    </div>
                                </div>

                                {/* Options */}
                                <div className="space-y-4">

                                    {/* Upload / Reset */}
                                    <section className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35 mb-3">Upload or Reset</p>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading || isSaving}
                                                className="w-full rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 text-left text-sm font-semibold text-white transition-colors hover:border-[#f97316]/50 hover:bg-[#f97316]/8 disabled:opacity-50"
                                            >
                                                <span className="flex items-center gap-3">
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f97316]/15 text-[#f97316]">
                                                        <ImagePlus size={15} />
                                                    </span>
                                                    <span className="min-w-0 flex-1">Upload Custom Photo</span>
                                                </span>
                                                <span className="mt-2 block pl-11 text-[10px] font-normal uppercase tracking-[0.12em] text-white/30">JPG · PNG · WEBP</span>
                                            </button>

                                            <button
                                                onClick={handleUseMonogram}
                                                disabled={!hasImage || isUploading || isSaving}
                                                className="w-full rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 text-left text-sm font-semibold text-white transition-colors hover:border-white/20 hover:bg-white/5 disabled:opacity-30"
                                            >
                                                <span className="flex items-center gap-3">
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/8 text-white/70">
                                                        <UserCircle2 size={15} />
                                                    </span>
                                                    <span className="min-w-0 flex-1">Switch to Monogram</span>
                                                </span>
                                                <span className="mt-2 block pl-11 text-[10px] font-normal uppercase tracking-[0.12em] text-white/30">Initials + color</span>
                                            </button>
                                        </div>
                                    </section>

                                    {/* Presets */}
                                    <section className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35 mb-3">Choose a Preset</p>
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                            {AVATAR_PRESETS.map((preset) => (
                                                <button
                                                    key={preset.id}
                                                    onClick={() => handlePresetPick(preset)}
                                                    disabled={isUploading || isSaving}
                                                    className={`group relative overflow-hidden rounded-2xl border p-1.5 transition-all ${
                                                        url === preset.url
                                                            ? "border-[#f97316] ring-1 ring-[#f97316]/40"
                                                            : "border-white/8 hover:border-white/20"
                                                    }`}
                                                >
                                                    <div className="overflow-hidden rounded-xl aspect-square">
                                                        <img
                                                            src={preset.url}
                                                            alt={preset.label}
                                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between px-0.5 pt-2 pb-0.5">
                                                        <span className="text-xs font-semibold text-white/80">{preset.label}</span>
                                                        {hasImage && url === preset.url && (
                                                            <span className="h-5 w-5 flex items-center justify-center rounded-full bg-[#f97316]">
                                                                <Check size={11} strokeWidth={3} className="text-black" />
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Color swatches */}
                                    <section className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35 mb-3">Monogram Color</p>
                                        <div className="flex flex-wrap gap-2.5">
                                            {COLOR_OPTIONS.map((swatch) => (
                                                <button
                                                    key={swatch}
                                                    onClick={() => handleColorPick(swatch)}
                                                    disabled={isUploading || isSaving}
                                                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all hover:scale-110"
                                                    style={{
                                                        backgroundColor: swatch,
                                                        borderColor: (color === swatch && !hasImage) ? "#fff" : "transparent",
                                                        boxShadow: (color === swatch && !hasImage) ? `0 0 0 3px ${swatch}50` : "none",
                                                    }}
                                                    aria-label={`Select color ${swatch}`}
                                                >
                                                    {color === swatch && !hasImage && (
                                                        <Check size={14} strokeWidth={3} className="text-white drop-shadow" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </section>

                                </div>
                            </div>

                            {errorText && (
                                <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-500/8 px-4 py-3 text-sm text-red-300">
                                    <Camera size={15} className="mt-0.5 shrink-0" />
                                    {errorText}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="shrink-0 border-t border-white/8 px-5 py-4 sm:px-7">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <span className="flex items-center gap-2 text-xs text-white/35">
                                <Palette size={13} />
                                Changes save instantly
                            </span>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:border-white/20 hover:text-white sm:w-auto"
                            >
                                <X size={13} /> Done
                            </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
