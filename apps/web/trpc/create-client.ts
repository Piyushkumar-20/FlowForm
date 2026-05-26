import { httpLink, httpBatchStreamLink } from "@repo/trpc/client";

interface CreateTRPCHttpBatchClientClientOpts {
  enableStreaming?: boolean;
  url?: string;
}

export const createTRPCHttpBatchClientClient = (opts?: CreateTRPCHttpBatchClientClientOpts) => {
  const c = opts?.enableStreaming ? httpBatchStreamLink : httpLink;
  return c({
    // Browser: use relative path — Next.js rewrite proxies to the API (no CORS).
    // Server-side callers pass an explicit absolute url.
    url: opts?.url ?? "/trpc",
    fetch(url, options) {
      return fetch(url, {
        ...options,
        credentials: "include",
      });
    },
  });
};
