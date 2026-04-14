"use server";

import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type AuthState = {
    message: string;
    success?: boolean;
    error?: boolean;
    role?: string;
};

export async function loginWithPassword(formData: FormData): Promise<AuthState> {
    const rawEmail = formData.get("email") as string;
    const rawPassword = formData.get("password") as string;

    // Trim and normalize inputs to prevent minor typos from failing the demo
    const email = rawEmail?.trim()?.toLowerCase();
    const password = rawPassword?.trim();

    const cookieStore = await cookies();
    const supabase = await createClient();

    if (!email || !password) {
        return { message: "Email and Password are required", error: true };
    }

    // --- PILOT TESTING BYPASS ---
    if (email === "test@trueserve.com" && password === "trueserve2026") {
        console.log("[AUTH] Using Pilot Testing Bypass Credentials");
        const DEMO_DRIVER_ID = "a18a0115-5238-4e82-a2e1-0020e2c40ba1";
        const cookieStore = await cookies();
        
        // Ensure standard driver setup exists for this ID
        await loginAsDemoDriver();
        
        cookieStore.set("userId", DEMO_DRIVER_ID, { 
            secure: process.env.NODE_ENV === "production", 
            httpOnly: true, 
            path: '/' 
        });
        
        return { message: "Pilot Login successful!", success: true, role: "DRIVER" };
    }

    try {
        console.log(`[AUTH] Checking login for: "${email}"`);

        console.log(`[AUTH] Attempting standard Supabase Auth for: ${email}`);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error("Supabase Login Error:", error.message);
            return { message: error.message, error: true };
        }

        let role = 'CUSTOMER';

        if (data.user) {
            // Sync with public User table (Check if exists, if not, might need to create or it's a legacy user)
            const { data: publicUser } = await supabase.from('User').select('id, role').eq('id', data.user.id).maybeSingle();

            if (publicUser) {
                role = publicUser.role;

                // Log Audit Login Event
                const { logAuditAction } = await import('@/lib/audit');
                await logAuditAction({
                    action: "LOGIN",
                    targetId: publicUser.id,
                    entityType: "User",
                    message: `Login successful for role: ${role}`
                });

                // Set App Cookie for compatibility
                cookieStore.set("userId", publicUser.id, { secure: process.env.NODE_ENV === "production", httpOnly: true, path: '/' });
            } else {
                // Fallback if public user missing but Auth exists (shouldn't happen often)
                cookieStore.set("userId", data.user.id, { secure: process.env.NODE_ENV === "production", httpOnly: true, path: '/' });
            }
        }

        return { message: "Login successful!", success: true, role };

    } catch (e: any) {
        return { message: e.message || "Login failed", error: true };
    }
}

export async function signupWithPassword(formData: FormData): Promise<AuthState> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = (formData.get("role") as string) || 'CUSTOMER';
    const plan = formData.get("plan") as string || 'Basic'; // Capture requested plan
    const name = (formData.get("name") as string) || email.split('@')[0];
    const address = formData.get("address") as string;
    const cookieStore = await cookies();
    const supabase = await createClient();

    if (!email || !password) {
        return { message: "Email and Password are required", error: true };
    }

    try {
        // 0. Check if User record already exists in Public table
        const { data: existingPublicUser } = await supabaseAdmin
            .from('User')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (existingPublicUser) {
            return { message: "This email is already registered. Please log in instead.", error: true };
        }

        // 1. Sign Up in Supabase Auth
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name, role }
        });

        if (error) {
            if (error.message.includes("already exists")) {
                return { message: "An account with this email already exists. Please log in.", error: true };
            }
            return { message: error.message, error: true };
        }

        if (data.user) {
            // 2. Create Public User Record
            const { error: dbError } = await supabaseAdmin.from('User').insert({
                id: data.user.id,
                email: email,
                name: name,
                role: role,
                plan: plan, // Store the plan
                address: address || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            if (dbError) console.error("Public User Insert Error:", dbError);

            cookieStore.set("userId", data.user.id, { 
                secure: process.env.NODE_ENV === "production", 
                httpOnly: true,
                path: '/' 
            });

            // 3. STRIPE REDIRECTION FOR PLUS/PREMIUM
            if (role === 'CUSTOMER' && (plan === 'Plus' || plan === 'Premium')) {
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
                const amount = plan === 'Plus' ? 999 : 1999;

                const session = await (await import("@/lib/stripe")).getStripe().checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: [{
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: `TrueServe ${plan} Membership`,
                                description: plan === 'Plus' ? 'Priority dispatch & Member-only discounts' : 'Zero delivery fees & Concierge support'
                            },
                            unit_amount: amount,
                            recurring: { interval: 'month' }
                        },
                        quantity: 1,
                    }],
                    mode: 'subscription',
                    success_url: `${baseUrl}/auth/onboarding-success?session_id={CHECKOUT_SESSION_ID}&type=customer`,
                    cancel_url: `${baseUrl}/benefits`,
                    metadata: {
                        userId: data.user.id,
                        plan: plan
                    }
                });

                if (session.url) redirect(session.url);
            }
        }

        return { message: "Account created! Redirecting...", success: true };

    } catch (e: any) {
        if (e.message?.includes('NEXT_REDIRECT')) throw e;
        return { message: e.message || "Signup failed", error: true };
    }
}

