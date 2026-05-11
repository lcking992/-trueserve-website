import { getAuthSession } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import POSIntegration from "../POSIntegration";
import MerchantPortalRecovery from "../MerchantPortalRecovery";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    const cookieUserId = cookieStore.get("userId")?.value;
    const { isAuth, userId } = await getAuthSession();
    const activeUserId = userId || cookieUserId;

    if (!activeUserId && !isPreview) {
        redirect("/login?role=merchant");
    }

    let restaurant: any = null;

    if (isPreview) {
        restaurant = {
            apiKey: "ts_test_pk_12345",
            posType: "Toast"
        };
    } else {
        const { data, error } = await supabaseAdmin
            .from("Restaurant")
            .select('*')
            .eq("ownerId", activeUserId!)
            .maybeSingle();

        if (error || !data) {
            return <MerchantPortalRecovery />;
        }
        restaurant = data;
    }

    return (
        <>
            <p style={{ fontSize: 11, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20, marginTop: -4 }}>
                Manage POS systems, iframes, and API protocols.
            </p>
            <POSIntegration
                currentApiKey={restaurant.apiKey}
                posType={restaurant.posSystem || restaurant.posType || "None"}
                posClientId={restaurant.posClientId || ""}
                hasPosSecret={Boolean(restaurant.posClientSecret)}
            />
        </>
    );
}
