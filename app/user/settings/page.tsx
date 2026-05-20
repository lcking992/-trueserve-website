import Link from "next/link";
import { redirect } from "next/navigation";
import {
    ArrowRight,
    Crown,
    Gift,
    Heart,
    Home,
    MapPin,
    Plus,
    ReceiptText,
    Star,
    Target,
    Trophy,
    WalletCards,
    Zap,
} from "lucide-react";
import ProfileAvatar from "@/components/ProfileAvatar";
import Logo from "@/components/Logo";
import { getAuthSession } from "@/app/auth/actions";
import WalletUI from "@/components/WalletUI";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAccountHomeHref, isCustomerRole } from "@/lib/account-routing";
import NotificationBell from "@/components/NotificationBell";

export const dynamic = "force-dynamic";

function parseSavedAddresses(raw: unknown) {
    if (!raw) return [];
    try {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function money(value: unknown) {
    const amount = Number(value || 0);
    return `$${amount.toFixed(2)}`;
}

export default async function UserSettings() {
    const { isAuth, userId, role } = await getAuthSession();
    if (!isAuth || !userId) redirect("/login");
    if (!isCustomerRole(role)) redirect(getAccountHomeHref(role));

    const [{ data: user }, ordersResult, favoritesResult] = await Promise.all([
        supabaseAdmin
            .from("User")
            .select("id, name, email, avatarColor, avatarUrl, plan, truePointsBalance, savedAddresses")
            .eq("id", userId)
            .maybeSingle(),
        supabaseAdmin
            .from("Order")
            .select("id, restaurantId, totalAmount, status, createdAt, restaurant:Restaurant(id, name, rating)")
            .eq("userId", userId)
            .order("createdAt", { ascending: false })
            .limit(8),
        supabaseAdmin
            .from("Favorite")
            .select("restaurantId, restaurant:Restaurant(id, name, rating, category, city, state)")
            .eq("userId", userId)
            .limit(6),
    ]);

    if (!user) redirect("/login");

    const orders = ordersResult.data || [];
    const favorites = favoritesResult.data || [];
    const addresses = parseSavedAddresses(user.savedAddresses);
    const points = Number(user.truePointsBalance || 0);
    const plan = user.plan || "Basic";
    const level = Math.max(1, Math.floor(points / 250) + 1);
    const nextTierPoints = plan === "Premium" ? 0 : plan === "Plus" ? Math.max(3000 - points, 0) : Math.max(1200 - points, 0);
    const progress = plan === "Premium" ? 100 : Math.max(6, Math.min(100, Math.round((points / (plan === "Plus" ? 3000 : 1200)) * 100)));

    return (
        <div className="ts-app-shell ts-account-page">
            <header className="ts-app-header">
                <Link href="/" aria-label="TrueServe home">
                    <Logo size="sm" />
                </Link>
                <nav className="ts-app-desktop-nav" aria-label="Account navigation">
                    <Link href="/restaurants">Order</Link>
                    <Link href="/rewards">Rewards</Link>
                    <Link href="/orders">Orders</Link>
                    <Link href="/user/settings" className="active">Account</Link>
                </nav>
                <NotificationBell userId={userId} />
                <Link href="/restaurants" className="ts-app-order-now">Order now</Link>
            </header>

            <main>
                <section className="ts-account-hero">
                    <div className="ts-account-avatar">
                        <ProfileAvatar
                            userId={userId}
                            initialName={user.name || ""}
                            initialColor={user.avatarColor || "#E8A230"}
                            initialUrl={user.avatarUrl}
                            className="h-24 w-24"
                        />
                    </div>
                    <div className="ts-account-profile-copy">
                        <div className="ts-account-name-row">
                            <h1 className="ts-account-name">{user.name || "Your TrueServe Account"}</h1>
                            <span><Crown size={16} aria-hidden="true" /> {plan} Member</span>
                            <span><Zap size={16} aria-hidden="true" /> Level {level}</span>
                        </div>
                        <p>{user.email}</p>
                        <div className="ts-account-progress" aria-label={`${progress}% toward next rewards tier`}>
                            <div>
                                <strong>{points.toLocaleString()} XP</strong>
                                <strong>{nextTierPoints.toLocaleString()} XP to {plan === "Plus" ? "Premium" : "Plus"}</strong>
                            </div>
                            <span><i style={{ width: `${progress}%` }} /></span>
                        </div>
                    </div>
                    <div className="ts-account-stat-stack" aria-label="Account stats">
                        <div><strong>{orders.length}</strong><span>Orders</span></div>
                        <div><strong>{points.toLocaleString()}</strong><span>Points</span></div>
                        <div><strong>{money(points * 0.01)}</strong><span>Credit value</span></div>
                    </div>
                </section>

                <nav className="ts-account-tabs" aria-label="Account sections">
                    <a href="#overview"><Trophy size={19} /> Overview</a>
                    <a href="#wallet"><WalletCards size={19} /> Wallets</a>
                    <Link href="/user/settings/addresses"><MapPin size={19} /> Addresses</Link>
                    <Link href="/user/favorites"><Heart size={19} /> Favorites</Link>
                </nav>

                <section id="overview" className="ts-account-grid">
                    <article className="ts-account-card ts-account-wide">
                        <h2><Trophy size={26} /> Badges</h2>
                        <div className="ts-account-badges">
                            {[
                                { label: "First Bite", detail: "Account ready", active: true, icon: Star },
                                { label: "Local Loyal", detail: `${orders.length} orders`, active: orders.length > 0, icon: Heart },
                                { label: "Point Starter", detail: `${points.toLocaleString()} points`, active: points > 0, icon: Zap },
                                { label: "Explorer", detail: `${favorites.length} saved`, active: favorites.length > 0, icon: Target },
                                { label: "Gift Ready", detail: "Send food as gifts", active: true, icon: Gift },
                                { label: "Neighborhood Pro", detail: "3 kitchens tried", active: orders.length >= 3, icon: Home },
                            ].map((badge) => {
                                const Icon = badge.icon;
                                return (
                                    <div key={badge.label} className={badge.active ? "active" : ""}>
                                        <Icon size={24} aria-hidden="true" />
                                        <strong>{badge.label}</strong>
                                        <span>{badge.detail}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </article>

                    <aside className="ts-account-card">
                        <h2><Crown size={25} /> Membership</h2>
                        <div className="ts-account-membership">
                            <span>Current</span>
                            <strong>{plan}</strong>
                            <p>{plan === "Basic" ? "Free rewards tracking. Upgrade when you want faster earning." : "Rewards multipliers and priority support are active."}</p>
                            <Link href="/rewards">Manage plan</Link>
                        </div>
                    </aside>

                    <article className="ts-account-card ts-account-wide">
                        <h2><Target size={25} /> Active quests</h2>
                        <div className="ts-account-quests">
                            <div>
                                <strong>Order from 3 local restaurants</strong>
                                <span>+500 XP</span>
                                <i><b style={{ width: `${Math.min(100, (orders.length / 3) * 100)}%` }} /></i>
                                <small>{Math.min(orders.length, 3)} / 3</small>
                            </div>
                            <div>
                                <strong>Save your first favorite</strong>
                                <span>Badge unlock</span>
                                <i><b style={{ width: favorites.length > 0 ? "100%" : "8%" }} /></i>
                                <small>{favorites.length > 0 ? "Complete" : "Not started"}</small>
                            </div>
                        </div>
                    </article>

                    <aside className="ts-account-card">
                        <h2><ReceiptText size={24} /> Recent orders</h2>
                        <div className="ts-account-list">
                            {orders.length > 0 ? orders.slice(0, 4).map((order: any) => (
                                <Link key={order.id} href={`/orders/${order.id}`}>
                                    <span>{order.restaurant?.name || "TrueServe order"}</span>
                                    <strong>{money(order.totalAmount)}</strong>
                                </Link>
                            )) : (
                                <p className="ts-account-empty">No orders yet. Start with your address to find local kitchens.</p>
                            )}
                        </div>
                    </aside>
                </section>

                <section id="favorites" className="ts-account-card ts-account-full">
                    <h2><Heart size={25} /> Favorites</h2>
                    {favorites.length > 0 ? (
                        <div className="ts-account-favorites">
                            {favorites.slice(0, 4).map((favorite: any) => (
                                <Link key={favorite.restaurantId} href={`/restaurants/${favorite.restaurantId}`}>
                                    <div><Star size={16} fill="currentColor" /> {Number(favorite.restaurant?.rating || 4.9).toFixed(1)}</div>
                                    <strong>{favorite.restaurant?.name || "Saved restaurant"}</strong>
                                    <span>{favorite.restaurant?.category || favorite.restaurant?.city || "Local partner"}</span>
                                    <em>Order again</em>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="ts-account-empty-state">
                            <p>No favorites saved yet.</p>
                            <Link href="/restaurants">Find restaurants <ArrowRight size={16} /></Link>
                        </div>
                    )}
                </section>

                <section id="addresses" className="ts-account-card ts-account-full">
                    <h2><MapPin size={25} /> Addresses</h2>
                    <div className="ts-account-addresses">
                        {addresses.slice(0, 3).map((address: any) => (
                            <article key={address.id || address.address}>
                                <span>{address.isDefault ? "Default" : "Saved"}</span>
                                <strong>{address.label || "Delivery address"}</strong>
                                <p>{address.address}</p>
                                <Link href="/user/settings/addresses">Edit</Link>
                            </article>
                        ))}
                        <Link href="/user/settings/addresses" className="ts-account-add-card">
                            <Plus size={24} aria-hidden="true" />
                            Add address
                        </Link>
                    </div>
                </section>

                <section id="wallet" className="ts-account-card ts-account-full">
                    <h2><WalletCards size={25} /> Wallets</h2>
                    <WalletUI userId={userId} />
                </section>
            </main>
        </div>
    );
}
