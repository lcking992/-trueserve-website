"use client";

import { useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import posthog from "posthog-js";

import { createClient } from "@/lib/supabase/client";

function identifyUser(user: User) {
  posthog.identify(user.id, {
    email: user.email,
    phone: user.phone,
  });
}

export default function PostHogAuthSync() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      return;
    }

    const supabase = createClient();

    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        identifyUser(data.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        posthog.reset();
        return;
      }

      if (session?.user) {
        identifyUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
