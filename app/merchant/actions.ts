
"use server";

import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sendEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { getStripe } from "@/lib/stripe";
import { sendSMS } from "@/lib/sms";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createNotification } from "@/lib/notifications";
import { logAuditAction } from "@/lib/audit";
import { pushMenuItemToGHL, syncSignupLeadToGHL } from "@/lib/ghl-sync";
import { getAppBaseUrl } from "@/lib/app-url";
import { normalizePhoneNumber } from "@/lib/phoneUtils";

export type MerchantActionState = {
    message: string;
    success?: boolean;
    error?: boolean;
};

export async function addMenuItem(prevState: MerchantActionState, formData: FormData): Promise<MerchantActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: true, message: "Unauthorized" };

    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const description = formData.get("description") as string;
    const category = String(formData.get("category") || "").trim();
    const isSpecial = formData.get("isSpecial") === "on";
    const originalPriceRaw = String(formData.get("originalPrice") || "").trim();
    const originalPrice = originalPriceRaw ? parseFloat(originalPriceRaw) : null;
    const specialHoursRaw = String(formData.get("specialHours") || "24").trim();
    const specialHours = Math.max(1, Math.min(168, parseInt(specialHoursRaw, 10) || 24));
    const image = formData.get("image") as File;

    if (!name || isNaN(price)) {
        return { error: true, message: "Invalid input" };
    }

    try {
        // Get Restaurant ID for this user
        const { data: restaurant } = await supabase
            .from('Restaurant')
            .select('id')
            .eq('ownerId', user.id)
            .single();

        if (!restaurant) throw new Error("Restaurant not found");

        let imageUrl = null;

        // Auto-create bucket just in case
        await supabaseAdmin.storage.createBucket('menu-images', { public: true }).catch(() => { });

        if (image && image.size > 0) {
            const fileExt = image.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExt}`;
            const arrayBuffer = await image.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);

            const { error: uploadError } = await supabaseAdmin.storage
                .from('menu-images')
                .upload(fileName, buffer, {
                    contentType: image.type,
                    upsert: false
                });

            if (uploadError) {
                console.error("Image upload failed:", uploadError);
                throw new Error("Failed to upload image.");
            }

            const { data: publicUrlData } = supabaseAdmin.storage
                .from('menu-images')
                .getPublicUrl(fileName);

            imageUrl = publicUrlData.publicUrl;
        }

        const saleUntil = isSpecial ? new Date(Date.now() + specialHours * 60 * 60 * 1000).toISOString() : null;

        const { error } = await supabase
            .from('MenuItem')
            .insert({
                id: uuidv4(),
                restaurantId: restaurant.id,
                name,
                price,
                description,
                category: category || null,
                imageUrl,
                originalPrice: isSpecial && originalPrice && originalPrice > price ? originalPrice : null,
                saleUntil,
                status: 'APPROVED',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

        if (error) throw error;

        // --- GoHighLevel Sync ---
        try {
            const { data: rest } = await supabase.from('Restaurant').select('ghlLocationId, ghlSyncEnabled').eq('id', restaurant.id).single();
            if (rest?.ghlSyncEnabled && rest?.ghlLocationId) {
                await pushMenuItemToGHL({ name, price, description, imageUrl }, rest.ghlLocationId);
            }
        } catch (ghlErr) { console.error("GHL Sync Error (Add):", ghlErr); }
        // -------------------------

        await logAuditAction({ action: "ADD_MENU_ITEM", targetId: restaurant.id, entityType: "Restaurant", message: `Added item: ${name}`, after: { name, price } });

        revalidatePath('/merchant/dashboard');
        revalidatePath('/merchant/dashboard/menu');
        revalidatePath('/restaurants');
        return { success: true, message: "Item added successfully" };
    } catch (e: any) {
        console.error("Add Item Error:", e);
        return { error: true, message: e.message || "Failed to add item" };
    }
}

export async function updateMenuItem(prevState: MerchantActionState, formData: FormData): Promise<MerchantActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: true, message: "Unauthorized" };

    const itemId = formData.get("itemId") as string;
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const description = formData.get("description") as string;
    const category = String(formData.get("category") || "").trim();
    const isSpecial = formData.get("isSpecial") === "on";
    const originalPriceRaw = String(formData.get("originalPrice") || "").trim();
    const originalPrice = originalPriceRaw ? parseFloat(originalPriceRaw) : null;
    const specialHoursRaw = String(formData.get("specialHours") || "24").trim();
    const specialHours = Math.max(1, Math.min(168, parseInt(specialHoursRaw, 10) || 24));
    const ingredientsRaw = formData.get("ingredients") as string;
    const ingredients = ingredientsRaw ? ingredientsRaw.split(',').map(i => i.trim().toLowerCase()).filter(i => i !== "") : [];
    const image = formData.get("image") as File;

    if (!itemId || !name || isNaN(price)) {
        return { error: true, message: "Invalid input" };
    }

    try {
        let imageUrl = formData.get("currentImageUrl") as string || null;

        if (image && image.size > 0) {
            const fileExt = image.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExt}`;
            const arrayBuffer = await image.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);

            const { error: uploadError } = await supabaseAdmin.storage
                .from('menu-images')
                .upload(fileName, buffer, { contentType: image.type, upsert: false });

            if (!uploadError) {
                const { data: publicUrlData } = supabaseAdmin.storage.from('menu-images').getPublicUrl(fileName);
                imageUrl = publicUrlData.publicUrl;
            }
        }

        const saleUntil = isSpecial ? new Date(Date.now() + specialHours * 60 * 60 * 1000).toISOString() : null;

        const { error } = await supabase
            .from('MenuItem')
            .update({
                name,
                price,
                description,
                category: category || null,
                imageUrl,
                ingredients,
                originalPrice: isSpecial && originalPrice && originalPrice > price ? originalPrice : null,
                saleUntil,
                updatedAt: new Date().toISOString()
            })
            .eq('id', itemId);


        if (error) throw error;

        // --- GoHighLevel Sync ---
        try {
            const { data: rest } = await supabase.from('Restaurant').select('ghlLocationId, ghlSyncEnabled').eq('ownerId', user.id).single();
            if (rest?.ghlSyncEnabled && rest?.ghlLocationId) {
                await pushMenuItemToGHL({ name, price, description, imageUrl }, rest.ghlLocationId);
            }
        } catch (ghlErr) { console.error("GHL Sync Error:", ghlErr); }
        // -------------------------

        await logAuditAction({ action: "UPDATE_MENU_ITEM", targetId: itemId, entityType: "MenuItem", after: { name, price } });

        revalidatePath('/merchant/dashboard');
        revalidatePath('/merchant/dashboard/menu');
        revalidatePath('/restaurants');
        return { success: true, message: "Item updated successfully" };
    } catch (e: any) {
        console.error("Update Item Error:", e);
        return { error: true, message: e.message || "Failed to update item" };
    }
}

