import { highlightMiddleware } from "@highlight-run/next/server";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerHighlight } = await import("@highlight-run/next/server");
    registerHighlight({
      projectID: process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID!,
      serviceName: "trueserve-backend",
    });
  }
}

export { highlightMiddleware as onRequestError };