export async function resetPassword(formData: FormData): Promise<AuthState> {
    const email = formData.get("email") as string;
    const supabase = await createClient();

    if (!email) return { message: "Email is required", error: true };
    const { sendEmail } = await import("@/lib/email");

    try {
        // 1. Generate a secure recovery link via Supabase Admin
        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email: email,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://trueserve.delivery'}/update-password`,
            }
        });

        if (error) throw error;

        // 2. Wrap that link in our Premium Emerald Branding
        const resetLink = data.properties.action_link;
        
        await sendEmail(
            email,
            "Secure Password Reset - TrueServe",
            `<h1>Security Alert: Password Reset</h1>
            <p>We received a request to reset the password for your TrueServe account.</p>
            <p>If this was you, please click the secure button below to choose a new password. This link is valid for **1 hour**.</p>
            <div style="text-align: center; margin: 40px 0;">
                <a href="${resetLink}" class="button">Reset My Password</a>
            </div>
            <p>If you did not request this, you can safely ignore this email. Your account remains secure.</p>
            <p><em>Security Tip: Never share your password reset links with anyone, including TrueServe staff.</em></p>`
        );

        return { message: "Branded reset link sent! Please check your inbox.", success: true };
    } catch (e: any) {
        console.error("Reset Password Error:", e);
        return { message: e.message || "Failed to send reset email.", error: true };
    }
}

export async function logout() {
    console.log("[AUTH] Standard Logout Initiated...");
    const cookieStore = await cookies();
    const supabase = await createClient();
    
    // 1. Sign out of Supabase Auth (clears server-side session)
    await supabase.auth.signOut();
    
    // 2. Identify Domain for cross-subdomain cookie clearing
    const headersList = await headers();
    const host = headersList.get('host') || "";
    const cleanHost = host.split(':')[0];
    const isLocal = cleanHost.includes("localhost");
    const isVercel = cleanHost.endsWith(".vercel.app");
    
    let cookieDomain = "";
    const pieces = cleanHost.split('.');
    if (!isLocal && !isVercel && pieces.length >= 2) {
        cookieDomain = `.${pieces.slice(-2).join('.')}`;
    }

    // 3. Define all possible auth cookies to clear
    const allCookies = cookieStore.getAll();
    const authCookiesToClear = ["userId", "admin_session"];
    
    // Add any and all supabase tokens (they start with sb-)
    allCookies.forEach(c => {
        if (c.name.startsWith("sb-")) {
            authCookiesToClear.push(c.name);
        }
    });
    
    authCookiesToClear.forEach(name => {
        // Clear host-only
        cookieStore.delete(name as any);
        
        // Clear root domain if in production
        if (cookieDomain) {
            cookieStore.set(name as any, "", { 
                domain: cookieDomain, 
                path: '/', 
                maxAge: 0,
                secure: process.env.NODE_ENV === "production",
                httpOnly: true,
                sameSite: 'lax'
            });
        }
    });

    console.log("[AUTH] All tokens and cookies scanned and cleared. Redirecting to home.");
    redirect("/");
}

export async function getAuthSession(): Promise<{ isAuth: boolean; userId?: string; role?: string; name?: string; stripeAccountId?: string }> {
    try {
        const cookieStore = await cookies();
        const isPreview = cookieStore.get("preview_mode")?.value === "true";
        
        if (isPreview) {
            return { isAuth: true, userId: "preview-user-id", role: "ADMIN", name: "Preview User" };
        }

        const userId = cookieStore.get("userId")?.value;
        console.log("[AuthSession] userId from cookie:", userId);

        let role = 'CUSTOMER';

        if (!userId) {
            // Fallback: Check Supabase session directly
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();
            console.log("[AuthSession] Supabase fallback user:", user?.id);
            if (user) {
                const { data: publicUser } = await supabaseAdmin
                    .from('User')
                    .select('role, name, stripeAccountId')
                    .eq('email', user.email)
                    .maybeSingle();

                return { isAuth: true, userId: user.id, role: publicUser?.role || 'CUSTOMER', name: publicUser?.name || user.email, stripeAccountId: publicUser?.stripeAccountId };
            }
            return { isAuth: false };
        }

        // Try getting by ID first
        let { data: publicUser } = await supabaseAdmin
            .from('User')
            .select('role, name, stripeAccountId')
            .eq('id', userId)
            .maybeSingle();

        if (publicUser?.role) {
            role = publicUser.role;
        } else {
            // ID Mismatch fallback: Try by email
            const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
            if (authUser?.user?.email) {
                const { data: publicUserByEmail } = await supabaseAdmin
                    .from('User')
                    .select('role')
                    .eq('email', authUser.user.email)
                    .maybeSingle();
                
                if (publicUserByEmail?.role) {
                    role = publicUserByEmail.role;
                }
            }
        }
        
        console.log("[AuthSession] Result:", { isAuth: true, userId, role, name: publicUser?.name, stripeAccountId: publicUser?.stripeAccountId });

        return { isAuth: true, userId, role, name: publicUser?.name || 'User', stripeAccountId: publicUser?.stripeAccountId };
    } catch (e) {
        console.error("[AuthSession] Error:", e);
        return { isAuth: false };
    }
}

