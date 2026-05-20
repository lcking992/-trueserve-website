import type { AppRole } from "./rbac";

export const ADMIN_EMAILS = [
    "lcking992@gmail.com",
    "leonking@trueservedelivery.com",
    "leon@trueservedelivery.com",
    "admin@true-serve.com",
    "admin@trueserve.com",
    "eric.mcduffie@thetieredconsulting.com",
    "ericmcduffie7@gmail.com",
    "providantconsulting@gmail.com"
];

export const STAFF_DISPLAY_NAMES: Partial<Record<string, string>> = {
    "lcking992@gmail.com": "Leon",
    "leonking@trueservedelivery.com": "Leon",
    "leon@trueservedelivery.com": "Leon",
    "admin@true-serve.com": "Eric",
    "admin@trueserve.com": "Eric",
    "eric.mcduffie@thetieredconsulting.com": "Eric",
    "ericmcduffie7@gmail.com": "Eric",
    "providantconsulting@gmail.com": "Ronni / Providant Consulting",
};

export const STAFF_ROLE_BY_EMAIL: Partial<Record<string, AppRole>> = {
    "lcking992@gmail.com": "ADMIN",
    "leonking@trueservedelivery.com": "ADMIN",
    "leon@trueservedelivery.com": "ADMIN",
    "admin@true-serve.com": "ADMIN",
    "admin@trueserve.com": "ADMIN",
    "eric.mcduffie@thetieredconsulting.com": "ADMIN",
    "ericmcduffie7@gmail.com": "ADMIN",
    "providantconsulting@gmail.com": "OPS",
};

export const getStaffDisplayName = (email?: string, fallback?: string) => {
    if (!email) return fallback || "Staff";
    const lowerEmail = email.trim().toLowerCase();
    return STAFF_DISPLAY_NAMES[lowerEmail] || fallback || lowerEmail.split("@")[0] || "Staff";
};

export const resolveStaffRole = (email?: string): AppRole | undefined => {
    if (!email) return undefined;
    const lowerEmail = email.trim().toLowerCase();
    return STAFF_ROLE_BY_EMAIL[lowerEmail] || (isStaffEmail(lowerEmail) ? "READONLY" : undefined);
};

export const isStaffEmail = (email?: string) => {
    if (!email) return false;
    const lowerEmail = email.toLowerCase();
    return ADMIN_EMAILS.includes(lowerEmail) || 
           lowerEmail.endsWith("@trueservedelivery.com") ||
           lowerEmail.endsWith("@thetieredconsulting.com") ||
           lowerEmail.endsWith("@true-serve.com");
};

export const getAdminNotificationEmails = () => {
    const envEmails = [
        process.env.ADMIN_EMAIL,
        process.env.SUPPORT_EMAIL,
        process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
        process.env.ADMIN_NOTIFICATION_EMAIL,
        process.env.ADMIN_NOTIFICATION_EMAILS,
    ]
        .filter(Boolean)
        .flatMap((value) => String(value).split(/[,\s;]+/))
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);

    return Array.from(new Set([...ADMIN_EMAILS, ...envEmails]));
};
