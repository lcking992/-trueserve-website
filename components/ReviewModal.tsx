import { useState, useRef } from 'react';
import { submitReviewWithPhoto } from '@/app/user/actions';

interface ReviewModalProps {
    orderId: string;
    driverId: string;
    customerId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ReviewModal({ orderId, driverId, customerId, isOpen, onClose }: ReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [photo, setPhoto] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('orderId', orderId);
        formData.append('driverId', driverId);
        formData.append('rating', rating.toString());
        formData.append('comment', comment);
        if (photo) formData.append('photo', photo);

        const res = await submitReviewWithPhoto(formData);
        setIsSubmitting(false);

        if (res.error) {
            alert("Failed to submit review: " + res.error);
        } else {
            setSubmitted(true);
            setTimeout(onClose, 2000); 
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhoto(e.target.files[0]);
        }
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-3xl animate-in fade-in duration-500 p-4">
                <style dangerouslySetInnerHTML={{ __html: `
                    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,800;1,700;1,800&family=Bebas+Neue&display=swap');
                    .bebas { font-family: 'Bebas Neue', sans-serif; }
                    .barlow-cond { font-family: 'Barlow Condensed', sans-serif; }
                ` }} />
                <div className="w-full max-w-sm bg-[#0a0a0a] border border-[#f97316]/40 p-10 text-center rounded-[2.5rem] shadow-[0_0_80px_rgba(249,115,22,0.2)] animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-[#f97316]/20 rounded-full flex items-center justify-center text-4xl mb-6 mx-auto border border-[#f97316]/30 shadow-inner">Done</div>
                    <h2 className="bebas text-4xl italic tracking-wide text-white uppercase">REVIEW<span className="text-[#f97316]">UPLOADED.</span></h2>
                    <p className="barlow-cond text-[10px] font-black uppercase tracking-[0.3em] text-[#555] mt-2 italic">Communication synchronization complete</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-3xl p-6 animate-in fade-in duration-500">
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes scanning {
                    0% { top: 0; }
                    50% { top: 100%; }
                    100% { top: 0; }
                }
                .animate-scanning { animation: scanning 2s linear infinite; }
            ` }} />
            
            <div className="w-full max-w-md bg-[#0d0d0d] border border-white/5 rounded-[3rem] p-8 pb-10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
                
                {/* BACKGROUND ELEMENT */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#f97316]/5 blur-[80px] -z-10 rounded-full" />
                
                <header className="mb-10">
                    <h2 className="bebas text-5xl italic tracking-wider text-white leading-none">RATE YOUR<br/><span className="text-[#f97316]">EXPERIENCE.</span></h2>
                    <p className="barlow-cond text-[10px] font-black uppercase tracking-[0.4em] text-[#333] mt-2 italic underline decoration-[#f97316]/40">Mission evaluation required</p>
                </header>

                <div className="flex justify-center gap-4 mb-10">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            className={`text-4xl transition-all duration-300 transform active:scale-90 ${rating >= star ? 'text-[#f97316] drop-shadow-[0_0_15px_rgba(249,115,22,0.5)] scale-110' : 'text-white/10 grayscale hover:scale-105'}`}
                        >
                            ★
                        </button>
                    ))}
                </div>

                <div className="space-y-6">
                    {/* PHOTO UPLOAD BLOCK */}
                    <div className="space-y-2">
                        <label className="barlow-cond text-[11px] font-black uppercase tracking-[0.2em] text-[#333] ml-1">CAPTURED PROOF (OPTIONAL)</label>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="group relative h-40 bg-black/40 border border-white/5 rounded-3xl overflow-hidden hover:border-[#f97316]/40 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                            
                            {photo ? (
                                <>
                                    <img src={URL.createObjectURL(photo)} className="w-full h-full object-cover opacity-80" alt="Preview" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="bebas text-2xl italic text-white tracking-widest">REPLACE PROOF</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl relative overflow-hidden group-hover:bg-[#f97316]/10 transition-colors">
                                        <span className="opacity-40 group-hover:opacity-100 transition-opacity group-hover:scale-125 duration-500">Photo</span>
                                        <div className="absolute top-0 left-0 w-full h-[1px] bg-[#f97316] shadow-[0_0_10px_#f97316] opacity-0 group-hover:opacity-100 animate-scanning" />
                                    </div>
                                    <p className="barlow-cond text-[10px] font-black tracking-[0.2em] text-white/30 group-hover:text-white/60 transition-colors uppercase">Synchronize Visual Memory</p>
                                </>
                            )}
                            {/* Scanning Pulse at the top of the overall form */}
                            {photo && <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#f97316] to-transparent opacity-30 animate-pulse" />}
                        </div>
                    </div>

                    {/* COMMENT AREA */}
                    <div className="space-y-2">
                        <label className="barlow-cond text-[11px] font-black uppercase tracking-[0.2em] text-[#333] ml-1">MISSION DEBRIEF</label>
                        <textarea
                            className="w-full bg-black/40 border border-white/5 rounded-[2rem] p-6 text-[15px] font-medium text-white placeholder:text-[#222] focus:border-[#f97316]/40 outline-none transition-all h-32 resize-none shadow-inner"
                            placeholder="Describe your sequence experience..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-4 mt-10">
                    <button
                        onClick={onClose}
                        className="flex-1 barlow-cond h-16 rounded-2xl border border-white/5 hover:bg-white/5 text-[11px] font-black uppercase tracking-[0.3em] text-[#444] hover:text-white transition-all italic active:scale-95"
                    >
                        SKIP EVALUATION
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-[1.5] bebas h-16 rounded-2xl bg-[#f97316] hover:bg-[#ffb030] text-black text-[28px] italic tracking-wider transition-all shadow-[0_15px_40px_rgba(249,115,22,0.2)] active:scale-95 disabled:grayscale disabled:opacity-30 disabled:scale-100"
                    >
                        {isSubmitting ? "SYNCHRONIZING..." : "SUBMIT REPORT →"}
                    </button>
                </div>
            </div>
        </div>
    );
}
