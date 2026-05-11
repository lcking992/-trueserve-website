"use client";

import { useState } from "react";
import { sendKitchenReassurance } from "../actions";

interface LiveReassuranceProps {
    orderId: string;
    customerName: string;
}

export default function LiveReassurance({ orderId, customerName }: LiveReassuranceProps) {
    const [status, setStatus] = useState<'IDLE' | 'SENDING' | 'SENT'>('IDLE');

    const handleSend = async () => {
        setStatus('SENDING');
        const messages = [
            `Hey ${customerName.split(' ')[0]}! The kitchen is buzzing and your order is looking delicious. Almost there!`,
            `Chef's special attention is on your order right now, ${customerName.split(' ')[0]}! Packaging it up fresh.`,
            `Quality check complete! Your meal is being handed over to your courier. See you soon! ✨`
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        try {
            await sendKitchenReassurance(orderId, randomMessage);
            setStatus('SENT');
            setTimeout(() => setStatus('IDLE'), 5000);
        } catch (e) {
            alert("Failed to send reassurance.");
            setStatus('IDLE');
        }
    };

    return (
        <button 
            onClick={handleSend}
            disabled={status !== 'IDLE'}
            className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
                status === 'SENT' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20'
            }`}
        >
            {status === 'IDLE' ? (
                <><span></span> Send Kitchen Update</>
            ) : status === 'SENDING' ? (
                "Sending..."
            ) : (
                <><span>Done</span> Update Sent!</>
            )}
        </button>
    );
}
