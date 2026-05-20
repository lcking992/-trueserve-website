import { supabaseAdmin } from "@/lib/supabase-admin";

export const ANNIVERSARY_REWARD_POINTS = 250;

export type AnniversaryRewardStatus = {
    eligible: boolean;
    granted: boolean;
    alreadyClaimed: boolean;
    points: number;
    anniversaryYear?: number;
    anniversaryDate?: string;
    nextAnniversary?: string;
    reason?: "missing_account" | "not_due" | "claimed" | "granted" | "error";
};

const ANNIVERSARY_REWARD_TYPE = "ANNIVERSARY_BONUS";

function anniversaryDateForYear(createdAt: Date, year: number) {
    return new Date(Date.UTC(year, createdAt.getUTCMonth(), createdAt.getUTCDate(), 0, 0, 0));
}

function addYears(date: Date, years: number) {
    const next = new Date(date);
    next.setUTCFullYear(next.getUTCFullYear() + years);
    return next;
}

function getCurrentAnniversary(createdAt: Date, now: Date) {
    let anniversaryYear = now.getUTCFullYear();
    let anniversaryDate = anniversaryDateForYear(createdAt, anniversaryYear);

    if (now < anniversaryDate) {
        anniversaryYear -= 1;
        anniversaryDate = anniversaryDateForYear(createdAt, anniversaryYear);
    }

    return { anniversaryYear, anniversaryDate };
}

export async function grantAnniversaryRewardIfEligible(
    userId: string,
    now = new Date()
): Promise<AnniversaryRewardStatus> {
    const points = ANNIVERSARY_REWARD_POINTS;

    const { data: user, error: userError } = await supabaseAdmin
        .from("User")
        .select("id, createdAt")
        .eq("id", userId)
        .maybeSingle();

    if (userError || !user?.createdAt) {
        return {
            eligible: false,
            granted: false,
            alreadyClaimed: false,
            points,
            reason: "missing_account"
        };
    }

    const createdAt = new Date(user.createdAt);
    const firstAnniversary = addYears(createdAt, 1);

    if (now < firstAnniversary) {
        return {
            eligible: false,
            granted: false,
            alreadyClaimed: false,
            points,
            nextAnniversary: firstAnniversary.toISOString(),
            reason: "not_due"
        };
    }

    const { anniversaryYear, anniversaryDate } = getCurrentAnniversary(createdAt, now);
    const description = `TrueServe anniversary reward ${anniversaryYear}`;
    const nextAnniversary = anniversaryDateForYear(createdAt, anniversaryYear + 1).toISOString();

    const { data: existingReward } = await supabaseAdmin
        .from("PointsTransaction")
        .select("id")
        .eq("userId", userId)
        .eq("type", ANNIVERSARY_REWARD_TYPE)
        .eq("description", description)
        .maybeSingle();

    if (existingReward) {
        return {
            eligible: true,
            granted: false,
            alreadyClaimed: true,
            points,
            anniversaryYear,
            anniversaryDate: anniversaryDate.toISOString(),
            nextAnniversary,
            reason: "claimed"
        };
    }

    const { error: insertError } = await supabaseAdmin
        .from("PointsTransaction")
        .insert({
            userId,
            amount: points,
            type: ANNIVERSARY_REWARD_TYPE,
            description
        });

    if (insertError) {
        const isDuplicate = insertError.code === "23505";
        return {
            eligible: true,
            granted: false,
            alreadyClaimed: isDuplicate,
            points,
            anniversaryYear,
            anniversaryDate: anniversaryDate.toISOString(),
            nextAnniversary,
            reason: isDuplicate ? "claimed" : "error"
        };
    }

    return {
        eligible: true,
        granted: true,
        alreadyClaimed: false,
        points,
        anniversaryYear,
        anniversaryDate: anniversaryDate.toISOString(),
        nextAnniversary,
        reason: "granted"
    };
}
