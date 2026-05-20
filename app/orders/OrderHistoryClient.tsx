'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type FilterTab = 'ALL' | 'DELIVERED' | 'CANCELLED';

interface Restaurant {
    name?: string;
    imageUrl?: string;
    rating?: number;
}

interface Order {
    id: string;
    status: string;
    total?: number | null;
    createdAt: string;
    restaurantId?: string;
    restaurant?: Restaurant;
    items?: { name: string }[];
    _count?: { items?: number };
    itemCount?: number;
    reorderItems?: { id: string; quantity: number }[];
}

interface Props {
    activeOrders: Order[];
    pastOrders: Order[];
}

const TAB_LABELS: { key: FilterTab; label: string }[] = [
    { key: 'ALL',       label: 'All'       },
    { key: 'DELIVERED', label: 'Delivered' },
    { key: 'CANCELLED', label: 'Cancelled' },
];

export default function OrderHistoryClient({ activeOrders, pastOrders }: Props) {
    const router = useRouter();
    const [filter, setFilter] = useState<FilterTab>('ALL');

    const filteredPast = pastOrders.filter(o => {
        if (filter === 'ALL') return true;
        return o.status === filter;
    });

    function handleReorder(order: Order) {
        const restaurantId = order.restaurantId;
        if (!restaurantId) return;

        try {
            localStorage.setItem(
                `ts.reorder.${restaurantId}`,
                JSON.stringify({
                    orderId: order.id,
                    restaurantId,
                    items: order.reorderItems || [],
                    createdAt: new Date().toISOString(),
                })
            );
        } catch { }

        router.push(`/restaurants/${restaurantId}?reorder=1`);
    }

    return (
        <>
            {/* ── ACTIVE ORDERS ── */}
            <section className="space-y-6 mb-12">
                <h3 className="food-kicker px-2 mb-4">Active Orders</h3>

                {activeOrders.length > 0 ? (
                    <div className="space-y-4">
                        {activeOrders.map(order => (
                            <Link
                                key={order.id}
                                href={`/orders/${order.id}`}
                                className="block relative bg-[linear-gradient(180deg,rgba(21,24,32,.96),rgba(12,14,19,.98))] border border-white/8 rounded-[2rem] p-6 shadow-2xl active:scale-[0.98] transition-all overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#E8A020]/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-[#E8A020]/10 transition-all" />
                                <div className="flex gap-4 items-center relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-2xl">Order</div>
                                    <div className="flex-1">
                                        <h4 className="font-bebas text-2xl text-white tracking-widest uppercase leading-none mb-1">
                                            {order.restaurant?.name || 'Kitchen'}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#E8A020] animate-pulse" />
                                            <span className="font-barlow-cond text-[10px] font-black text-[#E8A020] uppercase tracking-widest">
                                                {order.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bebas text-2xl text-white tracking-tighter">➔</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="food-panel text-center py-10">
                        <div className="text-3xl mb-3">Delivery</div>
                        <p className="font-barlow-cond text-[10px] font-black uppercase tracking-widest text-white/30">
                            No active orders right now
                        </p>
                        <p className="text-white/20 text-xs mt-1">Place an order to see it here.</p>
                    </div>
                )}
            </section>

            {/* ── PAST ORDERS ── */}
            <section className="space-y-4">
                {/* Header row: label + filter tabs */}
                <div className="flex items-center justify-between px-2 mb-2 flex-wrap gap-3">
                    <h3 className="food-kicker">Past Orders</h3>

                    <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-2xl p-1">
                        {TAB_LABELS.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={[
                                    'px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                                    filter === key
                                        ? 'bg-[#f97316] text-black shadow-lg'
                                        : 'text-white/40 hover:text-white/70',
                                ].join(' ')}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredPast.length > 0 ? (
                    <div className="space-y-3">
                        {filteredPast.map(order => {
                            const itemCount = order.itemCount ?? order._count?.items ?? order.items?.length ?? 0;
                            const restaurantId = order.restaurantId ?? order.id; // fallback

                            return (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between p-6 bg-[linear-gradient(180deg,rgba(21,24,32,.92),rgba(12,14,19,.96))] border border-white/5 rounded-3xl group"
                                >
                                    {/* Left: info */}
                                    <Link href={`/orders/${order.id}`} className="flex-1 min-w-0 mr-4">
                                        <p className="font-bold text-white tracking-tight barlow-cond uppercase truncate">
                                            {order.restaurant?.name ?? 'Restaurant'}
                                        </p>
                                        {itemCount > 0 && (
                                            <p className="font-barlow-cond text-[9px] font-black text-[#f97316]/70 uppercase tracking-widest mt-0.5">
                                                {itemCount} item{itemCount !== 1 ? 's' : ''}
                                            </p>
                                        )}
                                        <p className="font-barlow-cond text-[9px] font-black text-[#444] uppercase tracking-widest mt-0.5">
                                            {new Date(order.createdAt).toLocaleDateString()} · #{order.id.slice(-6).toUpperCase()}
                                        </p>
                                    </Link>

                                    {/* Right: total + status + reorder */}
                                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                                        <p className="font-bebas text-xl text-white tracking-widest leading-none">
                                            ${Number(order.total || 0).toFixed(2)}
                                        </p>
                                        <p className={[
                                            'font-barlow-cond text-[8px] font-black uppercase tracking-widest',
                                            order.status === 'DELIVERED' ? 'text-[#3dd68c]' : 'text-[#e24b4a]',
                                        ].join(' ')}>
                                            {order.status}
                                        </p>
                                        {order.status === 'DELIVERED' && (
                                            <button
                                                type="button"
                                                className="text-[10px] font-black uppercase tracking-widest text-[#f97316] hover:text-[#f97316]/80 transition-colors mt-0.5"
                                                style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }}
                                                onClick={() => handleReorder(order)}
                                            >
                                                Reorder →
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="food-panel text-center py-10">
                        <div className="text-3xl mb-3">
                            {filter === 'CANCELLED' ? 'Cancelled' : 'Receipt'}
                        </div>
                        <p className="font-barlow-cond text-[10px] font-black uppercase tracking-widest text-white/30">
                            {filter === 'ALL'
                                ? 'No past orders yet'
                                : `No ${filter.toLowerCase()} orders`}
                        </p>
                    </div>
                )}
            </section>
        </>
    );
}
