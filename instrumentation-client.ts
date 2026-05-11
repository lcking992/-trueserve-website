import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    capture_pageview: "history_change",
    capture_pageleave: true,
    person_profiles: "identified_only",
    defaults: "2025-05-24",
    loaded: (instance) => {
      if (process.env.NODE_ENV === "development") {
        instance.debug();
      }
    },
  });
}
