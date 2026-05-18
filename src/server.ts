import { withSentry } from '@sentry/cloudflare';
import handler, { createServerEntry } from '@tanstack/react-start/server-entry';
import { buildRequestContext } from './server/request-context';

// Create the base TanStack Start server entry
const startEntry = createServerEntry({
	async fetch(request, opts) {
		return handler.fetch(request, opts);
	},
});

// Wrap with Sentry for error tracking and performance monitoring.
// We use `Cloudflare.Env` (declaration-merged in env.d.ts + wrangler types)
// rather than the global `Env` so user-augmented secrets are visible.
export default withSentry(
	(env: Cloudflare.Env) => ({
		dsn: env.SENTRY_DSN,
		// Use CF_VERSION_METADATA for release tracking
		release: env.CF_VERSION_METADATA?.id,
		tracesSampleRate: 1.0,
		sendDefaultPii: true,
		// Enable console logging integration
		enableLogs: true,
	}),
	{
		async fetch(
			request: Request,
			_env: Cloudflare.Env,
			_ctx: ExecutionContext
		) {
			return startEntry.fetch(request, {
				context: buildRequestContext(request),
			});
		},
	} satisfies ExportedHandler<Cloudflare.Env>
);
