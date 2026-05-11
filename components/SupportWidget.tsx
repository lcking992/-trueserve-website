"use client";

import { useState, useEffect, useRef } from "react";
import { sendMessageToSupport, getActiveSupportChat } from "@/app/support/actions";
import { MessageCircle, X, Send, Bot, User, ShieldAlert } from "lucide-react";

export default function SupportWidget({ role = "CUSTOMER" }: { role?: "CUSTOMER" | "DRIVER" | "MERCHANT" }) {
    const SUPPORT_OPEN_EVENT = "ts:support:open";
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [chatId, setChatId] = useState<string | null>(null);
    const [botStatus, setBotStatus] = useState<string>("BOT_ACTIVE");
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const loadChat = async () => {
        setIsTyping(true);
        const res = await getActiveSupportChat();
        if (res.success && res.chat) {
            setChatId(res.chat.id);
            setBotStatus(res.chat.status);
            setMessages(res.messages || []);
        } else if (!res.success && res.error === "Not logged in") {
            setBotStatus("LOGIN_REQUIRED");
            setMessages([{
                id: 'login-required',
                sender: 'BOT',
                content: `Please sign in to contact support so we can securely help with your order.`,
            }]);
        } else {
            setMessages([{
                id: 'welcome',
                sender: 'BOT',
                content: `Hi there! I'm the TrueServe Support AI. How can I help you today?`
            }]);
        }
        setIsTyping(false);
    };

    // Initial load
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            loadChat();
        }
    }, [isOpen]);

    useEffect(() => {
        const onOpen = (event: Event) => {
            const custom = event as CustomEvent<{ prefill?: string }>;
            setIsOpen(true);
            const prefill = custom?.detail?.prefill;
            if (typeof prefill === "string" && prefill.trim()) {
                setInput(prefill);
            }
            setTimeout(() => inputRef.current?.focus(), 50);
        };

        window.addEventListener(SUPPORT_OPEN_EVENT, onOpen as EventListener);
        return () => {
            window.removeEventListener(SUPPORT_OPEN_EVENT, onOpen as EventListener);
        };
    }, []);

    // Scroll to bottom
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isTyping]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setInput("");
        
        const tempId = Date.now().toString();
        setMessages(prev => [...prev, { id: tempId, sender: 'USER', content: userMsg }]);
        setIsTyping(true);

        const res = await sendMessageToSupport(chatId, userMsg, role);
        
        if (res.success) {
            if (!chatId && res.chatId) setChatId(res.chatId);
            setBotStatus(res.status || 'BOT_ACTIVE');

            if (res.reply) {
                setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'BOT', content: res.reply }]);
            } else if (res.status === 'HUMAN_REQUIRED') {
                setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'BOT', content: "An agent will be with you shortly." }]);
            }
        } else {
            const msg = String((res as any).error || "");
            const isLogin = msg.toLowerCase().includes("logged in");
            setMessages(prev => [...prev, { id: 'error', sender: 'BOT', content: isLogin ? "Please sign in to contact support." : "Failed to send message. Please try again." }]);
        }
        setIsTyping(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            <style dangerouslySetInnerHTML={{ __html: `
                .chat-modal { 
                    position: fixed; bottom: 84px; right: 24px; width: 340px; background: #0f1219; 
                    border: 1px solid #1c1f28; border-radius: 12px; display: flex; flex-direction: column; 
                    box-shadow: 0 10px 40px rgba(0,0,0,0.5); overflow: hidden; animation: fadeInUp 0.3s ease;
                    z-index: 10000;
                }
                @media (max-width: 640px) {
                    .chat-modal { bottom: 0; right: 0; width: 100vw; height: 100vh; border-radius: 0; border: none; max-height: none; }
                }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                
                .chat-hd { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid #1c1f28; background: #0c0e13; }
                .chat-icon { width: 36px; height: 36px; background: #0d2a1a; border: 1px solid #1a4a2a; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .chat-title { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 2px; }
                .chat-status { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #3dd68c; display: flex; align-items: center; gap: 5px; }
                .live-dot { width: 6px; height: 6px; background: #3dd68c; border-radius: 50%; animation: pulse 2s infinite; }
                @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
                .chat-close { margin-left: auto; cursor: pointer; color: #444; font-size: 20px; outline: none; }
                .chat-close:hover { color: #888; }

                .chat-body { flex: 1; padding: 16px; height: 320px; overflow-y: auto; background: #0f1219; }
                .msg-group { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 16px; }
                .msg-icon { width: 24px; height: 24px; background: #131720; border: 1px solid #1c1f28; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 4px; }
                .msg-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #444; margin-bottom: 4px; display: block; }
                .bubble { background: #131720; border: 1px solid #1c1f28; padding: 12px 14px; font-size: 13px; color: #ccc; line-height: 1.5; border-radius: 4px; max-width: 90%; }
                
                .user-group { display: flex; justify-content: flex-end; margin-bottom: 16px; }
                .user-bubble { background: #1a1200; border: 1px solid #3a2800; padding: 12px 14px; font-size: 13px; color: #f97316; max-width: 80%; line-height: 1.5; border-radius: 4px; }

                .input-row { display: flex; gap: 6px; padding: 12px; border-top: 1px solid #1c1f28; background: #0c0e13; }
                .chat-input { flex: 1; background: #0c0e13; border: 1px solid #2a2f3a; color: #ccc; font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 10px 14px; outline: none; border-radius: 4px; }
                .chat-input::placeholder { color: #333; }
                .send-btn { width: 42px; height: 42px; background: #3dd68c; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; border-radius: 4px; color: #000; outline: none; }
                
                .float-btn { width: 52px; height: 52px; background: #3dd68c; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #000; box-shadow: 0 4px 20px rgba(0,0,0,0.3); border: none; outline: none; }
            ` }} />

            {isOpen && (
                <div className="chat-modal">
                    <div className="chat-hd">
                        <div className="chat-icon">
                            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><rect x="3" y="5" width="10" height="8" rx="1" stroke="#3dd68c" strokeWidth="1.2"/><path d="M6 5V4a2 2 0 014 0v1" stroke="#3dd68c" strokeWidth="1.2"/><circle cx="6" cy="9" r="1" fill="#3dd68c"/><circle cx="10" cy="9" r="1" fill="#3dd68c"/></svg>
                        </div>
                        <div>
                            <div className="chat-title">TrueServe Support</div>
                            <div className="chat-status"><span className="live-dot"></span> Claude AI Active</div>
                        </div>
                        <button className="chat-close" onClick={() => setIsOpen(false)}>Close</button>
                    </div>
                    
                    <div className="chat-body">
                        {messages.map((msg, idx) => {
                            const isUser = msg.sender === 'USER';
                            return isUser ? (
                                <div key={msg.id || idx} className="user-group">
                                    <div className="user-bubble">{msg.content}</div>
                                </div>
                            ) : (
                                <div key={msg.id || idx} className="msg-group">
                                    <div className="msg-icon">
                                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x="1" y="3" width="9" height="6" rx="1" stroke="#3dd68c" strokeWidth="1"/><path d="M4 3V2a1.5 1.5 0 013 0v1" stroke="#3dd68c" strokeWidth="1"/></svg>
                                    </div>
                                    <div>
                                        <span className="msg-label">{msg.sender === 'HUMAN_AGENT' ? "Human Agent" : "AI Copilot"}</span>
                                        <div className="bubble">{msg.content}</div>
                                    </div>
                                </div>
                            );
                        })}
                        {isTyping && (
                            <div className="msg-group">
                                <div className="msg-icon animate-pulse">⚙️</div>
                                <div className="bubble">Thinking...</div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="input-row" onSubmit={handleSend}>
                        <input 
                            className="chat-input" 
                            type="text" 
                            placeholder="Type a message..." 
                            value={input}
                            ref={inputRef}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button className="send-btn" type="submit">
                            <svg width="18" height="18" viewBox="0 0 14 14" fill="none"><path d="M2 7l10-5-4 5 4 5L2 7z" fill="currentColor"/></svg>
                        </button>
                    </form>
                </div>
            )}

            {!isOpen && (
                <button className="float-btn" data-tour="support-fab" onClick={() => setIsOpen(true)}>
                    <svg width="24" height="24" viewBox="0 0 18 18" fill="none"><path d="M2 3a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H6l-4 3V3z" fill="currentColor"/></svg>
                </button>
            )}
        </div>
    );
}
