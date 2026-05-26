import type { ServerRouter } from "@repo/trpc/client";
import { createTRPCProxyClient } from "@repo/trpc/client";
import { createTRPCHttpBatchClientClient } from "~/trpc/create-client";

// Server-side client must use an absolute URL — relative paths don't resolve in Node.js.
const API_URL = process.env.API_URL ?? "http://localhost:8000";

export const api = createTRPCProxyClient<ServerRouter>({
  links: [createTRPCHttpBatchClientClient({ url: `${API_URL}/trpc` })],
});

export const apiStreaming = createTRPCProxyClient<ServerRouter>({
  links: [createTRPCHttpBatchClientClient({ enableStreaming: true, url: `${API_URL}/trpc` })],
});
