import { PostHog } from 'posthog-node';

let client: PostHog | null = null;

function getClient(): PostHog {
    if (!client) {
        client = new PostHog(
            process.env.NEXT_PUBLIC_POSTHOG_KEY!,
            { host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com' }
        );
    }
    return client;
}

export async function getFeatureFlag(
    flagKey: string,
    defaultValue: boolean = false,
    distinctId: string = 'system'
): Promise<boolean> {
    try {
        if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return defaultValue;
        const result = await getClient().isFeatureEnabled(flagKey, distinctId);
        return result ?? defaultValue;
    } catch {
        return defaultValue;
    }
}
