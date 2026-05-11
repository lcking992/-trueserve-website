import Link from "next/link";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";
import { getAuthSession } from "@/app/auth/actions";
import { getAccountHomeHref, isCustomerRole } from "@/lib/account-routing";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function computeIsOpen(openTime?: string | null, closeTime?: string | null) {
  const open = openTime?.slice(0, 5);
  const close = closeTime?.slice(0, 5);
  if (!open || !close) return null;
  const now = new Date().toTimeString().slice(0, 5);
  return now >= open && now <= close;
}

export default async function FavoriteRestaurantsPage() {
  const { isAuth, userId, role } = await getAuthSession();
  if (!isAuth || !userId) redirect("/login");
  if (!isCustomerRole(role)) redirect(getAccountHomeHref(role));

  const { data: favoriteRows } = await supabaseAdmin
    .from("Favorite")
    .select("restaurantId")
    .eq("userId", userId);

  const favoriteIds = (favoriteRows || []).map((row: any) => row.restaurantId).filter(Boolean);

  const [restaurantsResult, recentOrdersResult] = await Promise.all([
    favoriteIds.length
      ? supabaseAdmin
          .from("Restaurant")
          .select("id, name, imageUrl, rating, city, state, openTime, closeTime, visibility")
          .in("id", favoriteIds)
      : Promise.resolve({ data: [], error: null }),
    favoriteIds.length
      ? supabaseAdmin
          .from("Order")
          .select("id, restaurantId, total, createdAt, status")
          .eq("userId", userId)
          .eq("status", "DELIVERED")
          .in("restaurantId", favoriteIds)
          .order("createdAt", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ]);

  const restaurants = (restaurantsResult.data || []).filter((restaurant: any) => restaurant.visibility !== "HIDDEN");
  const recentOrders = recentOrdersResult.data || [];

  const mostRecentOrderByRestaurant = new Map<string, any>();
  for (const order of recentOrders) {
    if (!mostRecentOrderByRestaurant.has(order.restaurantId)) {
      mostRecentOrderByRestaurant.set(order.restaurantId, order);
    }
  }

  return (
    <div className="food-app-shell">
      <nav className="food-app-nav">
        <div className="mx-auto flex items-center justify-between px-4 sm:px-0" style={{ width: "min(1180px, calc(100% - 32px))", padding: "14px 0" }}>
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <Link href="/user/settings" className="btn btn-ghost">← Back to Account</Link>
          </div>
          <NotificationBell userId={userId} />
        </div>
      </nav>

      <main className="food-app-main">
        <section className="food-panel">
          <p className="food-kicker mb-2">Saved restaurants</p>
          <h1 className="food-heading">Favorites <span className="accent">& Reorder</span></h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62">
            Keep your go-to spots close, jump back into a menu quickly, and use your most recent delivered order as a faster starting point.
          </p>
        </section>

        <section className="mt-8">
          {restaurants.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {restaurants.map((restaurant: any) => {
                const recentOrder = mostRecentOrderByRestaurant.get(restaurant.id);
                const isOpen = computeIsOpen(restaurant.openTime, restaurant.closeTime);
                return (
                  <article key={restaurant.id} className="food-card overflow-hidden p-0">
                    <div
                      style={{
                        height: 180,
                        backgroundImage: `linear-gradient(180deg, rgba(7,10,14,0.15), rgba(7,10,14,0.7)), url('${restaurant.imageUrl || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80"}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <div className="p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h2 className="text-[28px] font-black uppercase tracking-[0.05em] text-white">{restaurant.name}</h2>
                          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/45">
                            {(restaurant.city && restaurant.state) ? `${restaurant.city}, ${restaurant.state}` : "Local restaurant partner"}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/68">
                            ★ {Number(restaurant.rating || 4.9).toFixed(1)}
                          </span>
                          {isOpen !== null ? (
                            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${isOpen ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>
                              {isOpen ? "Open now" : "Closed"}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-5 rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/36">Most recent delivered order</p>
                        {recentOrder ? (
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-white">
                                ${Number(recentOrder.total || 0).toFixed(2)} · {new Date(recentOrder.createdAt).toLocaleDateString()}
                              </p>
                              <p className="mt-1 text-xs text-white/50">Open the menu again to rebuild this order from your favorite restaurant.</p>
                            </div>
                            <Link href={`/orders/${recentOrder.id}`} className="btn btn-ghost">
                              View Order
                            </Link>
                          </div>
                        ) : (
                          <p className="mt-3 text-sm text-white/55">You’ve saved this spot, but you haven’t completed a delivered order here yet.</p>
                        )}
                      </div>

                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <Link href={`/restaurants/${restaurant.id}`} className="btn btn-gold">
                          Order Again
                        </Link>
                        <Link href={`/restaurants/${restaurant.id}`} className="btn btn-ghost">
                          View Menu
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="food-panel text-center">
              <p className="food-kicker mb-3">Nothing saved yet</p>
              <h2 className="food-heading !text-[34px]">Start building your <span className="accent">go-to list</span></h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/58">
                Save restaurants while you browse so your usual order flow stays faster next time.
              </p>
              <div className="mt-6 flex justify-center">
                <Link href="/restaurants" className="btn btn-gold">Browse Restaurants</Link>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
