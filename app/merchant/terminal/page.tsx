"use client";

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    MenuItem: {
        name: string;
    };
}

interface Order {
    id: string;
    status: string;
    total: number;
    createdAt: string;
    User: {
        name: string;
    };
    OrderItems: OrderItem[];
}

export default function KitchenTerminal() {
    const supabase = createClient();
    const [orders, setOrders] = useState<Order[]>([]);
    const [restaurant, setRestaurant] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        fetchRestaurant();
    }, []);

    async function fetchRestaurant() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data: res } = await supabase
            .from('Restaurant')
            .select('*')
            .eq('ownerId', session.user.id)
            .single();

        if (res) {
            setRestaurant(res);
            fetchOrders(res.id);
            subscribeToOrders(res.id);
        }
    }

    async function fetchOrders(restaurantId: string) {
        const { data } = await supabase
            .from('Order')
            .select(`
                id,
                status,
                total,
                createdAt,
                User ( name ),
                OrderItems (
                    id,
                    quantity,
                    price,
                    MenuItem ( name )
                )
            `)
            .eq('restaurantId', restaurantId)
            .neq('status', 'COMPLETED')
            .order('createdAt', { ascending: true });

        if (data) setOrders(data as unknown as Order[]);
    }

    function subscribeToOrders(restaurantId: string) {
        supabase
            .channel('kitchen_orders')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'Order',
                filter: `restaurantId=eq.${restaurantId}`
            }, (payload: any) => {
                console.log("NEW ORDER:", payload);
                fetchOrders(restaurantId);
                playNotification();
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'Order',
                filter: `restaurantId=eq.${restaurantId}`
            }, () => {
                fetchOrders(restaurantId);
            })
            .subscribe();
    }

    function playNotification() {
        if (audioRef.current) {
            audioRef.current.play().catch(e => console.log("Audio play blocked by browser", e));
        }
    }

    async function updateStatus(orderId: string, currentStatus: string) {
        const statusMap: Record<string, string> = {
            'PENDING': 'PREPARING',
            'PREPARING': 'READY_FOR_PICKUP',
            'READY_FOR_PICKUP': 'COMPLETED'
        };

        const nextStatus = statusMap[currentStatus];
        if (!nextStatus) return;

        const { error } = await supabase
            .from('Order')
            .update({ status: nextStatus, updatedAt: new Date().toISOString() })
            .eq('id', orderId);

        if (!error) {
            fetchOrders(restaurant.id);
        }
    }

    if (!restaurant) return (
        <div className="min-h-screen bg-[#02040a] flex items-center justify-center">
            <div className="text-primary animate-pulse font-black uppercase tracking-[0.5em]">Initializing Terminal...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#02040a] text-white p-6 md:p-12 font-sans overflow-hidden flex flex-col">
            <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
            
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 relative z-10">
                <div className="flex items-center gap-6">
                    <Link href="/merchant/dashboard" className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all">
                        <svg className="w-5 h-5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter leading-tight">{restaurant.name}</h1>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">Live Kitchen Hub — Stable Connection</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/10">
                    <TabButton active={activeTab === 'ACTIVE'} onClick={() => setActiveTab('ACTIVE')} label="Active Orders" />
                    <TabButton active={activeTab === 'HISTORY'} onClick={() => setActiveTab('HISTORY')} label="History" />
                </div>
            </header>

            {/* Order Grid */}
            <main className="flex-1 overflow-x-auto pb-8 relative z-10 scrollbar-hide">
                <div className="flex gap-8 min-w-max h-full">
                    {orders.map((order) => (
                        <div key={order.id} className="animate-in fade-in zoom-in slide-in-from-bottom duration-500">
                           <OrderCard order={order} onUpdate={updateStatus} />
                        </div>
                    ))}

                    {orders.length === 0 && (
                        <div className="flex-1 w-full flex flex-col items-center justify-center opacity-20 py-40">
                            <span className="text-9xl mb-8">Kitchen</span>
                            <p className="text-2xl font-serif italic tracking-tight">The kitchen is quiet...</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Bottom Bar */}
            <footer className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center opacity-40">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em]">TrueServe Terminal v2.1 — Authorized Local KDS Mode</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-green-500">Live Listening</p>
                </div>
            </footer>
        </div>
    );
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button 
            onClick={onClick}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white'}`}
        >
            {label}
        </button>
    );
}

function OrderCard({ order, onUpdate }: { order: Order, onUpdate: (id: string, status: string) => void }) {
    const isNew = order.status === 'PENDING';
    const isPreparing = order.status === 'PREPARING';

    return (
        <div className={`w-[400px] h-full flex flex-col bg-[#05060a] border ${isNew ? 'border-red-500/30 ring-4 ring-red-500/10' : 'border-white/10'} rounded-[2.5rem] overflow-hidden group shadow-2xl shadow-black transition-all`}>
            {/* Header */}
            <div className={`p-8 border-b border-white/10 ${isNew ? 'bg-red-500/[0.03]' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 font-mono">#{order.id.slice(0, 8)}</span>
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isNew ? 'bg-red-500 text-white' : isPreparing ? 'bg-blue-500 text-white' : 'bg-primary text-black'}`}>
                        {order.status === 'READY_FOR_PICKUP' ? 'PICKUP READY' : order.status}
                    </span>
                </div>
                <h4 className="text-3xl font-serif italic text-white tracking-tighter truncate">{order.User.name}</h4>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-2">Ordered {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>

            {/* Items */}
            <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                {order.OrderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center group/item border-b border-white/[0.02] pb-4">
                        <div className="flex items-center gap-6">
                            <span className="text-primary font-black text-3xl italic">x{item.quantity}</span>
                            <span className="text-xl font-bold text-white tracking-tight">{item.MenuItem.name}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Action */}
            <div className="p-8 mt-auto bg-white/[0.02] border-t border-white/5">
                <button 
                    onClick={() => onUpdate(order.id, order.status)}
                    className={`w-full py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] transition-all italic flex items-center justify-center gap-3
                        ${isNew ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-primary text-black hover:scale-[1.02]'}
                    `}
                >
                    {isNew ? 'Confirm Order' : isPreparing ? 'Mark as Ready' : 'Picked Up / Complete'}
                    <span className="text-lg">→</span>
                </button>
            </div>
        </div>
    );
}
