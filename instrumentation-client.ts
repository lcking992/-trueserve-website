import { H } from "@highlight-run/next/client";

H.init(process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID!, {
  serviceName: "trueserve-frontend",
  tracingOrigins: true,
  networkRecording: {
    enabled: true,
    recordHeadersAndBody: true,
  },
});
