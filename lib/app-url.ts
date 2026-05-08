export function getAppBaseUrl() {
    const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
    const normalized = configured?.replace(/\/+$/, "");
    const configuredIsVercelPreview = normalized?.includes(".vercel.app");

    if (process.env.VERCEL_ENV === "production" && (!normalized || configuredIsVercelPreview)) {
        return "https://trueserve.delivery";
    }

    if (normalized) return normalized;

    const vercelUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
    if (vercelUrl) {
        const host = vercelUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "");
        return `https://${host}`;
    }

    return "https://trueserve.delivery";
}