export async function archiveMenuItem(itemId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { data: item, error: itemError } = await supabase
            .from('MenuItem')
            .select('id, name, restaurantId')
            .eq('id', itemId)
            .single();

        if (itemError || !item) throw itemError || new Error("Menu item not found");

        const { data: restaurant, error: restaurantError } = await supabase
            .from('Restaurant')
            .select('id, ownerId')
            .eq('id', item.restaurantId)
            .single();

        if (restaurantError || !restaurant || restaurant.ownerId !== user.id) {
            throw new Error("You do not have permission to remove this item.");
        }

        const { error } = await supabase
            .from('MenuItem')
            .update({
                status: 'ARCHIVED',
                isAvailable: false,
                saleUntil: null,
                updatedAt: new Date().toISOString()
            })
            .eq('id', itemId);

        if (error) throw error;

        await logAuditAction({
            action: "ARCHIVE_MENU_ITEM",
            targetId: itemId,
            entityType: "MenuItem",
            before: { status: "VISIBLE" },
            after: { status: "ARCHIVED", name: item.name }
        });

        revalidatePath('/merchant/dashboard');
        revalidatePath('/merchant/dashboard/menu');
        revalidatePath('/restaurants');
        return { success: true };
    } catch (e: any) {
        console.error("Archive Menu Item Error:", e);
        return { error: e.message || "Failed to remove item" };
    }
}


export async function updateStoreBanner(prevState: MerchantActionState, formData: FormData): Promise<MerchantActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: true, message: "Unauthorized" };

    const image = formData.get("image") as File;
    if (!image || image.size === 0) return { error: true, message: "No image provided" };

    try {
        const { data: restaurant } = await supabase
            .from('Restaurant')
            .select('id')
            .eq('ownerId', user.id)
            .single();

        if (!restaurant) throw new Error("Restaurant not found");

        await supabaseAdmin.storage.createBucket('restaurant-banners', { public: true }).catch(() => { });

        const fileExt = image.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const arrayBuffer = await image.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const { error: uploadError } = await supabaseAdmin.storage
            .from('restaurant-banners')
            .upload(fileName, buffer, { contentType: image.type, upsert: false });

        if (uploadError) throw new Error("Failed to upload image.");

        const { data: publicUrlData } = supabaseAdmin.storage
            .from('restaurant-banners')
            .getPublicUrl(fileName);

        const { error } = await supabase
            .from('Restaurant')
            .update({ imageUrl: publicUrlData.publicUrl, updatedAt: new Date().toISOString() })
            .eq('id', restaurant.id);

        if (error) throw error;

        revalidatePath('/merchant/dashboard');
        return { success: true, message: "Store banner updated successfully." };
    } catch (e: any) {
        console.error("Banner Upload Error:", e);
        return { error: true, message: "Failed to update banner." };
    }
}

