"use client";

import { useState, useEffect, useRef } from "react";
import { sendMessageToSupport, getActiveSupportChat } from "@/app/support/actions";
import { MessageCircle, Send, Sparkles } from "lucide-react";

export default function SupportWidget({ role = "CUSTOMER" }: { role?: "CUSTOMER" | "DRIVER" | "MERCHANT" }) {
    const SUPPORT_OPEN_EVENT = "ts:support:open";
    const shortcutPrompts = role === "CUSTOMER"
        ? [
            "Where is my order?",
            "I need help with delivery",
            "How do rewards work?",
        ]
        : role === "DRIVER"
            ? [
                "Help with an active delivery",
                "Question about pay",
                "Document or onboarding help",
            ]
            : [
                "Help with an order",
                "POS or menu issue",
                "Payout question",
            ];

    const welcomeCopy = role === "CUSTOMER"
        ? "I’m Serv, your TrueServe helper. Pick a common question or send a short note. If it needs a person, I will hand it off."
        : role === "DRIVER"
            ? "I’m Serv. Send the issue and I will route driver support to the right place."
            : "I’m Serv. Send the issue and I will help with orders, menus, POS, or payouts.";

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [chatId, setChatId] = useState<string | null>(null);
    const [botStatus, setBotStatus] = useState<string>("BOT_ACTIVE");
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const openButtonRef = useRef<HTMLButtonElement>(null);

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
                content: welcomeCopy
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

    useEffect(() => {
        if (!isOpen) return;

        const previousActive = document.activeElement as HTMLElement | null;
        setTimeout(() => inputRef.current?.focus(), 50);

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
                return;
            }

            if (event.key !== "Tab") return;
            const modal = document.querySelector<HTMLElement>('[data-support-modal="true"]');
            if (!modal) return;
            const focusable = Array.from(
                modal.querySelectorAll<HTMLElement>(
                    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
                )
            ).filter((el) => !el.hasAttribute("aria-hidden"));

            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            if (previousActive && typeof previousActive.focus === "function") {
                previousActive.focus();
            } else {
                openButtonRef.current?.focus();
            }
        };
    }, [isOpen]);

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

    const handleShortcut = (prompt: string) => {
        setInput(prompt);
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    return (
        <div className="support-widget-shell fixed bottom-6 right-6 z-[9999]">
            <style dangerouslySetInnerHTML={{ __html: `
                @media (max-width: 640px) {
                    .support-widget-shell { bottom: 76px !important; right: 12px !important; }
                }
                .chat-modal { 
                    position: fixed; bottom: 92px; right: 24px; width: min(380px, calc(100vw - 32px)); background: #0d100f; 
                    border: 1px solid rgba(255,255,255,0.12); border-radius: 18px; display: flex; flex-direction: column; 
                    box-shadow: 0 22px 70px rgba(0,0,0,0.46); overflow: hidden; animation: fadeInUp 0.22s ease;
                    z-index: 10000;
                }
                @media (max-width: 640px) {
                    .chat-modal { bottom: 74px; right: 10px; left: 10px; width: auto; height: auto; max-height: calc(100vh - 96px); border-radius: 18px; }
                    .chat-body { height: min(320px, calc(100vh - 318px)); min-height: 260px; }
                }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                
                .chat-hd { display: flex; align-items: center; gap: 12px; padding: 15px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); background: linear-gradient(180deg, #111714, #0c0f0e); }
                .chat-icon { width: 38px; height: 38px; background: rgba(255,111,31,0.16); border: 1px solid rgba(255,111,31,0.34); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #ff741f; }
                .chat-title { font-size: 14px; font-weight: 800; color: #fff; margin-bottom: 2px; }
                .chat-status { font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.55); display: flex; align-items: center; gap: 6px; }
                .live-dot { width: 6px; height: 6px; background: #3dd68c; border-radius: 50%; animation: pulse 2.4s infinite; }
                @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
                .chat-close { margin-left: auto; cursor: pointer; color: rgba(255,255,255,0.62); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 8px 10px; font-size: 12px; font-weight: 800; outline: none; }
                .chat-close:hover { color: #fff; border-color: rgba(255,255,255,0.18); }

                .chat-body { flex: 1; padding: 16px; height: 330px; overflow-y: auto; background: #0d100f; }
                .msg-group { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 16px; }
                .msg-icon { width: 26px; height: 26px; background: rgba(255,111,31,0.12); border: 1px solid rgba(255,111,31,0.24); border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 4px; color: #ff741f; font-size: 11px; }
                .msg-label { font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.44); margin-bottom: 4px; display: block; }
                .bubble { background: rgba(255,255,255,0.055); border: 1px solid rgba(255,255,255,0.08); padding: 12px 14px; font-size: 13px; color: rgba(255,255,255,0.78); line-height: 1.5; border-radius: 12px; max-width: 90%; }
                
                .user-group { display: flex; justify-content: flex-end; margin-bottom: 16px; }
                .user-bubble { background: rgba(249,115,22,0.14); border: 1px solid rgba(249,115,22,0.28); padding: 12px 14px; font-size: 13px; color: #fff; max-width: 82%; line-height: 1.5; border-radius: 12px; }
                .quick-row { display: flex; flex-wrap: wrap; gap: 8px; margin: -2px 0 16px 34px; }
                .quick-chip { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.78); border-radius: 999px; padding: 8px 10px; font-size: 11px; font-weight: 800; cursor: pointer; }
                .quick-chip:hover { border-color: rgba(249,115,22,0.42); color: #fff; }

                .input-row { display: flex; gap: 8px; padding: 12px; border-top: 1px solid rgba(255,255,255,0.1); background: #090b0a; }
                .chat-input { flex: 1; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #fff; font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 11px 13px; outline: none; border-radius: 12px; min-width: 0; }
                .chat-input::placeholder { color: rgba(255,255,255,0.34); }
                .chat-input:focus-visible { border-color: rgba(249,115,22,0.82); box-shadow: 0 0 0 4px rgba(249,115,22,0.16); }
                .send-btn { width: 44px; height: 44px; background: #f97316; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; border-radius: 12px; color: #0b0b0b; outline: none; }
                
                .float-btn { min-width: 154px; height: 58px; background: linear-gradient(180deg, #ff7b24, #ff6718); border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; color: #08131f; box-shadow: 0 14px 32px rgba(255,103,24,0.34), inset 0 -4px 0 rgba(0,0,0,0.1); border: 2px solid rgba(255,255,255,0.18); outline: none; font-size: 18px; font-weight: 950; letter-spacing: -0.02em; }
                .float-btn:hover { transform: translateY(-2px); box-shadow: 0 18px 38px rgba(255,103,24,0.42), inset 0 -4px 0 rgba(0,0,0,0.1); }
                .float-btn svg { color: #08131f; }
                @media (max-width: 640px) {
                    .support-widget-shell { bottom: 18px !important; right: 14px !important; }
                    .float-btn { min-width: 126px; height: 48px; font-size: 15px; }
                }
                @media (prefers-reduced-motion: reduce) {
                    .chat-modal, .float-btn, .live-dot { animation: none !important; transition: none !important; }
                    .float-btn:hover { transform: none; }
                }
            ` }} />

            {isOpen && (
                <div
                    className="chat-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="support-dialog-title"
                    data-support-modal="true"
                >
                    <div className="chat-hd">
                        <div className="chat-icon">
                            <Sparkles size={19} aria-hidden="true" />
                        </div>
                        <div>
                            <div id="support-dialog-title" className="chat-title">Ask Serv</div>
                            <div className="chat-status"><span className="live-dot" aria-hidden="true"></span> Answers with human handoff</div>
                        </div>
                        <button className="chat-close" onClick={() => setIsOpen(false)} aria-label="Close support chat">Close</button>
                    </div>
                    
                    <div className="chat-body" aria-live="polite" aria-label="Support messages">
                        {messages.map((msg, idx) => {
                            const isUser = msg.sender === 'USER';
                            return isUser ? (
                                <div key={msg.id || idx} className="user-group">
                                    <div className="user-bubble">{msg.content}</div>
                                </div>
                            ) : (
                                <div key={msg.id || idx} className="msg-group">
                                    <div className="msg-icon">
                                        <Sparkles size={14} aria-hidden="true" />
                                    </div>
                                    <div>
                                        <span className="msg-label">{msg.sender === 'HUMAN_AGENT' ? "Human support" : "Serv"}</span>
                                        <div className="bubble">{msg.content}</div>
                                    </div>
                                </div>
                            );
                        })}
                        {messages.length <= 1 && (
                            <div className="quick-row" aria-label="Common support questions">
                                {shortcutPrompts.map((prompt) => (
                                    <button
                                        key={prompt}
                                        type="button"
                                        className="quick-chip"
                                        onClick={() => handleShortcut(prompt)}
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        )}
                        {isTyping && (
                            <div className="msg-group">
                                <div className="msg-icon animate-pulse" aria-hidden="true">...</div>
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
                            aria-label="Message TrueServe support"
                        />
                        <button className="send-btn" type="submit" aria-label="Send support message">
                            <Send size={17} aria-hidden="true" />
                        </button>
                    </form>
                </div>
            )}

            {!isOpen && (
                <button
                    ref={openButtonRef}
                    className="float-btn"
                    data-tour="support-fab"
                    onClick={() => setIsOpen(true)}
                    aria-label="Ask Serv for help"
                >
                    <MessageCircle size={20} aria-hidden="true" />
                    <span>Ask Serv</span>
                </button>
            )}
        </div>
    );
}
