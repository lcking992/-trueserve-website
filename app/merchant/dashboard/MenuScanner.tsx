
"use client";

import { useState } from "react";
import { scanMenuAction, confirmAIImport } from "../ai-actions";


export default function MenuScanner({ restaurantId }: { restaurantId: string }) {
    const [scanning, setScanning] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [message, setMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                setSelectedFile(file);
                setMessage("");

                // For preview
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onloadend = () => setPreviewUrl(reader.result as string);
                    reader.readAsDataURL(file);
                } else {
                    setPreviewUrl(null); // PDF preview fallback
                }
            } else {
                alert("Please upload an image or PDF file.");
            }
        }
    };

    const handleScan = async () => {
        if (!selectedFile) {
            alert("Please select a file first.");
            return;
        }

        setScanning(true);
        setMessage("TrueServe AI is analyzing your menu layout...");

        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = async () => {
            const base64 = reader.result as string;

            // Artificial delay for "Scanning" feel
            await new Promise(r => setTimeout(r, 1500));
            setMessage("Extracting item details and pricing...");

            const result = await scanMenuAction(restaurantId, base64);

            if (result.success && result.items) {
                setResults(result.items);
                setShowResults(true);
                setMessage("");
            } else {
                setMessage("Failed to scan: " + result.error);
                setScanning(false);
            }
            setScanning(false);
        };
    };

    const handleImport = async () => {
        setScanning(true);
        const res = await confirmAIImport(restaurantId, results);
        if (res.success) {
            setMessage("Menu successfully imported!");
            setTimeout(() => {
                setShowResults(false);
                setMessage("");
                setResults([]);
                setSelectedFile(null);
                setPreviewUrl(null);
            }, 2000);
        } else {
            setMessage("Import failed: " + res.error);
        }
        setScanning(false);
    };

    return (
        <div className="relative">
            <style jsx>{`
                @keyframes scan-beam {
                    0% { top: 0%; opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .scanning-beam {
                    position: absolute;
                    left: 0;
                    width: 100%;
                    height: 4px;
                    background: linear-gradient(90deg, transparent, #448c89, transparent);
                    box-shadow: 0 0 15px #448c89;
                    z-index: 10;
                    animation: scan-beam 2s ease-in-out infinite;
                }
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .item-reveal {
                    animation: fade-up 0.5s ease-out forwards;
                }
            `}</style>

            <button
                onClick={() => setShowResults(!showResults)}
                className="btn btn-outline border-primary/30 text-primary hover:bg-primary/10 px-5 py-2.5 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 rounded-2xl backdrop-blur-md transition-all active:scale-95"
            >
                <span className="text-sm">✨</span> AI Menu Importer
            </button>

            {showResults && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                    <div className="bg-[#0c121e] border border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">

                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-br from-primary/10 via-transparent to-transparent">
                            <div>
                                <h3 className="text-2xl font-black flex items-center gap-3 tracking-tight">
                                    <span className="p-2 bg-primary/10 rounded-xl"></span> Smart Sync
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-widest opacity-60">Comparing Extract with Database</p>
                            </div>
                            <button onClick={() => setShowResults(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all font-black text-xl">&times;</button>
                        </div>

                        {/* Summary Bar */}
                        {results.length > 0 && (
                            <div className="px-8 py-4 bg-white/[0.02] border-b border-white/5 flex gap-6">
                                <div className="text-center">
                                    <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">New</p>
                                    <p className="text-lg font-black text-primary">{results.filter(r => r.changeType === 'NEW').length}</p>
                                </div>
                                <div className="text-center pl-6 border-l border-white/5">
                                    <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Updates</p>
                                    <p className="text-lg font-black text-secondary">{results.filter(r => r.changeType === 'UPDATE').length}</p>
                                </div>
                                <div className="text-center pl-6 border-l border-white/5">
                                    <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Synced</p>
                                    <p className="text-lg font-black text-slate-400">{results.filter(r => r.changeType === 'MATCH').length}</p>
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar">
                            {results.length > 0 ? (
                                <div className="space-y-4">
                                    {results.map((item, i) => (
                                        <div
                                            key={i}
                                            className={`item-reveal p-5 rounded-3xl border flex justify-between items-center transition-all group hover:scale-[1.01] ${item.changeType === 'NEW' ? 'bg-primary/5 border-primary/20' :
                                                    item.changeType === 'UPDATE' ? 'bg-secondary/5 border-secondary/20' :
                                                        'bg-white/[0.02] border-white/5 opacity-50 grayscale'
                                                }`}
                                            style={{ animationDelay: `${i * 100}ms` }}
                                        >
                                            <div className="flex gap-4 items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${item.changeType === 'NEW' ? 'bg-primary text-white' :
                                                        item.changeType === 'UPDATE' ? 'bg-secondary text-white' :
                                                            'bg-white/10 text-slate-500'
                                                    }`}>
                                                    {item.changeType === 'NEW' ? '+' : item.changeType === 'UPDATE' ? 'Update' : 'Done'}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-black text-white text-lg tracking-tight group-hover:text-primary transition-colors">{item.name}</p>
                                                        {item.changeType === 'NEW' && <span className="px-2 py-0.5 bg-primary/20 text-primary text-[8px] font-black uppercase rounded-full">New Entry</span>}
                                                        {item.changeType === 'UPDATE' && <span className="px-2 py-0.5 bg-secondary/20 text-secondary text-[8px] font-black uppercase rounded-full">Update found</span>}
                                                    </div>
                                                    <p className="text-xs text-slate-500 font-medium italic">{item.description || "No description provided."}</p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 ml-4">
                                                <p className="font-black text-white bg-white/5 px-3 py-1 rounded-full text-sm">${Number(item.price).toFixed(2)}</p>
                                                <p className="text-[9px] uppercase font-black tracking-[0.2em] text-primary/60 mt-2">{item.category}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center relative">
                                    <div className="mb-8 relative group">
                                        <label className="cursor-pointer block">
                                            <div className="relative mx-auto h-48 w-full max-w-sm bg-slate-800/50 rounded-[2rem] flex flex-col items-center justify-center transition-all hover:bg-slate-800 border-2 border-dashed border-white/10 overflow-hidden">
                                                {scanning && <div className="scanning-beam" />}

                                                {previewUrl ? (
                                                    <img src={previewUrl} alt="Preview" className={`w-full h-full object-cover transition-opacity ${scanning ? 'opacity-40 brightness-50' : 'opacity-80'}`} />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-4 py-8">
                                                        <span className="text-5xl animate-bounce"></span>
                                                        <div className="text-center">
                                                            <p className="text-white font-black tracking-tight text-lg">Upload your menu</p>
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Image or PDF • Max 10MB</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*,application/pdf"
                                                onChange={handleFileChange}
                                                disabled={scanning}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium leading-relaxed">
                                        Our AI recognizes fonts, layouts, and pricing automatically to build your digital store.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-8 bg-black/40 border-t border-white/5 flex flex-col gap-6">
                            {message && (
                                <div className="flex items-center justify-center gap-3">
                                    {scanning && <div className="w-2 h-2 rounded-full bg-primary animate-ping" />}
                                    <span className="text-[10px] uppercase font-black tracking-[0.3em] text-primary">
                                        {message}
                                    </span>
                                </div>
                            )}

                            <div className="flex gap-4">
                                {results.length === 0 ? (
                                    <button
                                        onClick={handleScan}
                                        disabled={scanning || !selectedFile}
                                        className="btn btn-primary flex-1 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] disabled:opacity-30 disabled:grayscale transition-all shadow-[0_20px_40px_rgba(var(--primary-rgb),0.2)]"
                                    >
                                        {scanning ? "TrueServe AI Running..." : "Initialize AI Scan"}
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={() => { setResults([]); setSelectedFile(null); setPreviewUrl(null); }} className="px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Abort</button>
                                        <button
                                            onClick={handleImport}
                                            disabled={scanning}
                                            className="btn btn-primary flex-1 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            {scanning ? "Syncing..." : "Finalize Import"}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
