import Link from "next/link";
import { redirect } from "next/navigation";
import ProfileAvatar from "@/components/ProfileAvatar";
import Logo from "@/components/Logo";
import { getAuthSession } from "@/app/auth/actions";
import WalletUI from "@/components/WalletUI";
import { supabaseAdmin } from "@/lib/supabase-admin";
import ReferralCard from "@/components/ReferralCard";
import { getAccountHomeHref, isCustomerRole } from "@/lib/account-routing";
import NotificationBell from "@/components/NotificationBell";

export const dynamic = "force-dynamic";

export default async function UserSettings() {
    const { isAuth, userId, role } = await getAuthSession();
    if (!isAuth || !userId) redirect("/login");
    if (!isCustomerRole(role)) redirect(getAccountHomeHref(role));

    const { data: user } = await supabaseAdmin.from('User').select('*').eq('id', userId).maybeSingle();

    if (!user) redirect("/login");

    return (
        <div className="food-app-shell">
            <nav className="food-app-nav">
                <div className="mx-auto flex items-center justify-between px-4 sm:px-0" style={{ width: "min(1180px, calc(100% - 32px))", padding: "14px 0" }}>
                    <Logo size="sm" />
                    <div className="flex items-center gap-3">
                        <NotificationBell userId={userId} />
                        <Link href="/" className="btn btn-ghost">← Back to Home</Link>
                    </div>
                </div>
            </nav>

            <main className="food-app-main">
                <section className="food-panel">
                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                        {/* Avatar with click hint */}
                        <div className="flex flex-col items-center gap-2 shrink-0">
                            <ProfileAvatar
                                userId={userId}
                                initialName={user?.name || ""}
                                initialColor={user?.avatarColor || "#E8A230"}
                                initialUrl={user?.avatarUrl}
                                className="h-28 w-28 sm:h-32 sm:w-32"
                            />
                            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/30">Click to edit</span>
                        </div>

                        {/* Profile info */}
                        <div className="flex-1 text-center sm:text-left min-w-0">
                            <p className="food-kicker mb-2">Customer Profile</p>
                            <h1 className="food-heading !text-[clamp(36px,6vw,64px)] leading-none">
                                {user?.name || "Account Settings"}
                            </h1>
                            <p className="mt-2 break-all text-sm text-white/45 sm:break-normal">{user?.email}</p>
                            <div className="food-chip-row mt-4 justify-center gap-2 sm:justify-start">
                                <div className="food-chip"><span className="food-chip-dot" />Tap avatar to customize</div>
                                <div className="food-chip"><span className="food-chip-dot" />Wallet below</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-8 grid gap-6 md:grid-cols-2">
                    <article className="food-card">
                        <p className="food-kicker mb-2">Profile</p>
                        <h3 className="food-heading !text-[30px] mb-2">Personal Info</h3>
                        <p className="text-sm leading-7 text-white/70 mb-4">Update your name, phone, and address details.</p>
                        <Link href="/user/settings/info" className="btn btn-gold">Edit Info</Link>
                    </article>

                    <article className="food-card">
                        <p className="food-kicker mb-2">Delivery</p>
                        <h3 className="food-heading !text-[30px] mb-2">Address Book</h3>
                        <p className="text-sm leading-7 text-white/70 mb-4">Save multiple delivery addresses for faster checkout.</p>
                        <Link href="/user/settings/addresses" className="btn btn-gold">Manage Addresses</Link>
                    </article>

                    <article className="food-card">
                        <p className="food-kicker mb-2">Favorites</p>
                        <h3 className="food-heading !text-[30px] mb-2">Saved & Reorder</h3>
                        <p className="text-sm leading-7 text-white/70 mb-4">Keep your go-to restaurants close and jump back into past favorites faster.</p>
                        <Link href="/user/favorites" className="btn btn-gold">Open Favorites</Link>
                    </article>

                    <article className="food-card">
                        <p className="food-kicker mb-2">Security</p>
                        <h3 className="food-heading !text-[30px] mb-2">Password</h3>
                        <p className="text-sm leading-7 text-white/70 mb-4">Manage your account password and sign-in safety.</p>
                        <Link href="/update-password" className="btn btn-ghost">Update Password</Link>
                    </article>

                    <article className="food-card">
                        <p className="food-kicker mb-2">Payments</p>
                        <h3 className="food-heading !text-[30px] mb-2">Wallet</h3>
                        <p className="text-sm leading-7 text-white/70 mb-4">Add and remove saved cards for faster checkout.</p>
                        <a href="#wallet" className="btn btn-gold">Manage Wallet</a>
                    </article>

                    <article className="food-card">
                        <p className="food-kicker mb-2">Loyalty</p>
                        <h3 className="food-heading !text-[30px] mb-2">TrueServe Rewards</h3>
                        <p className="text-sm leading-7 text-white/70 mb-4">
                            Current tier: <span className="text-[#f97316] font-bold">{user.plan || "Basic"}</span>. Manage points and membership here.
                        </p>
                        <Link href="/rewards" className="btn btn-gold">Open Rewards</Link>
                    </article>

                    <article className="food-card">
                        <p className="food-kicker mb-2">Support</p>
                        <h3 className="food-heading !text-[30px] mb-2">Need Help?</h3>
                        <p className="text-sm leading-7 text-white/70 mb-4">Reach support for account, delivery, or payment questions without digging through the footer.</p>
                        <Link href="/contact" className="btn btn-ghost">Contact Support</Link>
                    </article>

                    <ReferralCard userId={userId} />
                </section>

                <section id="wallet" className="mt-8">
                    <div className="food-panel">
                        <div className="food-section-head">
                            <div>
                                <p className="food-kicker mb-2">Payments</p>
                                <h2 className="food-heading">Saved Methods</h2>
                            </div>
                            <Link href="/restaurants" className="btn btn-ghost">Order Food</Link>
                        </div>
                        <WalletUI userId={userId} />
                    </div>
                </section>
            </main>
        </div>
    );
}
