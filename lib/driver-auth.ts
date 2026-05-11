import { getAuthSession } from "@/app/auth/actions";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";

export async function getDriverOrRedirect() {
    const { isAuth, userId } = await getAuthSession();
    if (!isAuth || !userId) {
        redirect("/driver/login");
    }

    const { data: driver } = await supabaseAdmin
        .from('Driver')
        .select(`
            *,
            user:User(*),
            orders:Order(*)
        `)
        .eq('userId', userId)
        .maybeSingle();

    if (!driver) {
        redirect("/driver");
    }

    const backgroundStatus = String(driver.backgroundCheckStatus || "").toUpperCase();
    const isApprovedDriver =
        driver.vehicleVerified === true &&
        (backgroundStatus === "CLEAR" || backgroundStatus === "CLEARED");

    if (!isApprovedDriver) {
        redirect("/driver/pending-review");
    }

    return driver;
}
