"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getNotifications, markNotificationAsRead, markAllAsRead } from "@/app/user/notification-actions";
import Link from "next/link";

export default function NotificationBell({ userId }: { userId: string }) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchInitial = async () => {
            const data = await getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter((n: any) => !n.isRead).length);
        };
        fetchInitial();

        // Real-time subscription
        const channel = supabase
            .channel(`user-notifications-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'Notification',
                    filter: `userId=eq.${userId}`
                },
                (payload: any) => {
                    setNotifications(prev => [payload.new, ...prev]);
                    setUnreadCount(prev => prev + 1);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const res = await markNotificationAsRead(id);
        if (res.success) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const handleMarkAllRead = async () => {
        const res = await markAllAsRead();
        if (res.success) {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
            >
                <svg className={`w-5 h-5 md:w-6 md:h-6 ${unreadCount > 0 ? "text-primary animate-pulse" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#080c14]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <h3 className="font-black text-sm uppercase tracking-widest text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-primary hover:underline">Mark all read</button>
                        )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center text-slate-500">
                                <p className="text-sm">No notifications yet.</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <Link
                                    key={notif.id}
                                    href={notif.orderId ? `/orders/${notif.orderId}` : "#"}
                                    onClick={() => setIsOpen(false)}
                                    className={`block p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors relative ${!notif.isRead ? "bg-primary/5" : ""}`}
                                >
                                    {!notif.isRead && (
                                        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full shadow-lg shadow-primary/20" />
                                    )}
                                    <div className="flex gap-3">
                                        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl
                                            ${notif.type === 'ORDER_UPDATE' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-400'}`}>
                                            {notif.type === 'ORDER_UPDATE' ? 'Order' : '✨'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <p className={`text-sm font-bold truncate ${!notif.isRead ? "text-white" : "text-slate-300"}`}>{notif.title}</p>
                                                <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter shrink-0 ml-2">
                                                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{notif.message}</p>
                                        </div>
                                    </div>
                                    {!notif.isRead && (
                                        <button
                                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                                            className="mt-2 text-[9px] font-black uppercase text-primary/60 hover:text-primary tracking-widest"
                                        >
                                            Dismiss
                                        </button>
                                    )}
                                </Link>
                            ))
                        )}
                    </div>
                    <Link
                        href="/account"
                        onClick={() => setIsOpen(false)}
                        className="block w-full text-center p-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all border-t border-white/5"
                    >
                        View All Activity
                    </Link>
                </div>
            )}
        </div>
    );
}
