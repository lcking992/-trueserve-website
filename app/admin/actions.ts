"use server";


import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { sendEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";
import { getAuthSession } from "@/app/auth/actions";
import { logAuditAction } from "@/lib/audit";
import { normalizePhoneNumber } from "@/lib/phoneUtils";
import { hasAnyPermission, type Permission } from "@/lib/rbac";
import type { ConfigEnvironment, ConfigKey } from "@/lib/system";

// Removed local logAuditAction, using shared version from @/lib/audit

async function requireAdminPermissions(requiredPermissions: Permission | Permission[]) {
    const { isAuth, role, userId, name } = await getAuthSession();
    const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

    if (!isAuth || !hasAnyPermission(role, permissions)) {
        throw new Error("Unauthorized");
    }

    return { role, userId, name };
}

export async function approveMenuItem(id: string) {
    try {
        await requireAdminPermissions('manage_menu');
        const { error } = await supabase
            .from('MenuItem')
            .update({ status: "APPROVED" })
            .eq('id', id);

        if (error) {
            throw error;
        }

        await logAuditAction({ action: "APPROVE_MENU_ITEM", targetId: id, entityType: "MenuItem", before: { status: "PENDING" }, after: { status: "APPROVED" } });

        revalidatePath("/admin/dashboard");
        revalidatePath("/merchant/dashboard");
        return { success: true };
    } catch (e) {
        console.error("Failed to approve item:", e);
        return { success: false, error: "Failed to approve item." };
    }
}

export async function rejectMenuItem(id: string) {
    try {
        await requireAdminPermissions('manage_menu');
        const { error } = await supabase
            .from('MenuItem')
            .update({ status: "REJECTED" })
            .eq('id', id);

        if (error) {
            throw error;
        }

        await logAuditAction({ action: "REJECT_MENU_ITEM", targetId: id, entityType: "MenuItem", before: { status: "PENDING" }, after: { status: "REJECTED" } });

        revalidatePath("/admin/dashboard");
        revalidatePath("/merchant/dashboard");
        return { success: true };
    } catch (e) {
        console.error("Failed to reject item:", e);
        return { success: false, error: "Failed to reject item." };
    }
}

export async function flagMenuItem(id: string) {
    try {
        await requireAdminPermissions('manage_menu');
        const { error } = await supabase
            .from('MenuItem')
            .update({ status: "FLAGGED" })
            .eq('id', id);

        if (error) {
            throw error;
        }

        await logAuditAction({ action: "FLAG_MENU_ITEM", targetId: id, entityType: "MenuItem", before: { status: "PENDING" }, after: { status: "FLAGGED" } });

        revalidatePath("/admin/dashboard");
        revalidatePath("/merchant/dashboard");
        return { success: true };
    } catch (e) {
        console.error("Failed to flag item:", e);
        return { success: false, error: "Failed to flag item." };
    }
}

export async function approveDriver(id: string) {
    try {
        await requireAdminPermissions('approve_drivers');
        const approvedAt = new Date().toISOString();
        // 1. Get Driver Info
        const { data: driver, error: fetchError } = await supabaseAdmin
            .from('Driver')
            .select('*, user:User(*)')
            .eq('id', id)
            .single();

        if (fetchError || !driver) throw new Error("Driver not found");

        const email = driver.user.email;
        const name = driver.user.name;
        const phone = driver.user.phone;
        const normalizedPhone = normalizePhoneNumber(phone || "");

        if (!normalizedPhone) {
            throw new Error("Driver phone number is missing. Add a valid phone before approval.");
        }
        const tempPassword = `TrueServe!${Math.random().toString(36).slice(-8)}`;

        // 2. Create Auth User if not exists
        const { error: authError } = await supabaseAdmin.auth.admin.createUser({
            id: driver.userId,
            email,
            phone: normalizedPhone,
            password: tempPassword,
            email_confirm: true,
            phone_confirm: true,
            user_metadata: {
                displayName: name,
                role: 'DRIVER'
            }
        });

        if (authError && !authError.message.includes("already exists")) {
            console.error("Auth Creation Error:", authError);
            throw authError;
        }

        if (authError?.message.includes("already exists")) {
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(driver.userId, {
                email,
                phone: normalizedPhone,
                email_confirm: true,
                phone_confirm: true,
                user_metadata: { role: 'DRIVER', displayName: name }
            });
            if (updateError) {
                console.error("Failed to sync role for existing driver:", updateError);
                throw new Error("A login already exists for this email or phone, but it is not linked to this driver application. Use a different email/phone or have an admin merge the accounts before approval.");
            }
        }

        const { error: userUpdateError } = await supabaseAdmin
            .from('User')
            .update({ phone: normalizedPhone, role: 'DRIVER', updatedAt: approvedAt })
            .eq('id', driver.userId);

        if (userUpdateError) throw userUpdateError;

        const { error: statusError } = await supabaseAdmin
            .from('Driver')
            .update({
                status: "OFFLINE",
                vehicleVerified: true,
                backgroundCheckStatus: "CLEARED",
                complianceStatus: "ACTIVE",
                complianceScore: 100,
                lastComplianceAttestationAt: approvedAt,
                updatedAt: approvedAt
            })
            .eq('id', id);

        if (statusError) throw statusError;

        await logAuditAction({
            action: "APPROVE_DRIVER",
            targetId: id,
            entityType: "Driver",
            before: { status: driver.status || "PENDING" },
            after: { status: "OFFLINE", backgroundCheckStatus: "CLEARED", complianceStatus: "ACTIVE" }
        });

        const notificationResults = await Promise.allSettled([
            sendEmail(
                email,
                "Your TrueServe Driver Application - APPROVED",
                `<h1>Welcome to the Fleet! 🚗</h1>
            <p>Hi <span class="accent">${name.split(' ')[0]}</span>,</p>
            <p>Great news! Your driver application for TrueServe has been <strong>approved</strong>.</p>
            <p>You can now log in using your phone number to receive a secure SMS code and start accepting orders immediately.</p>
            <a href="https://www.trueserve.delivery/driver/login" class="button">Log In & Start Driving</a>
            <p style="margin-top: 30px;">Welcome to the team!<br>The TrueServe Team</p>`
            ),
            sendSMS(
                normalizedPhone,
                `TrueServe: Your driver application is approved! You can now log in using this phone number at https://trueserve.delivery/driver/login`
            )
        ]);

        notificationResults.forEach((result, index) => {
            if (result.status === "rejected") {
                console.error(index === 0 ? "Driver approval email failed:" : "Driver approval SMS failed:", result.reason);
            }
        });

        revalidatePath("/admin/users");
        revalidatePath("/admin/dashboard");
        revalidatePath("/driver/dashboard");
        revalidatePath("/driver/dashboard/compliance");
        return { success: true };
    } catch (e: any) {
        console.error("Failed to approve driver:", e);
        return { success: false, error: e.message || "Failed to approve driver." };
    }
}

export async function rejectDriver(id: string) {
    try {
        await requireAdminPermissions('approve_drivers');
        const { data: driver, error: fetchError } = await supabaseAdmin
            .from('Driver')
            .select('user:User(email, name)')
            .eq('id', id)
            .single();

        if (fetchError || !driver) throw new Error("Driver not found");

        const { error: statusError } = await supabaseAdmin
            .from('Driver')
            .update({ status: "REJECTED", vehicleVerified: false, updatedAt: new Date().toISOString() })
            .eq('id', id);

        if (statusError) throw statusError;

        await logAuditAction({ action: "REJECT_DRIVER", targetId: id, entityType: "Driver", before: { status: "PENDING" }, after: { status: "REJECTED" } });

        const emailResult = await Promise.allSettled([
            sendEmail(
                (driver.user as any).email,
                "Driver Application Update - TrueServe",
                `<h1>Application Update 📝</h1>
            <p>Hi <span class="accent">${(driver.user as any).name.split(' ')[0]}</span>,</p>
            <p>Thank you for your interest in driving with TrueServe. We have carefully reviewed your application and documents.</p>
            <p>At this time, we are unable to move forward with your onboarding. We appreciate the time you took to apply.</p>
            <p style="margin-top: 30px;">Best,<br>The TrueServe Team</p>`
            )
        ]);

        if (emailResult[0]?.status === "rejected") {
            console.error("Driver rejection email failed:", emailResult[0].reason);
        }

        revalidatePath("/admin/users");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (e: any) {
        console.error("Failed to reject driver:", e);
        return { success: false, error: e.message || "Failed to reject driver." };
    }
}

export async function approveMerchant(restaurantId: string) {
    try {
        await requireAdminPermissions('approve_restaurants');
        const approvedAt = new Date().toISOString();
        const { data: restaurant, error: fetchError } = await supabaseAdmin
            .from('Restaurant')
            .select('id, name, ownerId, phone, owner:User(email, name, phone)')
            .eq('id', restaurantId)
            .single();

        if (fetchError || !restaurant) throw new Error("Merchant application not found");

        const owner = restaurant.owner as any;
        const normalizedPhone = normalizePhoneNumber(owner?.phone || restaurant.phone || "");

        if (restaurant.ownerId) {
            const { error: ownerUpdateError } = await supabaseAdmin
                .from('User')
                .update({
                    role: 'MERCHANT',
                    ...(normalizedPhone ? { phone: normalizedPhone } : {}),
                    updatedAt: approvedAt
                })
                .eq('id', restaurant.ownerId);

            if (ownerUpdateError) throw ownerUpdateError;

            const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(restaurant.ownerId, {
                ...(owner?.email ? { email: owner.email, email_confirm: true } : {}),
                ...(normalizedPhone ? { phone: normalizedPhone, phone_confirm: true } : {}),
                user_metadata: { role: 'MERCHANT', displayName: owner?.name || restaurant.name }
            });

            if (authUpdateError) {
                console.error("Failed to sync merchant auth role:", authUpdateError);
                throw new Error("The merchant profile was found, but its login account could not be activated. Check whether this email already belongs to another account.");
            }
        }

        const { error } = await supabaseAdmin
            .from('Restaurant')
            .update({
                visibility: 'VISIBLE',
                updatedAt: approvedAt
            })
            .eq('id', restaurantId);

        if (error) throw error;

        await logAuditAction({
            action: "APPROVE_MERCHANT",
            targetId: restaurantId,
            entityType: "Restaurant",
            before: { visibility: "HIDDEN" },
            after: { visibility: "VISIBLE" }
        });

        const notificationPromises: Promise<any>[] = [];

        if (owner?.email) {
            notificationPromises.push(sendEmail(
                owner.email,
                "Your TrueServe Merchant Account Is Approved",
                `<h1>You're Approved 🎉</h1>
                <p>Hi ${owner.name || "Partner"},</p>
                <p>Your restaurant <strong>${restaurant.name}</strong> is now approved on TrueServe.</p>
                <p>You can now log in to your merchant portal and complete setup.</p>
                <a href="https://trueserve.delivery/merchant/login" class="button">Log In to Merchant Portal</a>
                <p style="margin-top: 30px;">Best,<br>The TrueServe Team</p>`
            ));
        }

        if (normalizedPhone) {
            notificationPromises.push(sendSMS(
                normalizedPhone,
                `TrueServe: ${restaurant.name} has been approved. Log in at trueserve.delivery/merchant/login to complete onboarding.`
            ));
        }

        const notificationResults = await Promise.allSettled(notificationPromises);
        notificationResults.forEach((result, index) => {
            if (result.status === "rejected") {
                console.error(index === 0 ? "Merchant approval email failed:" : "Merchant approval SMS failed:", result.reason);
            }
        });

        revalidatePath("/admin/users");
        revalidatePath("/admin/dashboard");
        revalidatePath("/merchant/dashboard");
        revalidatePath("/merchant/dashboard/storefront");
        revalidatePath("/merchant/dashboard/integrations");
        revalidatePath("/restaurants");
        revalidatePath(`/restaurants/${restaurantId}`);
        return { success: true };
    } catch (e: any) {
        console.error("Failed to approve merchant:", e);
        return { success: false, error: e.message || "Failed to approve merchant." };
    }
}

export async function rejectMerchant(restaurantId: string) {
    try {
        await requireAdminPermissions('approve_restaurants');
        const { data: restaurant, error: fetchError } = await supabaseAdmin
            .from('Restaurant')
            .select('id, name, owner:User(email, name)')
            .eq('id', restaurantId)
            .single();

        if (fetchError || !restaurant) throw new Error("Merchant application not found");

        const { error } = await supabaseAdmin
            .from('Restaurant')
            .update({
                visibility: 'HIDDEN',
                updatedAt: new Date().toISOString()
            })
            .eq('id', restaurantId);

        if (error) throw error;

        await logAuditAction({
            action: "REJECT_MERCHANT",
            targetId: restaurantId,
            entityType: "Restaurant",
            before: { visibility: "HIDDEN" },
            after: { visibility: "HIDDEN" }
        });

        const owner = restaurant.owner as any;
        if (owner?.email) {
            const emailResult = await Promise.allSettled([sendEmail(
                owner.email,
                "Update on Your TrueServe Merchant Application",
                `<h1>Application Update</h1>
                <p>Hi ${owner.name || "Partner"},</p>
                <p>Thank you for applying to TrueServe for <strong>${restaurant.name}</strong>.</p>
                <p>At this time we cannot approve the application. You can reply to this message if you’d like a follow-up review.</p>
                <p style="margin-top: 30px;">Best,<br>The TrueServe Team</p>`
            )]);

            if (emailResult[0]?.status === "rejected") {
                console.error("Merchant rejection email failed:", emailResult[0].reason);
            }
        }

        revalidatePath("/admin/users");
        revalidatePath("/admin/dashboard");
        revalidatePath("/restaurants");
        return { success: true };
    } catch (e: any) {
        console.error("Failed to reject merchant:", e);
        return { success: false, error: e.message || "Failed to reject merchant." };
    }
}


export async function connectStripe(_formData?: FormData): Promise<void> {
    try {
        const { userId } = await requireAdminPermissions('manage_payouts');
        await logAuditAction({ action: "CONNECT_STRIPE_PORTAL", targetId: userId || "admin", entityType: "Admin" });
    } catch {
        return;
    }

    // Open the Stripe Dashboard home so staff land on the TrueServe account overview.
    redirect("https://dashboard.stripe.com/");
}

export async function generateMerchantStripeLink(restaurantId: string) {
    try {
        await requireAdminPermissions('approve_restaurants');

        const { data: restaurant } = await supabaseAdmin
            .from('Restaurant')
            .select('*, owner:User(*)')
            .eq('id', restaurantId)
            .single();

        if (!restaurant) throw new Error("Restaurant not found");

        const stripeLink = `https://connect.stripe.com/setup/s/${restaurant.id}`; // Placeholder for dynamic Connect link

        await sendEmail(
            restaurant.owner.email,
            "🚀 Action Required: Set Up Your TrueServe Payouts",
            `<h1>Ready for Launch? 🍱</h1>
            <p>Hi ${restaurant.owner.name.split(' ')[0]},</p>
            <p>Your restaurant <strong>${restaurant.name}</strong> is almost ready to go live on TrueServe.</p>
            <p>To start receiving payouts for your orders, please click the secure link below to link your bank account via Stripe Connect.</p>
            <a href="${stripeLink}" class="button">Link Bank Account</a>
            <p style="margin-top: 30px;">See you on the platform!<br>The TrueServe Team</p>`
        );

        await logAuditAction({ action: "GENERATE_STRIPE_LINK", targetId: restaurantId, entityType: "Restaurant" });

        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function logout() {
    const { logout: unifiedLogout } = await import("@/app/auth/actions");
    await unifiedLogout();
}

export async function toggleOrderingStatus(enabled: boolean) {
    try {
        await requireAdminPermissions('manage_feature_flags');
        const { updateSystemConfig } = await import('@/lib/system');
        await updateSystemConfig('ORDERING_SYSTEM_ENABLED', enabled);

        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/settings");
        revalidatePath("/admin/feature-switches");
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function toggleAiScanner(enabled: boolean) {
    try {
        await requireAdminPermissions('manage_feature_flags');
        const { updateSystemConfig } = await import('@/lib/system');
        await updateSystemConfig('AI_MENU_SCANNER_ENABLED', enabled);
        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/feature-switches");
        return { success: true };
    } catch (e: any) { return { error: e.message }; }
}

export async function toggleGoogleRatings(enabled: boolean) {
    try {
        await requireAdminPermissions('manage_feature_flags');
        const { updateSystemConfig } = await import('@/lib/system');
        await updateSystemConfig('GOOGLE_RATINGS_SYNC_ENABLED', enabled);
        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/feature-switches");
        return { success: true };
    } catch (e: any) { return { error: e.message }; }
}

export async function toggleInstantPayouts(enabled: boolean) {
    try {
        await requireAdminPermissions('manage_feature_flags');
        const { updateSystemConfig } = await import('@/lib/system');
        await updateSystemConfig('INSTANT_PAYOUTS_ENABLED', enabled);
        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/feature-switches");
        return { success: true };
    } catch (e: any) { return { error: e.message }; }
}

export async function toggleExpressCheckout(enabled: boolean) {
    try {
        await requireAdminPermissions('manage_feature_flags');
        const { updateSystemConfig } = await import('@/lib/system');
        await updateSystemConfig('EXPRESS_CHECKOUT_ACTIVE', enabled);
        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/feature-switches");
        return { success: true };
    } catch (e: any) { return { error: e.message }; }
}

export async function updateConfigParam(key: any, value: any) {
    try {
        await requireAdminPermissions('manage_system_settings');
        const { updateSystemConfig } = await import('@/lib/system');
        await updateSystemConfig(key, value);

        revalidatePath("/admin/settings");
        revalidatePath("/admin/feature-switches");
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

const ALLOWED_FEATURE_SWITCHES: ConfigKey[] = [
    "ORDERING_SYSTEM_ENABLED",
    "AI_MENU_SCANNER_ENABLED",
    "GOOGLE_RATINGS_SYNC_ENABLED",
    "EXPRESS_CHECKOUT_ACTIVE",
    "INSTANT_PAYOUTS_ENABLED",
    "MARKETPLACE_EMERGENCY_LOCK",
];

export async function updateEnvironmentFeatureSwitch(
    key: ConfigKey,
    enabled: boolean,
    environment: ConfigEnvironment | "global"
) {
    try {
        await requireAdminPermissions('manage_feature_flags');

        if (!ALLOWED_FEATURE_SWITCHES.includes(key)) {
            throw new Error("Unsupported feature switch");
        }

        const { updateSystemConfig } = await import("@/lib/system");
        const envScope = environment === "global" ? undefined : environment;
        await updateSystemConfig(key, enabled, undefined, envScope);

        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/settings");
        revalidatePath("/admin/feature-switches");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || "Failed to update feature switch." };
    }
}

export async function refreshBackgroundCheck(driverId: string) {
    try {
        await requireAdminPermissions('approve_drivers');
        const isClean = Math.random() > 0.2;
        const status = isClean ? "CLEARED" : "FLAGGED";

        const { data: driver } = await supabaseAdmin
            .from('Driver')
            .select('user:User(email, name)')
            .eq('id', driverId)
            .single();

        const { error } = await supabaseAdmin
            .from('Driver')
            .update({
                backgroundCheckStatus: status,
                backgroundCheckClearedAt: isClean ? new Date().toISOString() : null,
                updatedAt: new Date().toISOString()
            })
            .eq('id', driverId);

        if (error) throw error;

        await logAuditAction({ action: "REFRESH_BACKGROUND_CHECK", targetId: driverId, entityType: "Driver", after: { status } });

        if (status === 'FLAGGED' && driver?.user) {
            await sendEmail(
                (driver.user as any).email,
                "Action Required: Driver Background Check",
                `<h1>Action Required 🛡️</h1>
                <p>Hi <span class="accent">${(driver.user as any).name}</span>,</p>
                <p>During our routine background screening, some items were flagged on your report that require additional attention.</p>
                <p>Please contact our trust & safety team at <a href="mailto:safety@trueserve.delivery" style="color: #10B981;">safety@trueserve.delivery</a> if you would like to provide additional context or dispute these findings.</p>
                <p style="margin-top: 30px;">Best,<br>The TrueServe Team</p>`
            );
        }

        revalidatePath("/admin/dashboard");
        return { success: true, status };
    } catch (e) {
        console.error("Failed to refresh background check:", e);
        return { success: false, error: "Failed to refresh background check." };
    }
}

export async function forceCompleteOrder(orderId: string) {
    try {
        await requireAdminPermissions('intervene_orders');
        const { error } = await supabaseAdmin
            .from('Order')
            .update({
                status: 'DELIVERED',
                deliveredAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) throw error;

        await logAuditAction({ action: "FORCE_COMPLETE_ORDER", targetId: orderId, entityType: "Order", before: { status: "ACTIVE" }, after: { status: "DELIVERED" } });

        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function adminCancelOrder(orderId: string) {
    try {
        await requireAdminPermissions('intervene_orders');
        const { error } = await supabaseAdmin
            .from('Order')
            .update({
                status: 'CANCELLED',
                updatedAt: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) throw error;

        await logAuditAction({ action: "ADMIN_CANCEL_ORDER", targetId: orderId, entityType: "Order", before: { status: "ACTIVE" }, after: { status: "CANCELLED" } });

        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}


export async function requestChange(data: { entityType: string; entityId: string; changeData: any; previousData: any; rollbackPlan?: string }) {
    try {
        const { role, userId, name } = await requireAdminPermissions('intervene_orders');

        const { error } = await supabaseAdmin
            .from('ChangeRequest')
            .insert({
                ...data,
                requestedBy: { name, role, userId },
                status: 'PENDING',
                createdAt: new Date().toISOString()
            });

        if (error) throw error;

        await logAuditAction({ action: "REQUEST_CHANGE", targetId: data.entityId, entityType: data.entityType, after: { status: "PENDING" } });

        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/settings");
        return { success: true };
    } catch (e: any) {
        console.error("Failed to request change:", e);
        return { success: false, error: e.message };
    }
}

export async function approveRequest(requestId: string) {
    try {
        const { userId } = await requireAdminPermissions('manage_system_settings');

        const { data: request, error: fetchError } = await supabaseAdmin
            .from('ChangeRequest')
            .select('*')
            .eq('id', requestId)
            .single();

        if (fetchError || !request) throw new Error("Request not found");

        const tableName = request.entityType;
        const pkColumn = tableName === 'SystemConfig' ? 'key' : 'id';

        // 1. Apply the Actual Change to the Target Table
        const { error: applyError } = await supabaseAdmin
            .from(tableName)
            .update(request.changeData)
            .eq(pkColumn, request.entityId);

        if (applyError) throw applyError;

        // 2. Mark Request as Approved
        const { error: updateError } = await supabaseAdmin
            .from('ChangeRequest')
            .update({ status: 'APPROVED', approvedBy: userId, updatedAt: new Date().toISOString() })
            .eq('id', requestId);

        if (updateError) throw updateError;

        await logAuditAction({ action: "APPROVE_CHANGE", targetId: request.entityId, entityType: request.entityType, after: { status: "APPROVED" } });

        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/settings");
        return { success: true };
    } catch (e: any) {
        console.error("Failed to approve change:", e);
        return { success: false, error: e.message };
    }
}

export async function rejectRequest(requestId: string) {
    try {
        const { userId } = await requireAdminPermissions('manage_system_settings');

        const { error } = await supabaseAdmin
            .from('ChangeRequest')
            .update({ status: 'REJECTED', approvedBy: userId, updatedAt: new Date().toISOString() })
            .eq('id', requestId);

        if (error) throw error;

        await logAuditAction({ action: "REJECT_CHANGE", targetId: requestId, entityType: "ChangeRequest", after: { status: "REJECTED" } });

        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/settings");
        return { success: true };
    } catch (e: any) {
        console.error("Failed to reject change:", e);
        return { success: false, error: e.message };
    }
}

export async function updateInAppContent(key: string, title: string, content: string) {
    try {
        await requireAdminPermissions('manage_content');

        // 1. Get current version
        const { data: current } = await supabaseAdmin
            .from('InAppContent')
            .select('version')
            .eq('key', key)
            .maybeSingle();

        const newVersion = (current?.version || 0) + 1;

        // 2. Insert or update the content
        const { error } = await supabaseAdmin
            .from('InAppContent')
            .upsert({
                key,
                title,
                content,
                version: newVersion,
                updatedAt: new Date().toISOString()
            });

        if (error) throw error;

        await logAuditAction({ 
            action: "UPDATE_IN_APP_CONTENT", 
            targetId: key, 
            entityType: "InAppContent", 
            before: { version: current?.version || 0 }, 
            after: { version: newVersion } 
        });

        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/content");
        revalidatePath("/legal");
        return { success: true };
    } catch (e: any) {
        console.error("Failed to update policy:", e);
        return { success: false, error: e.message };
    }
}
