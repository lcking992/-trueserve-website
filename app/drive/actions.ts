"use server";

import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logAuditAction } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import { getAppBaseUrl } from "@/lib/app-url";
import { normalizePhoneNumber } from "@/lib/phoneUtils";
import { sendSMS } from "@/lib/sms";
import { sendEmail } from "@/lib/email";
import { getAdminNotificationEmails } from "@/lib/admin-config";

const SOURCE_LABELS: Record<string, string> = {
    ridersunite: "Riders Unite",
    ridester: "Ridester",
};

function sourceLabel(source: string) {
    return SOURCE_LABELS[source.toLowerCase()] || source || "Direct";
}

export async function submitDriveApplication(prevState: any, formData: FormData) {
    const name        = (formData.get("name") as string || "").trim();
    const email       = (formData.get("email") as string || "").trim().toLowerCase();
    const phone       = normalizePhoneNumber((formData.get("phone") as string || "").trim());
    const city        = (formData.get("city") as string || "").trim();
    const vehicleType = (formData.get("vehicleType") as string || "CAR").trim();
    const smsConsent  = formData.get("smsConsent") === "true";
    const utmSource   = ((formData.get("utmSource") as string || "direct").trim().toLowerCase()) || "direct";
    const utmCampaign = ((formData.get("utmCampaign") as string || "").trim().toLowerCase()) || null;
    const referralSource = sourceLabel(utmSource);

    if (!name || !email || !phone || !city) {
        return { error: "Please fill in all required fields." };
    }

    try {
        // 1. Find or create placeholder User
        const { data: existing } = await supabaseAdmin
            .from("User")
            .select("id, phone")
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
        } else if (!existing?.phone) {
            await supabaseAdmin
                .from("User")
                .update({ phone, name, updatedAt: new Date().toISOString() })
                .eq("id", userId);
        }

        // 2. Create Driver profile with NEW_APPLICATION status
        const { data: existingDriver } = await supabaseAdmin
            .from("Driver")
            .select("id, aiMetadata")
            .eq("userId", userId)
            .maybeSingle();

        const driverId = existingDriver?.id || uuidv4();
        const aiMetadata = {
            ...(existingDriver?.aiMetadata || {}),
            leadSource: utmSource,
            leadSourceLabel: referralSource,
            utmCampaign,
            microApplication: {
                city,
                vehicleType,
                smsConsent,
                submittedAt: new Date().toISOString(),
                signupUrl: `${getAppBaseUrl()}/drive?utm_source=${encodeURIComponent(utmSource)}`,
            },
        };

        const { error: driverErr } = await supabaseAdmin.from("Driver").upsert({
            id: driverId,
            userId,
            vehicleType,
            status: "OFFLINE",
            backgroundCheckStatus: "PENDING",
            complianceStatus: "NEW_APPLICATION",
            aiMetadata,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }, { onConflict: "userId" });

        if (driverErr) throw driverErr;

        // 3. Audit log
        await logAuditAction({
            action: "DRIVER_MICRO_APPLICATION",
            targetId: driverId,
            entityType: "Driver",
            message: `New driver micro-application from ${name} (${city}) — ${vehicleType} via ${referralSource}`,
            after: {
                userId,
                name,
                email,
                phone,
                city,
                vehicleType,
                smsConsent,
                source: utmSource,
                sourceLabel: referralSource,
                utmCampaign,
            },
        });

        // 4. Text the applicant only after explicit SMS opt-in.
        const signupLink = `${getAppBaseUrl()}/driver/signup?utm_source=${encodeURIComponent(utmSource)}`;
        const smsResult = smsConsent
            ? await sendSMS(
                phone,
                `TrueServe: Thanks for applying to drive, ${name.split(" ")[0] || "there"}. Finish onboarding here: ${signupLink}. Reply STOP to opt out.`
            )
            : { success: false, error: "Applicant did not opt in to SMS." };

        await logAuditAction({
            action: smsResult.success
                ? "DRIVER_MICRO_APPLICATION_SMS_SENT"
                : smsConsent
                    ? "DRIVER_MICRO_APPLICATION_SMS_FAILED"
                    : "DRIVER_MICRO_APPLICATION_SMS_SKIPPED",
            targetId: driverId,
            entityType: "Driver",
            message: smsResult.success
                ? `Driver micro-application SMS sent to ${phone}.`
                : !smsConsent
                    ? `Driver micro-application SMS skipped for ${phone}: applicant did not opt in.`
                : `Driver micro-application SMS failed for ${phone}: ${smsResult.error}`,
            after: {
                phone,
                sid: smsResult.success ? smsResult.sid : null,
                error: smsResult.success ? null : smsResult.error,
                smsConsent,
                source: utmSource,
            },
        });

        await supabaseAdmin.from("Notification").insert({
            userId,
            title: "Driver Application Received",
            message: smsResult.success
                ? "We texted your onboarding link. Finish the full driver signup when you are ready."
                : smsConsent
                    ? "We received your application. Our team will follow up with your onboarding link."
                    : "We received your application. Watch your email for onboarding next steps.",
            type: "DRIVER_APPLICATION",
        });

        // 5. Notify admins via notification records and Resend if configured.
        try {
            const { data: staffRecords } = await supabaseAdmin
                .from("User")
                .select("id, email")
                .in("role", ["ADMIN", "OPS", "SUPPORT"]);

            await Promise.allSettled((staffRecords || [])
                .filter((staff: any) => staff.id)
                .map((staff: any) => createNotification({
                    userId: staff.id,
                    title: "New Driver Lead",
                    message: `${name} (${city}) applied from ${referralSource}. SMS ${smsResult.success ? "sent" : "failed"}.`,
                    type: "DRIVER_APPLICATION",
                })));

            const staffEmails = Array.from(new Set([
                ...getAdminNotificationEmails(),
                ...(staffRecords || []).map((staff: any) => String(staff.email || "").trim().toLowerCase()),
            ].filter(Boolean)));

            await Promise.allSettled(staffEmails.map((staffEmail) =>
                sendEmail(
                    staffEmail,
                    `New Driver Lead - ${name} (${city}) via ${referralSource}`,
                    `
                        <h2>New Driver Lead</h2>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Phone:</strong> ${phone}</p>
                        <p><strong>City:</strong> ${city}</p>
                        <p><strong>Vehicle:</strong> ${vehicleType}</p>
                        <p><strong>Source:</strong> ${referralSource} (${utmSource})</p>
                        <p><strong>Applicant SMS:</strong> ${smsResult.success ? `Sent (${smsResult.sid})` : `Not sent: ${smsResult.error}`}</p>
                        <p>This is the first-step driver lead. The driver must still finish the full document upload at /driver/signup before documents appear in Admin.</p>
                        <p><a href="${getAppBaseUrl()}/admin/users">Review in Admin Portal</a></p>
                    `
                )
            ));
        } catch (notifyErr) {
            // Non-fatal — don't block the applicant
            console.warn("[Drive Apply] Admin notification failed:", notifyErr);
        }

        try {
            revalidatePath("/admin/users");
            revalidatePath("/drive/success");
        } catch (revalidateErr) {
            console.warn("[Drive Apply] Revalidation skipped:", revalidateErr);
        }

        return { success: true };
    } catch (e: any) {
        console.error("[Drive Apply Error]", e);
        return { error: "Something went wrong. Please try again." };
    }
}
