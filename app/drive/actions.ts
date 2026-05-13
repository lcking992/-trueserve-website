"use server";

import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logAuditAction } from "@/lib/audit";

export async function submitDriveApplication(prevState: any, formData: FormData) {
    const name        = (formData.get("name") as string || "").trim();
    const email       = (formData.get("email") as string || "").trim().toLowerCase();
    const phone       = (formData.get("phone") as string || "").trim();
    const city        = (formData.get("city") as string || "").trim();
    const vehicleType = (formData.get("vehicleType") as string || "CAR").trim();
    const utmSource   = (formData.get("utmSource") as string || "").trim();
    const utmMedium   = (formData.get("utmMedium") as string || "").trim();
    const utmCampaign = (formData.get("utmCampaign") as string || "").trim();
    const sourceLabel = utmSource ? ` · Source: ${utmSource}${utmCampaign ? ` / ${utmCampaign}` : ""}` : "";

    if (!name || !email || !phone || !city) {
        return { error: "Please fill in all required fields." };
    }

    try {
        // 1. Find or create placeholder User
        const { data: existing } = await supabaseAdmin
            .from("User")
            .select("id")
            .eq("email", email)
            .maybeSingle();

        let userId = existing?.id;

        if (!userId) {
            userId = uuidv4();
            const { error: userErr } = await supabaseAdmin.from("User").insert({
                id: userId,
                name,
                email,
                phone,
                role: "DRIVER",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            if (userErr) throw userErr;
        }

        // 2. Create Driver profile with NEW_APPLICATION status
        const { error: driverErr } = await supabaseAdmin.from("Driver").upsert({
            id: uuidv4(),
            userId,
            vehicleType,
            backgroundCheckStatus: "PENDING",
            complianceStatus: "NEW_APPLICATION",
            isAvailable: false,
            isOnline: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }, { onConflict: "userId", ignoreDuplicates: true });

        if (driverErr) throw driverErr;

        // 3. Audit log
        await logAuditAction({
            action: "DRIVER_MICRO_APPLICATION",
            targetId: userId,
            entityType: "Driver",
            message: `New driver micro-application from ${name} (${city}) — ${vehicleType}${sourceLabel}`,
        });

        // 4. Notify admin via GHL or Resend if configured
        try {
            const adminNotifyUrl = process.env.GHL_DRIVER_WORKFLOW_ID
                ? `https://rest.gohighlevel.com/v1/contacts/`
                : null;

            if (process.env.RESEND_API_KEY) {
                await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        from: process.env.RESEND_FROM_EMAIL || "noreply@trueservedelivery.com",
                        to: process.env.ADMIN_EMAIL || "admin@trueservedelivery.com",
                        subject: `🚗 New Driver Application — ${name} (${city})${utmSource ? ` via ${utmSource}` : ""}`,
                        html: `
                            <h2>New Driver Application</h2>
                            <p><strong>Name:</strong> ${name}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Phone:</strong> ${phone}</p>
                            <p><strong>City:</strong> ${city}</p>
                            <p><strong>Vehicle:</strong> ${vehicleType}</p>
                            ${utmSource ? `<p><strong>Source:</strong> ${utmSource}${utmCampaign ? ` / ${utmCampaign}` : ""}${utmMedium ? ` (${utmMedium})` : ""}</p>` : ""}
                            <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://trueservedelivery.com"}/admin/users">Review in Admin Portal →</a></p>
                        `,
                    }),
                });
            }
        } catch (notifyErr) {
            // Non-fatal — don't block the applicant
            console.warn("[Drive Apply] Admin notification failed:", notifyErr);
        }

        return { success: true };
    } catch (e: any) {
        console.error("[Drive Apply Error]", e);
        return { error: "Something went wrong. Please try again." };
    }
}
