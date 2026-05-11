import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { canAccessAdminSection } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase-admin";
import AdminPortalWrapper from "../AdminPortalWrapper";
import AdminRestaurantGrid from "./AdminRestaurantGrid";

export const dynamic = "force-dynamic";

export default async function AdminRestaurantsPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && canAccessAdminSection(role, "users"));
    if (!isAuthorized) redirect("/admin/login");

    const { data: restaurants } = await supabaseAdmin
        .from("Restaurant")
        .select("id, name, imageUrl, cuisineType, visibility, city, state, ownerEmail, stripeAccountId, openTime, closeTime, posSystem, posType, posClientId, menuItems:MenuItem(id)")
        .order("name", { ascending: true });

    return (
        <AdminPortalWrapper role={role}>
            <div style={{ padding: "0 0 40px" }}>
                <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: 11, color: "#f97316", fontWeight: 800, letterSpacing: ".15em", textTransform: "uppercase", margin: "0 0 6px" }}>
                        Admin · Restaurants
                    </p>
                    <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", margin: 0 }}>Restaurant Readiness</h1>
                    <p style={{ fontSize: 13, color: "#555", margin: "4px 0 0" }}>
                        Review launch readiness, cover photos, cuisine labels, payout state, menu presence, hours, and POS status.
                    </p>
                </div>
                <AdminRestaurantGrid restaurants={restaurants || []} />
            </div>
        </AdminPortalWrapper>
    );
}
