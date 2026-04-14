import { getAuthSession } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import SupportWidget from "@/components/SupportWidget";
import NotificationBell from "@/components/NotificationBell";
import { cookies } from "next/headers";

import DashboardNav from "@/components/DashboardNav";
import Logo from "@/components/Logo";

export default async function DriverDashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuth, name, userId } = await getAuthSession();
    
    // Auth Guard - Prioritize Preview Mode to end the loop
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    
    if (!isAuth && !isPreview) {
        redirect("/login");
    }

    // Fetch driver data for the balance/initials
    const supabase = await createClient();
    const { data: driverData } = isPreview ? { data: null } : await supabase
        .from('Driver')
        .select('*')
        .eq('userId', userId)
        .maybeSingle();

    const balance = isPreview ? 62.00 : (driverData?.balance || 0);
    const driverInitials = (name || driverData?.name || "Driver").split(" ").map((n: string) => n[0]).join("").toUpperCase();

    return (
        <>
        <div className="db">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&family=Barlow+Condensed:ital,wght@0,600;0,700;1,700;1,800&display=swap');
                
                body { background: #080a0f !important; font-family: 'DM Sans', sans-serif !important; color: #fff !important; margin: 0; padding: 0; }
                .db { 
                    background: radial-gradient(circle at 50% 0%, #101622 0%, #080a0f 100%); 
                    min-height: 100vh; position: relative; overflow-x: hidden;
                }
                .db::before {
                    content: ""; position: absolute; inset: 0; 
                    background-image: linear-gradient(rgba(16, 22, 34, .3) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 22, 34, .3) 1px, transparent 1px);
                    background-size: 40px 40px; pointer-events: none; opacity: 0.5;
                }
                .db::after {
                    content: ""; position: absolute; inset: 0; 
                    background: radial-gradient(circle at 80% 20%, rgba(232, 162, 48, 0.05) 0%, transparent 40%),
                                radial-gradient(circle at 20% 80%, rgba(61, 214, 140, 0.03) 0%, transparent 40%);
                    pointer-events: none;
                }

                .top-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 28px; height: 52px; border-bottom: 1px solid #1c1f28; background: #0c0e13; position: sticky; top: 0; z-index: 100; }
                .nav-brand { font-size: 15px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.05em; }
                .nav-brand span { color: #e8a230; }

                .nav-link { font-size: 11px; font-weight: 500; letter-spacing: 0.09em; text-transform: uppercase; color: #555; padding: 6px 12px; cursor: pointer; border-bottom: 2px solid transparent; transition: color .15s; text-decoration: none; }
                .nav-link:hover { color: #999; }
                .nav-link.active { color: #e8a230; border-bottom-color: #e8a230; }

                .balance-wrap { display: flex; flex-direction: column; align-items: flex-end; margin-right: 4px; }
                .balance-lbl { font-size: 9px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #444; }
                .balance-val { font-size: 13px; font-weight: 700; font-family: 'DM Mono', monospace; color: #e8a230; }

                .mode-tabs { display: flex; gap: 1px; }
                .mode-tab { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 7px 14px; background: #131720; border: 1px solid #1c1f28; color: #555; cursor: pointer; }
                .mode-tab.active { background: #e8a230; color: #000; border-color: #e8a230; }

                .nav-av { width: 32px; height: 32px; background: #e8a230; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #000; flex-shrink: 0; }

                .sub-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 28px; height: 40px; background: #090b0f; border-bottom: 1px solid #1c1f28; position: sticky; top: 52px; z-index: 90; overflow-x: auto; }
                .sub-link { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #444; padding: 5px 12px; cursor: pointer; border-bottom: 2px solid transparent; text-decoration: none; white-space: nowrap; }
                .sub-link:hover { color: #888; }
                .sub-link.active { color: #e8a230; border-bottom-color: #e8a230; }

                .main-content { padding: 0; min-height: calc(100vh - 92px); position: relative; z-index: 10; }

                /* ── MOBILE ── */
                @media (max-width: 640px) {
                    .top-nav { padding: 0 16px; height: 52px; }
                    .nav-link { display: none; }
                    .balance-wrap { margin-right: 0; }
                    .balance-lbl { display: none; }
                    .balance-val { font-size: 14px; }
                    .mode-tabs { display: none; }
                    .sub-nav { padding: 0 16px; height: 40px; gap: 0; }
                    .sub-nav-logout { display: none; }
                }
            ` }} />
            
            <div className="top-nav">
                <div className="nav-brand">
                    <Logo size="sm" />
                </div>
                <div className="flex gap-2">
                    <Link href="/driver/dashboard" className="nav-link active">Fleet Hub</Link>
                </div>
                <div className="flex items-center gap-6">
                    <div className="balance-wrap">
                        <div className="balance-lbl">Balance</div>
                        <div className="balance-val">${balance.toFixed(2)}</div>
                    </div>
                    <div className="mode-tabs">
                        <div className="mode-tab active">Delivery</div>
                        <div className="mode-tab">Pickup</div>
                    </div>
                    <div className="nav-av">{driverInitials}</div>
                </div>
            </div>

            <div className="sub-nav">
                <DashboardNav />
                <div className="sub-nav-logout text-[10px] font-bold uppercase tracking-widest text-[#2a2f3a] hover:text-[#444]">
                    <LogoutButton />
                </div>
            </div>

            <main className="main-content">
                {children}
            </main>
        </div>
        <SupportWidget role="DRIVER" />
    </>
    );
}
