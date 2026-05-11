"use client";

import { useState } from "react";
import { getChatTranscript, replyToUser, resolveChat } from "@/app/admin/live-chats/actions";
import { formatDistanceToNow } from "date-fns";

export default function LiveChatDashboard({ initialChats }: { initialChats: any[] }) {
    const [activeChat, setActiveChat] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [reply, setReply] = useState("");
    const [loading, setLoading] = useState(false);

    const onSelectChat = async (chat: any) => {
        setActiveChat(chat);
        setMessages([]);
        const transcripts = await getChatTranscript(chat.id);
        setMessages(transcripts);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim() || !activeChat) return;

        const sent = reply;
        setReply("");
        
        // Optimistic UI updates
        const tempId = Date.now().toString();
        setMessages(prev => [...prev, { id: tempId, sender: 'HUMAN_AGENT', content: sent }]);
        
        setLoading(true);
        await replyToUser(activeChat.id, sent);
        // Refresh transcript just to be sure
        const nextMsgs = await getChatTranscript(activeChat.id);
        setMessages(nextMsgs);
        setLoading(false);
    };

    const handleResolve = async () => {
        if (!activeChat) return;
        if (confirm("Mark this chat as resolved? Claude assumes normal duties once closed.")) {
            await resolveChat(activeChat.id);
            setActiveChat(null);
            // In reality, we'd refetch initialChats from server or rely on Next.js revalidatePath
            window.location.reload();
        }
    };

    return (
        <>
            <style>{`
                .live-chat-shell {
                    display: flex;
                    gap: 0;
                    min-height: 700px;
                    margin-top: 24px;
                    background: #141a18;
                    border: 1px solid #1e2420;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .live-chat-inbox {
                    width: 340px;
                    min-width: 340px;
                    background: #0f1210;
                    border-right: 1px solid #1e2420;
                    display: flex;
                    flex-direction: column;
                }
                .live-chat-inbox-header {
                    padding: 14px 16px 12px;
                    border-bottom: 1px solid #1e2420;
                    background: rgba(255,255,255,0.01);
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                .live-chat-inbox-title {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                }
                .live-chat-inbox-title h3 {
                    margin: 0;
                    font-size: 11px;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: #8a8f8b;
                    font-weight: 800;
                }
                .live-chat-inbox-count {
                    font-size: 11px;
                    color: #f5a623;
                    background: rgba(245,166,35,0.08);
                    border: 1px solid rgba(245,166,35,0.18);
                    border-radius: 999px;
                    padding: 4px 8px;
                    white-space: nowrap;
                }
                .live-chat-inbox-meta {
                    margin-top: 8px;
                    font-size: 12px;
                    color: #666;
                    line-height: 1.5;
                }
                .live-chat-list {
                    flex: 1;
                    overflow-y: auto;
                }
                .live-chat-item {
                    text-align: left;
                    width: 100%;
                    padding: 14px 16px;
                    border-bottom: 1px solid #1e2420;
                    background: transparent;
                    transition: background 150ms ease, border-color 150ms ease;
                    outline: none;
                }
                .live-chat-item:hover {
                    background: rgba(255,255,255,0.03);
                }
                .live-chat-item.active {
                    background: rgba(245,166,35,0.06);
                    box-shadow: inset 2px 0 0 #f5a623;
                }
                .live-chat-item-top {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 12px;
                    margin-bottom: 6px;
                }
                .live-chat-item-name {
                    color: #fff;
                    font-size: 13px;
                    font-weight: 700;
                    line-height: 1.35;
                }
                .live-chat-item-badge {
                    font-size: 9px;
                    padding: 4px 8px;
                    border-radius: 999px;
                    font-weight: 800;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    white-space: nowrap;
                }
                .live-chat-item-badge.urgent {
                    background: rgba(248,113,113,0.12);
                    color: #f87171;
                    border: 1px solid rgba(248,113,113,0.2);
                }
                .live-chat-item-badge.normal {
                    background: rgba(52,211,153,0.1);
                    color: #34d399;
                    border: 1px solid rgba(52,211,153,0.18);
                }
                .live-chat-item-meta {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    font-size: 11px;
                    color: #6b7280;
                }
                .live-chat-room {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: #111614;
                }
                .live-chat-room-empty {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #666;
                    text-align: center;
                    padding: 24px;
                }
                .live-chat-room-empty p {
                    margin: 0;
                    font-size: 11px;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: #7b7f80;
                }
                .live-chat-room-header {
                    padding: 16px 18px 14px;
                    border-bottom: 1px solid #1e2420;
                    background: rgba(255,255,255,0.01);
                    display: flex;
                    justify-content: space-between;
                    gap: 16px;
                    align-items: flex-start;
                }
                .live-chat-room-header h3 {
                    margin: 0;
                    color: #fff;
                    font-size: 18px;
                    font-weight: 700;
                }
                .live-chat-room-header p {
                    margin: 4px 0 0;
                    font-size: 10px;
                    color: #7c8288;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                }
                .live-chat-room-button {
                    padding: 9px 14px;
                    border-radius: 6px;
                    border: 1px solid rgba(52,211,153,0.25);
                    background: rgba(52,211,153,0.12);
                    color: #34d399;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    cursor: pointer;
                    white-space: nowrap;
                }
                .live-chat-room-button:hover {
                    background: rgba(52,211,153,0.18);
                }
                .live-chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }
                .live-chat-message {
                    max-width: 70%;
                    padding: 14px 16px;
                    border-radius: 8px;
                    line-height: 1.55;
                }
                .live-chat-message.user {
                    align-self: flex-start;
                    background: #0f1210;
                    border: 1px solid #1e2420;
                    color: #d1d5db;
                    border-top-left-radius: 4px;
                }
                .live-chat-message.human {
                    align-self: flex-end;
                    background: #f5a623;
                    color: #0a0c09;
                    border-top-right-radius: 4px;
                    box-shadow: 0 8px 24px rgba(245,166,35,0.12);
                }
                .live-chat-message.bot {
                    align-self: flex-end;
                    background: rgba(52,211,153,0.08);
                    border: 1px solid rgba(52,211,153,0.2);
                    color: #dcfce7;
                    border-top-right-radius: 4px;
                }
                .live-chat-message-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 6px;
                    opacity: 0.65;
                }
                .live-chat-message-label span {
                    font-size: 9px;
                    font-weight: 900;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                }
                .live-chat-compose {
                    padding: 14px 16px;
                    border-top: 1px solid #1e2420;
                    background: #0f1210;
                    display: flex;
                    gap: 10px;
                }
                .live-chat-compose input {
                    flex: 1;
                    background: #141a18;
                    border: 1px solid #1e2420;
                    border-radius: 6px;
                    color: #fff;
                    padding: 11px 14px;
                    font-size: 13px;
                    outline: none;
                }
                .live-chat-compose input::placeholder {
                    color: #566066;
                }
                .live-chat-compose input:focus {
                    border-color: rgba(245,166,35,0.6);
                }
                .live-chat-compose button {
                    padding: 11px 16px;
                    border-radius: 6px;
                    border: none;
                    background: #f5a623;
                    color: #0a0c09;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    cursor: pointer;
                    white-space: nowrap;
                }
                .live-chat-compose button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                @media (max-width: 900px) {
                    .live-chat-shell {
                        flex-direction: column;
                        min-height: auto;
                    }
                    .live-chat-inbox {
                        width: 100%;
                        min-width: 0;
                    }
                    .live-chat-room {
                        min-height: 540px;
                    }
                    .live-chat-message {
                        max-width: 88%;
                    }
                }
            `}</style>

        <div className="live-chat-shell">
            
            {/* Sidebar Inbox */}
            <div className="live-chat-inbox">
                <div className="live-chat-inbox-header">
                    <div className="live-chat-inbox-title">
                        <h3>Active Live Chats</h3>
                        <span className="live-chat-inbox-count">{initialChats.length} Open</span>
                    </div>
                    <p className="live-chat-inbox-meta">
                        Use this inbox to triage escalations, jump into human handoffs, and close chats once resolved.
                    </p>
                </div>
                
                <div className="live-chat-list">
                {initialChats.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">No active chats in the system.</div>
                ) : (
                    initialChats.map(chat => {
                        const isUrgent = chat.status === 'HUMAN_REQUIRED';
                        return (
                            <button 
                                key={chat.id} 
                                onClick={() => onSelectChat(chat)}
                                className={`live-chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
                            >
                                <div className="live-chat-item-top">
                                    <p className="live-chat-item-name">{chat.User?.name || "Anonymous User"}</p>
                                    <span className={`live-chat-item-badge ${isUrgent ? 'urgent' : 'normal'}`}>
                                        {isUrgent ? "Escalated" : "AI"}
                                    </span>
                                </div>
                                <div className="live-chat-item-meta">
                                    <span className="font-mono uppercase">{chat.userRole}</span>
                                    <span>{formatDistanceToNow(new Date(chat.updatedAt))} ago</span>
                                </div>
                            </button>
                        );
                    })
                )}
                </div>
            </div>

            {/* Chat View */}
            <div className="live-chat-room">
                {!activeChat ? (
                    <div className="live-chat-room-empty">
                        <div>
                            <div className="text-4xl text-slate-700 mb-4">Chat</div>
                            <p>Select a chat to join live</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="live-chat-room-header">
                            <div>
                                <h3>{activeChat.User?.name || "User"}</h3>
                                <p>
                                    {activeChat.userRole} • Chat ID: {activeChat.id.split('-')[0]} 
                                    {activeChat.jiraTicketId && ` • Jira: ${activeChat.jiraTicketId}`}
                                </p>
                            </div>
                            <button 
                                onClick={handleResolve}
                                className="live-chat-room-button"
                            >
                                Mark Resolved
                            </button>
                        </div>
                        
                        <div className="live-chat-messages">
                            {messages.map(msg => {
                                const isUser = msg.sender === 'USER';
                                const isHumanAgent = msg.sender === 'HUMAN_AGENT';
                                const isBot = msg.sender === 'BOT';

                                return (
                                    <div key={msg.id} className={`live-chat-message ${isUser ? 'user' : isHumanAgent ? 'human' : 'bot'}`}>
                                        <div className="live-chat-message-label">
                                            <span>
                                                    {isUser ? activeChat.User?.name : isHumanAgent ? "Admin (You)" : "Claude AI"}
                                            </span>
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap leading-relaxed m-0">{msg.content}</p>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <form onSubmit={handleSend} className="live-chat-compose">
                            <input
                                type="text"
                                value={reply}
                                onChange={e => setReply(e.target.value)}
                                placeholder="Take over chat: Respond as human agent..."
                            />
                            <button 
                                type="submit" 
                                disabled={!reply.trim() || loading}
                            >
                                Send Reply
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
        </>
    );
}