export async function syncUserSession() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const cookieStore = await cookies();

    if (user) {
        // Sync with public User table
        const { data: publicUser } = await supabaseAdmin
            .from('User')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
            
        cookieStore.set("userId", user.id, { 
            secure: process.env.NODE_ENV === "production", 
            httpOnly: true,
            path: '/' 
        });
        
        return { success: true, role: publicUser?.role || 'CUSTOMER' };
    }

    return { success: false };
}

export async function loginAsDemoDriver() {
    const cookieStore = await cookies();
    
    // We'll use a known driver ID from the database for the demo
    const DEMO_DRIVER_ID = "a18a0115-5238-4e82-a2e1-0020e2c40ba1";
    
    // 1. Ensure User record exists
    const { data: existingUser } = await supabaseAdmin
        .from('User')
        .select('id')
        .eq('id', DEMO_DRIVER_ID)
        .maybeSingle();
        
    if (!existingUser) {
        await supabaseAdmin.from('User').insert({
            id: DEMO_DRIVER_ID,
            name: "Demo Driver",
            email: "demo-driver@trueservedelivery.com",
            role: "DRIVER",
            phone: "+15550001234",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    // 2. Ensure Driver record exists (essential for dashboard layout)
    const { data: existingDriver } = await supabaseAdmin
        .from('Driver')
        .select('id')
        .eq('userId', DEMO_DRIVER_ID)
        .maybeSingle();

    if (!existingDriver) {
        await supabaseAdmin.from('Driver').insert({
            id: uuidv4(),
            userId: DEMO_DRIVER_ID,
            status: 'ONLINE',
            vehicleType: 'CAR',
            vehicleMake: 'TrueServe',
            vehicleModel: 'Eco',
            vehicleColor: 'Black',
            licensePlate: 'DEMO-123',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    // 3. Set the cookie
    cookieStore.set("userId", DEMO_DRIVER_ID, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 // 24 hours
    });
    
    return { success: true };
}

export async function loginAsPilot() {
    const cookieStore = await cookies();
    
    console.log("[AUTH] Atomic Reset: Clearing cached sessions for Pilot access...");
    
    // Clear everything first to prevent redirect loops from old CUSTOMER sessions
    cookieStore.delete("userId");
    cookieStore.delete("sb-access-token");
    cookieStore.delete("sb-refresh-token");
    
    // Set the Pilot bypass (Not httpOnly so the Login page can see it)
    cookieStore.set("preview_mode", "true", { 
        path: "/", 
        httpOnly: false, 
        secure: false, // Ensure visibility on localtunnel HTTPS
        maxAge: 60 * 60 * 12 // 12 hours
    });
    
    redirect("/driver/dashboard");
}

export async function loginAsDemoMerchant() {
    const cookieStore = await cookies();
    const DEMO_MERCHANT_ID = "merchant-demo-2026";

    // Clear old tokens to avoid session ghosting
    cookieStore.delete("sb-access-token");
    cookieStore.delete("sb-refresh-token");

    // Ensure User record exists so support chat and other features work
    const { data: existingUser } = await supabaseAdmin
        .from('User')
        .select('id')
        .eq('id', DEMO_MERCHANT_ID)
        .maybeSingle();

    if (!existingUser) {
        await supabaseAdmin.from('User').insert({
            id: DEMO_MERCHANT_ID,
            name: "Demo Merchant",
            email: "demo-merchant@trueservedelivery.com",
            role: "MERCHANT",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    cookieStore.set("userId", DEMO_MERCHANT_ID, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24
    });

    // Set the Pilot bypass for redirect speed
    cookieStore.set("preview_mode", "true", {
        path: "/",
        httpOnly: false,
        secure: false, // Ensure visibility on localtunnel HTTPS
        maxAge: 60 * 60 * 12 // 12 hours
    });

    redirect("/merchant/dashboard");
}

