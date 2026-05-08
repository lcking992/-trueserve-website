import { getAuthSession } from "@/app/auth/actions";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import SupportWidget from "@/components/SupportWidget";
import PortalTour from "@/components/PortalTour";
import MerchantDashboardWrapper from "./MerchantDashboardWrapper";

export const dynamic = 'force-dynamic';

export default async function MerchantDashboardLayout({ children }: { children: React.ReactNode }) {
    const { userId } = await getAuthSession();
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    const cookieUserId = cookieStore.get("userId")?.value;

    const activeUserId = userId || cookieUserId;

    if (!activeUserId && !isPreview) {
        redirect('/login?role=merchant&next=/merchant/dashboard');
    }

    let restaurantName = "";
    let hasMultipleLocations = false;

    if (isPreview) {
        restaurantName = "Pilot Kitchen";
        hasMultipleLocations = true;
    } else {
        const { data: allRestaurants } = await supabaseAdmin
            .from('Restaurant')
            .select('id, name')
            .eq('ownerId', activeUserId)
            .order('createdAt', { ascending: true });

        restaurantName = (allRestaurants || [{}])[0]?.name || "";
        hasMultipleLocations = (allRestaurants || []).length > 1;
    }

    return (
        <MerchantDashboardWrapper restaurantName={restaurantName} hasMultipleLocations={hasMultipleLocations}>
            {children}
            <SupportWidget role="MERCHANT" />
            <PortalTour portal="MERCHANT" />
        </MerchantDashboardWrapper>
    );
}
