import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/Logo";
import { getAuthSession } from "@/app/auth/actions";
import OrderHistoryClient from "./OrderHistoryClient";
import NotificationBell from "@/components/NotificationBell";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
    const { userId } = await getAuthSession();
    if (!userId) redirect("/login");

    const supabase = await createClient();
    const { data: allOrders } = await supabase
        .from('Order')
        .select(`
            *,
            restaurant:Restaurant(id, name, imageUrl, rating),
            items:OrderItem(id, menuItemId, quantity)
        `)
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

    const orders = (allOrders || []).map((o: any) => ({
        ...o,
        restaurantId: o.restaurant?.id ?? o.restaurantId ?? null,
        itemCount: Array.isArray(o.items) ? o.items.length : 0,
        reorderItems: Array.isArray(o.items)
            ? o.items
                .filter((item: any) => item.menuItemId && item.quantity)
                .map((item: any) => ({ id: item.menuItemId, quantity: item.quantity }))
            : [],
    }));

    const activeOrders = orders.filter((o: any) =>
        ['PENDING', 'PREPARING', 'READY', 'READY_FOR_PICKUP', 'PICKED_UP'].includes(o.status)
    );
    const pastOrders = orders.filter((o: any) =>
        ['DELIVERED', 'CANCELLED'].includes(o.status)
    );

    return (
        <div className="food-app-shell overflow-x-hidden">
            <nav className="food-app-nav sticky top-0 z-[60] px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all">
                        <span className="text-sm">←</span>
                    </Link>
                    <div className="h-6 w-px bg-white/10" />
                    <Logo size="sm" />
                </div>
                <NotificationBell userId={userId} />
            </nav>

            <main className="food-app-main">
                <header className="food-panel mb-8">
                    <p className="food-kicker mb-3">Your account</p>
                    <h2 className="food-heading mb-2">Order <span className="accent">History</span></h2>
                    <p className="food-subtitle !max-w-none">
                        Review active deliveries and past orders — filter by status or reorder your favorites.
                    </p>
                </header>

                <OrderHistoryClient
                    activeOrders={activeOrders}
                    pastOrders={pastOrders}
                />
            </main>
        </div>
    );
}
