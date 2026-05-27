import { httpLink, httpBatchStreamLink } from "@repo/trpc/client";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};

interface CreateTRPCHttpBatchClientClientOpts {
  enableStreaming?: boolean;
  url?: string;
}

export const createTRPCHttpBatchClientClient = (opts?: CreateTRPCHttpBatchClientClientOpts) => {
  const c = opts?.enableStreaming ? httpBatchStreamLink : httpLink;
  return c({
    // Browser: getBaseUrl() returns "" so this becomes a relative /api/trpc path
    // that Next.js rewrites to the Express API (no CORS).
    // Server-side callers pass an explicit absolute url.
    url: opts?.url ?? `${getBaseUrl()}/api/trpc`,
    fetch(url, options) {
      return fetch(url, {
        ...options,
        credentials: "include",
      });
    },
  });
};
