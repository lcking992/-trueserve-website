
"use client";

import { useState } from "react";
import ChatWindow from "./ChatWindow";

export default function DriverChatButton({ orderId }: { orderId: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex-1 btn font-bold text-[10px] py-3 uppercase tracking-wider transition-all ${isOpen ? 'bg-primary text-black' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
            >
                {isOpen ? "Close Chat" : "Contact Customer"}
            </button>

            {isOpen && (
                <div className="fixed bottom-6 right-6 z-[60] w-80 shadow-2xl animate-fade-in-up">
                    <div className="bg-slate-900 border border-primary/30 rounded-3xl overflow-hidden shadow-2xl shadow-primary/10">
                        <div className="bg-primary/10 p-3 border-b border-primary/20 flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase text-primary tracking-widest">Active Chat: Order #{orderId.substring(0, 8)}</span>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">Close</button>
                        </div>
                        <ChatWindow orderId={orderId} role="DRIVER" />
                    </div>
                </div>
            )}
        </>
    );
}
