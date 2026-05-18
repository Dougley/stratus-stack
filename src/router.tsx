import { nprogress } from '@mantine/nprogress';
import { QueryClient } from '@tanstack/react-query';
import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import SuperJSON from 'superjson';

import { makeTRPCClient, TRPCProvider } from '~/server/trpc/client';
import type { AppRouter } from '~/server/trpc/router';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

export function getRouter() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				// With SSR, we usually want to set some default staleTime
				// above 0 to avoid refetching immediately on the client
				staleTime: 60 * 1000,
			},
			// Use SuperJSON for proper serialization during SSR hydration
			dehydrate: { serializeData: SuperJSON.serialize },
			hydrate: { deserializeData: SuperJSON.deserialize },
		},
	});

	// Create isomorphic TRPC client (server: direct calls, client: HTTP)
	const trpcClient = makeTRPCClient();
	const trpc = createTRPCOptionsProxy<AppRouter>({
		client: trpcClient,
		queryClient,
	});

	const router = createTanStackRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreload: 'intent',
		context: {
			trpc,
			queryClient,
		},
		defaultPendingComponent: () => <div>Loading...</div>,
		Wrap: function WrapComponent({ children }) {
			return (
				<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
					{children}
				</TRPCProvider>
			);
		},
	});

	// Setup SSR query integration for proper hydration
	setupRouterSsrQueryIntegration({
		router,
		queryClient,
	});

	// Wire Mantine's NavigationProgress to TanStack Router navigation events.
	// `import.meta.env.SSR` is statically replaced by Vite so the SSR bundle
	// tree-shakes both this and the Sentry block below — important because
	// `Sentry.replayIntegration` doesn't exist in `@sentry/tanstackstart-react`'s
	// server entry and would otherwise produce an `IMPORT_IS_UNDEFINED` warning.
	if (!import.meta.env.SSR) {
		router.subscribe('onBeforeLoad', ({ pathChanged }) => {
			if (pathChanged) nprogress.start();
		});
		router.subscribe('onResolved', () => nprogress.complete());

		// Browser-only Sentry initialization. Loaded via dynamic `import()` so
		// the SSR bundle never sees `replayIntegration` (which is exported only
		// by the package's `browser` condition).
		void import('@sentry/tanstackstart-react').then((Sentry) => {
			Sentry.init({
				dsn: import.meta.env.VITE_SENTRY_DSN,

				// Adds request headers and IP for users
				sendDefaultPii: true,

				integrations: [
					Sentry.tanstackRouterBrowserTracingIntegration(router),
					Sentry.replayIntegration({
						maskAllText: true,
						blockAllMedia: true,
					}),
				],

				// Enable logs to be sent to Sentry
				// (`_experiments.enableLogs` was removed in @sentry/* v10 — use top-level)
				enableLogs: true,

				// Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing
				// We recommend adjusting this value in production
				tracesSampleRate: 1.0,

				// Capture Replay for 10% of all sessions,
				// plus for 100% of sessions with an error
				replaysSessionSampleRate: 0.1,
				replaysOnErrorSampleRate: 1.0,
			});
		});
	}

	return router;
}

// Register the router instance for type safety
declare module '@tanstack/react-router' {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
