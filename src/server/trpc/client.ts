import { createIsomorphicFn } from '@tanstack/react-start';
import { getRequest, getRequestHeaders } from '@tanstack/react-start/server';
import {
	createTRPCClient,
	httpBatchStreamLink,
	loggerLink,
	unstable_localLink,
} from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import superjson from 'superjson';

import { createTRPCContext as createServerContext } from './context';
import type { AppRouter } from './router';
import { appRouter } from './router';

/**
 * Creates an isomorphic TRPC client that:
 * - On the server: uses `unstable_localLink` to call the router directly (no HTTP)
 * - On the client: uses `httpBatchStreamLink` to make HTTP requests to /api/trpc
 *
 * This pattern is essential for Cloudflare Workers where the server cannot
 * make HTTP requests back to itself during SSR.
 */
export const makeTRPCClient = createIsomorphicFn()
	.server(() => {
		return createTRPCClient<AppRouter>({
			links: [
				unstable_localLink({
					router: appRouter,
					transformer: superjson,
					createContext: async () => {
						const headers = new Headers(getRequestHeaders());
						headers.set('x-trpc-source', 'tanstack-start-server');

						// Pull Cloudflare request properties off the current Request
						// so server-side SSR calls see the same `cf` data that HTTP
						// calls do via the route's request middleware.
						const cf =
							(
								getRequest() as Request & {
									cf?: IncomingRequestCfProperties;
								}
							).cf ?? null;

						return createServerContext({ headers, cf });
					},
				}),
			],
		});
	})
	.client(() => {
		return createTRPCClient<AppRouter>({
			links: [
				loggerLink({
					enabled: (op) =>
						import.meta.env.DEV ||
						(op.direction === 'down' && op.result instanceof Error),
				}),
				httpBatchStreamLink({
					transformer: superjson,
					// Same-origin relative URL — cookies are sent by default, so we
					// don't need a custom `fetch` with `credentials: 'include'`.
					url: '/api/trpc',
					headers() {
						const headers = new Headers();
						headers.set('x-trpc-source', 'tanstack-start-client');
						return headers;
					},
				}),
			],
		});
	});

// Re-export the TRPC context hook and provider for use in components.
//
// `useTRPCClient` is included so components can fall back to imperative,
// outside-of-react-query calls when needed (e.g. in event handlers):
//
//     const trpcClient = useTRPCClient();
//     const data = await trpcClient.notes.list.query();
export const { useTRPC, useTRPCClient, TRPCProvider } =
	createTRPCContext<AppRouter>();
