import { getAuthSession } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import ComplianceClient from "./ComplianceClient";

export const dynamic = "force-dynamic";

export default async function CompliancePage() {
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    const cookieUserId = cookieStore.get("userId")?.value;
    const { userId } = await getAuthSession();
    const activeUserId = userId || cookieUserId;

    if (!activeUserId && !isPreview) {
        redirect("/login?role=merchant");
    }

    let restaurantId = "preview";
    let restaurantName = "Emerald Kitchen (Preview)";

    if (!isPreview && activeUserId) {
        const supabase = await createClient();
        const { data } = await supabase
            .from("Restaurant")
            .select("id, name")
            .eq("ownerId", activeUserId)
            .maybeSingle();

        if (!data) {
            redirect("/merchant-signup");
        }

        restaurantId = data.id;
        restaurantName = data.name;
    }

    return <ComplianceClient restaurantId={restaurantId} restaurantName={restaurantName} />;
}