export async function updateOrderStatus(orderId: string, nextStatus: string, reason?: string, comment?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { data: order } = await supabase
            .from('Order')
            .select('status')
            .eq('id', orderId)
            .single();

        if (!order) return { error: "Order not found" };

        const transitions: Record<string, string[]> = {
            'PENDING': ['PREPARING', 'CANCELLED'],
            'PREPARING': ['READY_FOR_PICKUP', 'CANCELLED'],
            'READY_FOR_PICKUP': ['PICKED_UP', 'CANCELLED'],
            'PICKED_UP': ['DELIVERED', 'CANCELLED'],
            'DELIVERED': [],
            'CANCELLED': []
        };

        if (!transitions[order.status]?.includes(nextStatus)) {
            return { error: `Invalid transition from ${order.status} to ${nextStatus}` };
        }

        const updateData: any = { status: nextStatus, updatedAt: new Date().toISOString() };
        if (nextStatus === 'CANCELLED') {
            updateData.cancelReason = reason || 'Merchant Cancelled';
            updateData.cancelComment = comment || 'No comment provided by merchant';
        }

        const { error } = await supabase
            .from('Order')
            .update(updateData)
            .eq('id', orderId);

        if (error) throw error;

        await logAuditAction({ 
            action: "UPDATE_ORDER_STATUS", 
            targetId: orderId, 
            entityType: "Order", 
            before: { status: (order as any).status }, 
            after: { status: nextStatus },
            message: nextStatus === 'CANCELLED' ? `Reason: ${reason}` : ""
        });

        // Notify Customer
        try {
            const { data: orderData } = await supabaseAdmin
                .from('Order')
                .select('userId, restaurant:Restaurant(name)')
                .eq('id', orderId)
                .single();

            if (orderData) {
                const restaurantName = (orderData.restaurant as any)?.name || "Restaurant";
                let title = "Order Update";
                let message = `Your order from ${restaurantName} is now ${nextStatus.toLowerCase().replace('_', ' ')}.`;

                if (nextStatus === 'PREPARING') {
                    title = "Kitchen is cooking! Kitchen";
                    message = `${restaurantName} has started preparing your order.`;
                } else if (nextStatus === 'READY_FOR_PICKUP') {
                    title = "Order Ready! Order";
                    message = `Your order is ready. A driver will pick it up shortly.`;
                } else if (nextStatus === 'CANCELLED') {
                    title = "Order Cancelled";
                    message = `We're sorry, your order from ${restaurantName} was cancelled.`;
                }

                await createNotification({
                    userId: orderData.userId,
                    orderId: orderId,
                    title,
                    message
                });
            }
        } catch (notifErr) {
            console.error("Notification Error:", notifErr);
        }

        // SMS Alert to Customer on key status changes
        try {
            const { data: customerOrder } = await supabaseAdmin
                .from('Order')
                .select('userId, id, restaurant:Restaurant(name)')
                .eq('id', orderId)
                .single();

            if (customerOrder?.userId) {
                const { data: customer } = await supabaseAdmin
                    .from('User')
                    .select('phone')
                    .eq('id', customerOrder.userId)
                    .single();

                const phone = customer?.phone;
                const restName = (customerOrder.restaurant as any)?.name || "your restaurant";
                const ref = orderId.slice(-6).toUpperCase();

                if (phone) {
                    let smsText = '';
                    if (nextStatus === 'PREPARING') {
                        smsText = `TrueServe: Kitchen ${restName} is now preparing your order #${ref}. We'll text you when it's ready!`;
                    } else if (nextStatus === 'READY_FOR_PICKUP') {
                        smsText = `TrueServe: Done Your order #${ref} from ${restName} is ready! A driver will pick it up shortly.`;
                    } else if (nextStatus === 'CANCELLED') {
                        smsText = `TrueServe: Your order #${ref} from ${restName} was cancelled. ${reason ? `Reason: ${reason}.` : ''} Contact support@trueserve.delivery for help.`;
                    }
                    if (smsText) await sendSMS(phone, smsText);
                }
            }
        } catch (smsErr) {
            console.error("Customer SMS Error:", smsErr);
        }

        // Trigger SMS Alert to Driver if ready
        if (nextStatus === 'READY_FOR_PICKUP') {
            try {
                const { data: fullOrder } = await supabaseAdmin
                    .from('Order')
                    .select('*, restaurant:Restaurant(name), driver:Driver(userId)')
                    .eq('id', orderId)
                    .single();

                if (fullOrder?.driver && !Array.isArray(fullOrder.driver)) {
                    const driverObj = fullOrder.driver as any;
                    if (driverObj.userId) {
                        const { data: authData } = await supabaseAdmin.auth.admin.getUserById(driverObj.userId);
                        const phone = authData?.user?.phone || authData?.user?.user_metadata?.phone;

                        if (phone) {
                            const message = `TrueServe: ${fullOrder.restaurant.name} order is READY! Please head to the counter for pickup.`;
                            await sendSMS(phone, message);
                        }
                    }
                }
            } catch (smsErr) {
                console.error("SMS Error:", smsErr);
            }
        }

        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function refundOrder(orderId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        // Fetch order details for Stripe refund + customer notification
        const { data: order, error: fetchError } = await supabaseAdmin
            .from('Order')
            .select('id, total, stripePaymentIntentId, posReference, restaurant:Restaurant(name), user:User(phone, email, name)')
            .eq('id', orderId)
            .single();

        if (fetchError || !order) throw new Error("Order not found");

        // Issue Stripe refund if a payment intent exists
        let stripeRefundId: string | null = null;
        if (order.stripePaymentIntentId) {
            try {
                const stripe = getStripe();
                const refund = await stripe.refunds.create({
                    payment_intent: order.stripePaymentIntentId,
                    reason: "requested_by_customer",
                });
                stripeRefundId = refund.id;
            } catch (stripeErr: any) {
                // Log but don't block — already charged orders may need manual handling
                console.error("Stripe refund failed:", stripeErr.message);
                await logAuditAction({
                    action: "REFUND_STRIPE_FAILED",
                    targetId: orderId,
                    entityType: "Order",
                    message: `Stripe refund error: ${stripeErr.message}`,
                });
                // Return the error so the merchant knows
                return { error: `Stripe error: ${stripeErr.message}. Refund the customer manually in your Stripe dashboard.` };
            }
        }

        // Mark order as refunded in DB
        const { error: updateError } = await supabaseAdmin
            .from('Order')
            .update({ isRefunded: true, status: 'CANCELLED', updatedAt: new Date().toISOString() })
            .eq('id', orderId);

        if (updateError) throw updateError;

        // Notify customer via SMS
        const customerPhone = (order.user as any)?.phone;
        const restaurantName = (order.restaurant as any)?.name || "the restaurant";
        const ref = order.posReference || orderId.slice(-6).toUpperCase();
        if (customerPhone) {
            try {
                await sendSMS(customerPhone, `Your order #${ref} from ${restaurantName} has been refunded. The amount will appear on your statement within 3–5 business days.`);
            } catch { /* non-blocking */ }
        }

        // Notify customer via email
        const customerEmail = (order.user as any)?.email;
        const customerName = (order.user as any)?.name || "there";
        if (customerEmail) {
            try {
                await sendEmail(
                    customerEmail,
                    `Refund issued for order #${ref}`,
                    `<div style="font-family:sans-serif;background:#0c0f0d;color:#fff;padding:32px;max-width:560px;margin:0 auto;border-radius:12px"><p style="font-size:11px;color:#f97316;font-weight:800;letter-spacing:.15em;text-transform:uppercase;margin:0 0 8px">TrueServe Delivery</p><h1 style="font-size:24px;font-weight:900;margin:0 0 8px">Refund Issued</h1><p style="color:#aaa">Hi ${customerName}, your order <strong style="color:#fff">#${ref}</strong> from ${restaurantName} has been refunded for <strong style="color:#fff">$${Number(order.total).toFixed(2)}</strong>. Please allow 3–5 business days for the amount to appear on your statement.</p></div>`
                );
            } catch { /* non-blocking */ }
        }

        await logAuditAction({
            action: "REFUND_ORDER",
            targetId: orderId,
            entityType: "Order",
            message: `Merchant refunded order #${ref}. Stripe refund ID: ${stripeRefundId || "none (no payment intent)"}`,
        });

        revalidatePath('/merchant/dashboard');
        return { success: true, stripeRefundId };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function generateApiKey() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || (await cookies()).get("userId")?.value;
    if (!userId) return { error: "Unauthorized" };

    try {
        const newKey = `ts_${uuidv4().replace(/-/g, '')}`;
        const { data: restaurant } = await supabaseAdmin
            .from('Restaurant')
            .select('id')
            .eq('ownerId', userId)
            .single();

        if (!restaurant) throw new Error("Restaurant not found");

        const { error } = await supabaseAdmin
            .from('Restaurant')
            .update({ apiKey: newKey, updatedAt: new Date().toISOString() })
            .eq('id', restaurant.id);

        if (error) throw error;
        revalidatePath('/merchant/dashboard');
        return { success: true, apiKey: newKey };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function submitMerchantInquiry(prevState: any, formData: FormData): Promise<MerchantActionState> {
    const restaurantName = formData.get("restaurantName") as string;
    const contactName = formData.get("contactName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const zip = formData.get("zip") as string;
    const plan = formData.get("plan") as string;
    const posSystem = formData.get("posSystem") as string || "None";
    const posClientId = formData.get("posClientId") as string || "";
    const posClientSecret = formData.get("posClientSecret") as string || "";
    const phone = formData.get("phone") as string || "";

    if (!restaurantName || !contactName || !email || !password || !address || !city || !state) {
        return { message: "Please fill in all required fields.", error: true };
    }

    try {
        const { data: existingPublicUser } = await supabaseAdmin
            .from('User')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (existingPublicUser) {
            return { message: "This email is already registered.", error: true };
        }

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { displayName: contactName, role: 'MERCHANT' }
        });

        if (authError) throw authError;
        const userId = authData.user!.id;

        // Create Public User
        const { error: userError } = await supabaseAdmin.from('User').insert({
            id: userId,
            email,
            name: contactName,
            role: 'MERCHANT',
            address: `${address}, ${city}, ${state} ${zip}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        if (userError) throw userError;

        // Geocoding
        let lat = 35.2271;
        let lng = -80.8431;

        try {
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            if (apiKey) {
                const fullAddress = `${address}, ${city}, ${state} ${zip}`;
                const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`;
                const geoRes = await fetch(geoUrl);
                const geoData = await geoRes.json();
                if (geoData.status === 'OK') {
                    lat = geoData.results[0].geometry.location.lat;
                    lng = geoData.results[0].geometry.location.lng;
                }
            }
        } catch (e) { console.error("Geocoding failed", e); }

        // Create Restaurant (pending manual admin approval)
        const restaurantId = uuidv4();
        const { error: restError } = await supabaseAdmin.from('Restaurant').insert({
            id: restaurantId,
            ownerId: userId,
            name: restaurantName,
            address: `${address}, ${city}, ${state} ${zip}`,
            city,
            state,
            lat,
            lng,
            imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1200',
            plan: plan || 'Flex Options',
            posSystem,
            posClientId,
            posClientSecret,
            phone,
            visibility: 'HIDDEN',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        if (restError) throw restError;

        const ghlLeadResult = await syncSignupLeadToGHL({
            type: "MERCHANT",
            name: contactName,
            email,
            phone,
            address,
            city,
            state,
            postalCode: zip,
            companyName: restaurantName,
            source: "TrueServe Merchant Signup",
            tags: [
                "Merchant Pending Review",
                `Plan ${plan || "Flex Options"}`,
                `POS ${posSystem || "None"}`,
            ],
        });

        if (!ghlLeadResult.success) {
            console.error("[GHL Merchant Lead Sync Error]:", ghlLeadResult.error);
        }

        // Set Cookie manually for the current request context if needed, 
        // but Next.js Action will handle redirect & session normally if we use Auth correctly.
        const cookieStore = await cookies();
        cookieStore.set("userId", userId, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        // Notify Team of NEW MERCHANT
        const { data: staffMembers } = await supabaseAdmin
            .from('User')
            .select('id, email, phone')
            .in('role', ['ADMIN', 'OPS', 'SUPPORT', 'FINANCE', 'PM']);

        const staffRecords = (staffMembers || []).filter((member: any) => member?.email);
        const staffEmails = Array.from(new Set(
            staffRecords
                .map((member: any) => member.email.trim().toLowerCase())
                .filter(Boolean)
        )) as string[];
        const staffPhones = Array.from(new Set(
            staffRecords
                .map((member: any) => normalizePhoneNumber(member.phone || ""))
                .filter(Boolean)
        )) as string[];

        const notificationPromises: Promise<any>[] = [];

        // SMS to Merchant (if phone provided)
        if (phone) {
            notificationPromises.push(
                sendSMS(
                    phone,
                    `TrueServe: Welcome ${contactName}! ${restaurantName} is now live on our platform. Log in to your dashboard to add menu items and start receiving orders: trueserve.delivery/merchant/login`
                )
            );
        }

        // Email to Merchant
        notificationPromises.push(
            sendEmail(
                email,
                "TrueServe Merchant Application Received",
                `<h1>Application Received, ${contactName}! Food</h1>
                <p>Thanks for applying with <strong>${restaurantName}</strong>.</p>
                <p>Your merchant account is now in <strong>pending review</strong>. An admin will manually verify and approve your onboarding before you can log into the merchant dashboard.</p>
                <p>We’ll email you immediately when approved, with next steps for Stripe, POS integration, and launch readiness.</p>
                <p>Best,<br>The TrueServe Team</p>`
            )
        );

        // Email notifications to staff
        for (const staffEmail of staffEmails) {
            notificationPromises.push(
                sendEmail(
                    staffEmail,
                    `Urgent NEW MERCHANT SIGNUP: ${restaurantName}`,
                    `<h1>New Merchant Application</h1>
                    <p><strong>Restaurant:</strong> ${restaurantName}</p>
                    <p><strong>Contact:</strong> ${contactName}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Address:</strong> ${address}, ${city}, ${state} ${zip}</p>
                    <p><strong>Selected Plan:</strong> ${plan || 'Flex'}</p>
                    <p><strong>POS System:</strong> ${posSystem}</p>
                    <hr />
                    <p>Please review and approve the merchant in the Admin Registry.</p>`
                )
            );
        }

        const staffSmsMessage = `TrueServe: New merchant signup from ${contactName} (${restaurantName}). Open admin portal to review and approve the application.`;
        for (const staffPhone of staffPhones) {
            notificationPromises.push(sendSMS(staffPhone, staffSmsMessage));
        }

        for (const staffMember of staffRecords as Array<{ id?: string }>) {
            if (!staffMember.id) continue;
            notificationPromises.push(createNotification({
                userId: staffMember.id,
                title: "New Merchant Signup",
                message: `${restaurantName} (${contactName}) submitted a merchant application and should appear in Admin → Users for review.`,
                type: "MERCHANT_APPLICATION",
            }));
        }

        await Promise.allSettled(notificationPromises);
        revalidatePath("/admin/users");
        revalidatePath("/admin/dashboard");
        
        return { success: true, message: "Application submitted. We’ll notify you once approved." };

    } catch (e: any) {
        if (e.message?.includes('NEXT_REDIRECT')) throw e;
        console.error("Signup Error:", e);
        return { message: e.message || "Signup failed", error: true };
    }
}

export async function createStripeAccount(providedId?: string | FormData) {
    const cookieStore = await cookies();
    let userId: string | undefined;

    if (typeof providedId === 'string') userId = providedId;
    else {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id || cookieStore.get("userId")?.value;
    }

    if (!userId) redirect("/login");

    try {
        const { data: restaurant } = await supabaseAdmin
            .from('Restaurant')
            .select('*')
            .eq('ownerId', userId)
            .single();

        if (!restaurant) throw new Error("Restaurant not found");

        let stripeAccountId = restaurant.stripeAccountId;
        const baseUrl = getAppBaseUrl();
        const stripe = getStripe();
        const metadata = { restaurantId: restaurant.id, userId, role: 'merchant' };

        if (!stripeAccountId) {
            const { data: user } = await supabaseAdmin.from('User').select('email').eq('id', userId).single();
            try {
                const account = await stripe.v2.core.accounts.create({
                    contact_email: user?.email,
                    display_name: restaurant.name,
                    dashboard: 'express',
                    configuration: {
                        recipient: {
                            capabilities: {
                                stripe_balance: {
                                    stripe_transfers: { requested: true }
                                }
                            }
                        }
                    },
                    metadata,
                });
                stripeAccountId = account.id;
            } catch (v2CreateError) {
                console.error("Stripe v2 account creation failed, falling back to v1:", v2CreateError);
                const account = await stripe.accounts.create({
                    type: 'express',
                    email: user?.email || undefined,
                    metadata,
                    capabilities: {
                        transfers: { requested: true },
                    },
                });
                stripeAccountId = account.id;
            }

            await supabaseAdmin.from('Restaurant').update({ stripeAccountId }).eq('id', restaurant.id);
        }

        let onboardingUrl: string | null = null;

        try {
            const accountLink = await stripe.v2.core.accountLinks.create({
                account: stripeAccountId,
                use_case: {
                    type: 'account_onboarding',
                    account_onboarding: {
                        configurations: ['recipient'],
                        collection_options: { fields: 'eventually_due' },
                        refresh_url: `${baseUrl}/merchant/dashboard`,
                        return_url: `${baseUrl}/merchant/onboarding-success`,
                    },
                },
            });
            onboardingUrl = accountLink.url;
        } catch (v2LinkError) {
            console.error("Stripe v2 account link failed, falling back to v1:", v2LinkError);
            const accountLink = await stripe.accountLinks.create({
                account: stripeAccountId,
                refresh_url: `${baseUrl}/merchant/dashboard`,
                return_url: `${baseUrl}/merchant/onboarding-success`,
                type: 'account_onboarding',
            });
            onboardingUrl = accountLink.url;
        }

        if (!onboardingUrl) throw new Error("Stripe onboarding URL missing");
        redirect(onboardingUrl);
    } catch (e: any) {
        if (e.message?.includes('NEXT_REDIRECT')) throw e;
        console.error("Stripe Error:", e);
        const stripeCode = String(e?.code || e?.raw?.code || "");
        const stripeMessage = String(e?.raw?.message || e?.message || "").toLowerCase();
        if (stripeCode === "v2_api_not_supported_in_testmode" || stripeMessage.includes("signed up for connect")) {
            redirect('/merchant/dashboard?stripe_connect=setup_required');
        }
        redirect('/merchant/dashboard?stripe_connect=error');
    }
}

export async function toggleBusyMode(restaurantId: string, currentStatus: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { error } = await supabase
            .from('Restaurant')
            .update({ isBusy: !currentStatus, updatedAt: new Date().toISOString() })
            .eq('id', restaurantId)
            .eq('ownerId', user.id);

        if (error) throw error;

        await logAuditAction({ 
            action: "TOGGLE_BUSY_MODE", 
            targetId: restaurantId, 
            entityType: "Restaurant", 
            before: { isBusy: currentStatus }, 
            after: { isBusy: !currentStatus } 
        });
        revalidatePath('/merchant/dashboard');
        revalidatePath('/merchant/dashboard/menu');
        revalidatePath('/restaurants');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function toggleItemStock(itemId: string, currentStatus: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { error } = await supabase
            .from('MenuItem')
            .update({ isAvailable: !currentStatus, updatedAt: new Date().toISOString() })
            .eq('id', itemId);

        if (error) throw error;

        await logAuditAction({ 
            action: "TOGGLE_ITEM_STOCK", 
            targetId: itemId, 
            entityType: "MenuItem", 
            before: { isAvailable: currentStatus }, 
            after: { isAvailable: !currentStatus } 
        });
        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function updatePrepTime(restaurantId: string, minutes: number | null) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { error } = await supabase
            .from('Restaurant')
            .update({ manualPrepTime: minutes, updatedAt: new Date().toISOString() })
            .eq('id', restaurantId)
            .eq('ownerId', user.id);

        if (error) throw error;
        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function setBusyDuration(restaurantId: string, minutes: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const busyUntil = new Date(Date.now() + minutes * 60000).toISOString();
        const { error } = await supabase
            .from('Restaurant')
            .update({ 
                isBusy: true, 
                busyUntil: busyUntil,
                updatedAt: new Date().toISOString() 
            })
            .eq('id', restaurantId)
            .eq('ownerId', user.id);

        if (error) throw error;
        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function upsertBusyZone(restaurantId: string, schedule: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { error } = await supabase
            .from('MerchantSchedule')
            .upsert({
                id: schedule.id || uuidv4(),
                restaurantId,
                ...schedule,
                updatedAt: new Date().toISOString()
            });

        if (error) throw error;
        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function deleteBusyZone(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { error } = await supabase
            .from('MerchantSchedule')
            .delete()
            .eq('id', id);

        if (error) throw error;
        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function updateAutoPilotSettings(restaurantId: string, enabled: boolean, threshold: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { error } = await supabase
            .from('Restaurant')
            .update({ 
                autoPilotEnabled: enabled, 
                capacityThreshold: threshold,
                updatedAt: new Date().toISOString() 
            })
            .eq('id', restaurantId)
            .eq('ownerId', user.id);

        if (error) throw error;
        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function updateRestaurantHours(restaurantId: string, openTime: string, closeTime: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // Validate HH:MM format
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(openTime) || !timeRegex.test(closeTime)) {
        return { error: "Invalid time format. Use HH:MM (24-hour)." };
    }

    try {
        const { error } = await supabase
            .from('Restaurant')
            .update({
                openTime: openTime + ':00',
                closeTime: closeTime + ':00',
                updatedAt: new Date().toISOString(),
            })
            .eq('id', restaurantId)
            .eq('ownerId', user.id);

        if (error) throw error;
        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function toggleIngredientStock(restaurantId: string, ingredient: string, isNowAvailable: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        // Fetch current out of stock list
        const { data: restaurant } = await supabase
            .from('Restaurant')
            .select('outOfStockIngredients')
            .eq('id', restaurantId)
            .single();

        let list = restaurant?.outOfStockIngredients || [];
        
        if (isNowAvailable) {
            list = list.filter((i: string) => i !== ingredient.toLowerCase());
        } else {
            if (!list.includes(ingredient.toLowerCase())) {
                list.push(ingredient.toLowerCase());
            }
        }

        const { error } = await supabase
            .from('Restaurant')
            .update({ 
                outOfStockIngredients: list,
                updatedAt: new Date().toISOString() 
            })
            .eq('id', restaurantId)
            .eq('ownerId', user.id);

        if (error) throw error;
        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

import { analyzeMerchantSentiment } from "@/lib/customerPulse";

export async function savePosCredentials(posSystem: string, clientId: string, clientSecret: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || (await cookies()).get("userId")?.value;
    if (!userId) return { error: "Unauthorized" };

    try {
        const updatePayload: Record<string, any> = {
            posSystem,
            posClientId: clientId,
            updatedAt: new Date().toISOString()
        };

        if (clientSecret) {
            updatePayload.posClientSecret = clientSecret;
        }

        const { error } = await supabaseAdmin
            .from('Restaurant')
            .update(updatePayload)
            .eq('ownerId', userId);

        if (error) throw error;
        
        await logAuditAction({ 
            action: "UPDATE_POS_CREDENTIALS", 
            targetId: userId, 
            entityType: "Restaurant", 
            message: `Updated integration for ${posSystem}` 
        });
        
        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function getMerchantSentiment(restaurantId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { data: reviews, error } = await supabase
            .from('Review')
            .select('comment, rating')
            .eq('restaurantId', restaurantId)
            .eq('type', 'RESTAURANT')
            .limit(20);

        if (error) throw error;

        const analysis = await analyzeMerchantSentiment(reviews || []);
        return { success: true, analysis };
    } catch (e: any) {
        return { error: e.message };
    }
}

import { generateMerchantBriefing } from "@/lib/merchantAI";

export async function getMerchantBriefing(restaurantId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { data: restaurant } = await supabase
            .from('Restaurant')
            .select(`
                name, 
                outOfStockIngredients,
                orders:Order(id, status, createdAt),
                reviews:Review(rating, comment)
            `)
            .eq('id', restaurantId)
            .single();

        if (!restaurant) throw new Error("Restaurant not found");

        const briefing = await generateMerchantBriefing({
            restaurantName: restaurant.name,
            recentOrders: (restaurant.orders as any[]) || [],
            reviews: (restaurant.reviews as any[]) || [],
            outOfStock: (restaurant.outOfStockIngredients as string[]) || []
        });

        return { success: true, briefing };
    } catch (e: any) {
        return { error: e.message };
    }
}

import { suggestMenuOptimizations } from "@/lib/merchantAI";

export async function getMenuOptimizations(restaurantId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { data: restaurant } = await supabase
            .from('Restaurant')
            .select('id, menuItems:MenuItem(*), orders:Order(id, status, items:OrderItem(*))')
            .eq('id', restaurantId)
            .single();

        if (!restaurant) throw new Error("Restaurant not found");

        const optimizations = await suggestMenuOptimizations(restaurant.menuItems || [], restaurant.orders || []);
        return { success: true, optimizations };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function startFlashSale(itemId: string, discountPercent: number, hours: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        // Secure check: Ensure item belongs to a restaurant owned by this user
        const { data: item, error: fetchError } = await supabase
            .from('MenuItem')
            .select('*, restaurant:Restaurant(ownerId)')
            .eq('id', itemId)
            .single();

        if (fetchError || !item) throw new Error("Item not found");
        if ((item.restaurant as any).ownerId !== user.id) throw new Error("Unauthorized: You do not own this restaurant");

        const saleUntil = new Date();
        saleUntil.setHours(saleUntil.getHours() + hours);

        const currentPrice = Number(item.originalPrice || item.price);
        const newPrice = currentPrice * (1 - (discountPercent / 100));

        const { error: updateError } = await supabase
            .from('MenuItem')
            .update({
                originalPrice: currentPrice,
                price: newPrice,
                saleUntil: saleUntil.toISOString(),
                updatedAt: new Date().toISOString()
            })
            .eq('id', itemId);

        if (updateError) throw updateError;

        await logAuditAction({ 
            action: "START_FLASH_SALE", 
            targetId: itemId, 
            entityType: "MenuItem", 
            after: { discountPercent, hours, newPrice } 
        });
        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}


export async function sendKitchenReassurance(orderId: string, message: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { data: order } = await supabase.from('Order').select('userId, id').eq('id', orderId).single();
        if (!order) throw new Error("Order not found");

        const { error } = await supabase
            .from('Notification')
            .insert({
                userId: order.userId,
                title: "Message from the Kitchen",
                message: message,
                type: 'ORDER_UPDATE',
                orderId: order.id,
                isRead: false
            });

        if (error) throw error;
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

/**
 * Get all restaurants owned by a merchant
 * Supports multi-location merchants with flexible ownership
 */
export async function getMerchantRestaurants() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: "Unauthorized", restaurants: [] };
        }

        const { data, error } = await supabase
            .from('Restaurant')
            .select(`
                id,
                name,
                city,
                state,
                complianceScore,
                healthGrade,
                complianceStatus,
                lastInspectionAt,
                updatedAt
            `)
            .eq('ownerId', user.id)
            .order('createdAt', { ascending: true });

        if (error) {
            return { error: error.message, restaurants: [] };
        }

        return { success: true, restaurants: data || [] };
    } catch (e: any) {
        return { error: e.message, restaurants: [] };
    }
}
