"use server";

import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";
import { normalizePhoneNumber } from "@/lib/phoneUtils";
import { syncSignupLeadToGHL } from "@/lib/ghl-sync";

export type AuthState = {
    message: string;
    success?: boolean;
    error?: boolean;
    role?: string;
};

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function loginWithPassword(formData: FormData): Promise<AuthState> {
    const rawEmail = formData.get("email") as string;
    const rawPassword = formData.get("password") as string;

    // Trim and normalize inputs to prevent minor typos from failing the demo
    const email = rawEmail?.trim()?.toLowerCase();
    const password = rawPassword;

    const cookieStore = await cookies();
    const supabase = await createClient();

    if (!email || !password) {
        return { message: "Email and Password are required", error: true };
    }

    // --- DEV/PREVIEW BYPASS (never runs on production) ---
    // NEXT_PUBLIC_APP_ENV must be explicitly set to 'production' on production deploys.
    // In local dev it is undefined; on Vercel preview it is 'preview' — both allow bypass.
    const isProductionEnv = (process.env.NEXT_PUBLIC_APP_ENV as string) === 'production';
    if (
        !isProductionEnv &&
        email === "test@trueserve.com" &&
        password === "trueserve2026"
    ) {
        console.log("[AUTH] Using Dev Bypass Credentials");
        const DEMO_DRIVER_ID = "a18a0115-5238-4e82-a2e1-0020e2c40ba1";
        const cookieStore = await cookies();

        await loginAsDemoDriver();

        cookieStore.set("userId", DEMO_DRIVER_ID, {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            path: '/'
        });

        return { message: "Dev login successful!", success: true, role: "DRIVER" };
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

export async function signupWithPassword(prevStateOrFormData: AuthState | FormData, maybeFormData?: FormData): Promise<AuthState> {
    const formData = maybeFormData ?? (prevStateOrFormData as FormData);
    const rawEmail = (formData.get("email") as string) || "";
    const password = (formData.get("password") as string) || "";
    const email = rawEmail.trim().toLowerCase();
    const role = (formData.get("role") as string) || 'CUSTOMER';
    const plan = formData.get("plan") as string || 'Basic'; // Capture requested plan
    const name = (formData.get("name") as string) || email.split('@')[0];
    const address = formData.get("address") as string;
    const deliveryNotes = ((formData.get("deliveryNotes") as string) || "").trim();
    const phone = normalizePhoneNumber((formData.get("phone") as string) || "");
    const cookieStore = await cookies();
    const supabase = await createClient();

    if (!email || !password) {
        return { message: "Email and Password are required", error: true };
    }

    if (!EMAIL_PATTERN.test(email)) {
        return { message: "Please enter a valid email address.", error: true };
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
        return { message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`, error: true };
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
                phone: phone || null,
                savedAddresses: address
                    ? JSON.stringify([
                        {
                            id: uuidv4(),
                            label: "Home",
                            address,
                            isDefault: true,
                            ...(deliveryNotes ? { notes: deliveryNotes } : {}),
                        },
                    ])
                    : null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            if (dbError) console.error("Public User Insert Error:", dbError);

            const ghlLeadResult = await syncSignupLeadToGHL({
                type: "CUSTOMER",
                name,
                email,
                phone,
                address,
                source: "TrueServe Customer Signup",
                tags: [`Customer Plan ${plan || "Basic"}`],
            });

            if (!ghlLeadResult.success) {
                console.error("[GHL Customer Lead Sync Error]:", ghlLeadResult.error);
            }

            cookieStore.set("userId", data.user.id, { 
                secure: process.env.NODE_ENV === "production", 
                httpOnly: true,
                path: '/' 
            });

            // 3. Send customer onboarding email with next-step guidance.
            // Do not block account creation if email provider is temporarily unavailable.
            await sendEmail(
                email,
                "Welcome to TrueServe! Your account is ready",
                `<h1>Welcome to TrueServe, ${name}! 👋</h1>
                <p>Your customer account has been created successfully.</p>
                <p>Next steps:</p>
                <ul>
                    <li>Browse nearby restaurants and start your first order.</li>
                    <li>Add your saved payment method in Account Settings for faster checkout.</li>
                    <li>Track orders live and manage rewards from your dashboard.</li>
                </ul>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://trueserve.delivery/restaurants" class="button">Start Ordering</a>
                </div>
                <p>You can also manage your profile and wallet here:</p>
                <p><a href="https://trueserve.delivery/user/settings">trueserve.delivery/user/settings</a></p>
                <p>Thanks for joining TrueServe.</p>`
            ).catch((mailErr) => {
                console.error("Customer welcome email failed:", mailErr);
            });

            // 4. STRIPE REDIRECTION FOR PLUS/PREMIUM
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
    const email = ((formData.get("email") as string) || "").trim().toLowerCase();

    if (!email) return { message: "Email is required", error: true };

    try {
        // 1. Generate a secure recovery link via Supabase Admin
        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email: email,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://trueserve.delivery'}/update-password`,
            }
        });

        if (error) {
            if (/user not found/i.test(error.message)) {
                return { message: "If an account exists for that email, a reset link has been sent.", success: true };
            }
            throw error;
        }

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

        return { message: "If an account exists for that email, a reset link has been sent.", success: true };
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
    const authCookiesToClear = ["userId", "admin_session", "admin_role"];
    
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

        const userId = cookieStore.get("userId")?.value;
        const adminSession = cookieStore.get("admin_session")?.value === "true";
        const adminRole = cookieStore.get("admin_role")?.value;
        console.log("[AuthSession] userId from cookie:", userId);

        let role = adminSession && adminRole ? adminRole : undefined;

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

                return { isAuth: true, userId: user.id, role: adminSession && adminRole ? adminRole : (publicUser?.role || 'CUSTOMER'), name: publicUser?.name || user.email, stripeAccountId: publicUser?.stripeAccountId };
            }
            return { isAuth: false };
        }

        // Try getting by ID first
        let { data: publicUser } = await supabaseAdmin
            .from('User')
            .select('role, name, stripeAccountId')
            .eq('id', userId)
            .maybeSingle();

        if (!role && publicUser?.role) {
            role = publicUser.role;
        } else if (!role) {
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
        
        const resolvedRole = role || publicUser?.role || 'CUSTOMER';

        console.log("[AuthSession] Result:", { isAuth: true, userId, role: resolvedRole, name: publicUser?.name, stripeAccountId: publicUser?.stripeAccountId });

        return { isAuth: true, userId, role: resolvedRole, name: publicUser?.name || 'User', stripeAccountId: publicUser?.stripeAccountId };
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

    cookieStore.set("preview_mode", "true", {
        path: "/",
        httpOnly: false,
        secure: false,
        maxAge: 60 * 60 * 12
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
