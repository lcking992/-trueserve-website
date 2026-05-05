'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function PageviewTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (pathname) {
            posthog.capture('$pageview', {
                $current_url: window.location.href,
            });
        }
    }, [pathname, searchParams]);

    return null;
}

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
    const initialised = useRef(false);

    useEffect(() => {
        if (initialised.current) return;
        initialised.current = true;

        const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
        if (!key) return;

        posthog.init(key, {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
            person_profiles: 'identified_only',
            capture_pageview: false,   // handled by PageviewTracker
            capture_pageleave: true,
            session_recording: {
                maskAllInputs: false,
                maskInputOptions: { password: true },
            },
        });
    }, []);

    return (
        <PHProvider client={posthog}>
            <PageviewTracker />
            {children}
        </PHProvider>
    );
}
