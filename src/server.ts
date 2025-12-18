import { withSentry } from '@sentry/cloudflare';
import handler, { createServerEntry } from '@tanstack/react-start/server-entry';
import { buildRequestContext } from './server/request-context';

// Create the base TanStack Start server entry
const startEntry = createServerEntry({
	async fetch(request, opts) {
		return handler.fetch(request, opts);
	},
});

// Wrap with Sentry for error tracking and performance monitoring
export default withSentry(
	(env: Env) => ({
		dsn: env.SENTRY_DSN,
		// Use CF_VERSION_METADATA for release tracking
		release: env.CF_VERSION_METADATA?.id,
		tracesSampleRate: 1.0,
		sendDefaultPii: true,
		// Enable console logging integration
		enableLogs: true,
	}),
	{
		async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
			// Build the request context with env and CF properties
			const context = await buildRequestContext(request, env);
			// Pass context to TanStack Start handler
			return startEntry.fetch(request, { context });
		},
	} satisfies ExportedHandler<Env>
);
