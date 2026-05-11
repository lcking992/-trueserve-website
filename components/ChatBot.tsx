"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, X } from "lucide-react";

export type Message = {
    id: string;
    sender: 'BOT' | 'USER';
    content: string;
    timestamp: Date;
    resourceLinks?: Array<{ title: string; url: string }>;
};

interface ChatBotProps {
    title?: string;
    placeholder?: string;
    onSendMessage: (message: string) => Promise<Message>;
    initialMessage?: string;
    isOpen?: boolean;
    onClose?: () => void;
    compact?: boolean;
}

export default function ChatBot({
    title = "Help Bot",
    placeholder = "Ask a question...",
    onSendMessage,
    initialMessage,
    isOpen: externalIsOpen,
    onClose,
    compact = false,
}: ChatBotProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isOpen, setIsOpen] = useState(externalIsOpen ?? !compact);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize with welcome message
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcomeMsg: Message = {
                id: "welcome",
                sender: "BOT",
                content: initialMessage || `Hi! I'm ${title}. How can I help?`,
                timestamp: new Date(),
            };
            setMessages([welcomeMsg]);
        }
    }, [isOpen, initialMessage, title]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            sender: "USER",
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const botResponse = await onSendMessage(userMessage.content);
            setMessages((prev) => [...prev, botResponse]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMsg: Message = {
                id: Date.now().toString(),
                sender: "BOT",
                content: "Sorry, I encountered an error. Please try again.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    if (compact && !isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 rounded-full bg-[#f97316] p-4 shadow-lg hover:bg-[#d99620] transition-colors"
                aria-label={`Open ${title}`}
            >
                <MessageCircle className="h-6 w-6 text-white" />
            </button>
        );
    }

    return (
        <div className={`flex flex-col rounded-xl border border-white/10 bg-[#0b0f17] shadow-xl overflow-hidden ${compact ? 'fixed bottom-4 right-4 z-50 h-[420px] w-[min(360px,calc(100vw-32px))]' : 'w-full h-full min-h-[280px]'}`}>
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#10131b] px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#f97316]/25 bg-[#f97316]/10">
                        <MessageCircle className="h-4 w-4 text-[#f97316]" />
                    </span>
                    <div>
                        <h3 className="text-sm font-bold text-white">{title}</h3>
                        <p className="text-[11px] font-medium text-white/45">Answers based on your restaurant compliance profile.</p>
                    </div>
                </div>
                {compact && (
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            onClose?.();
                        }}
                        className="rounded hover:bg-white/10"
                        aria-label="Close chat"
                    >
                        <X className="h-5 w-5 text-white/50" />
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="min-h-0 flex-1 overflow-y-auto space-y-3 p-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[min(620px,92%)] rounded-xl px-4 py-3 shadow-sm break-words ${
                                msg.sender === 'USER'
                                    ? 'bg-[#f97316] text-black'
                                    : 'bg-white/10 text-white/90 border border-white/5'
                            }`}
                        >
                            <p className="text-sm leading-6 whitespace-pre-wrap break-words">{msg.content}</p>
                            {msg.resourceLinks && msg.resourceLinks.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {msg.resourceLinks.map((link, idx) => (
                                        <a
                                            key={idx}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`block text-xs underline ${
                                                msg.sender === 'USER'
                                                    ? 'text-black/70'
                                                    : 'text-[#68c7cc]'
                                            } hover:opacity-80`}
                                        >
                                            Attachment {link.title}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white/10 text-white/90 rounded-lg px-4 py-3">
                            <div className="flex gap-1">
                                <div className="h-2 w-2 rounded-full bg-white/50 animate-bounce" />
                                <div className="h-2 w-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '0.1s' }} />
                                <div className="h-2 w-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={handleSend}
                className="flex shrink-0 gap-2 border-t border-white/10 bg-[#10131b] p-3"
            >
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={placeholder}
                    disabled={isLoading}
                    className="min-w-0 flex-1 rounded-lg bg-white/5 px-3 py-2 text-sm text-white placeholder-white/50 border border-white/10 focus:outline-none focus:border-[#f97316]/50 disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="rounded-lg bg-[#f97316] p-2 text-black hover:bg-[#d99620] disabled:opacity-50 transition-colors"
                    aria-label="Send message"
                >
                    <Send className="h-4 w-4" />
                </button>
            </form>
        </div>
    );
}
