/**
 * Environment variable augmentation for Better Auth secrets
 *
 * These are added via `wrangler secret put` and don't appear in the
 * auto-generated worker-configuration.d.ts
 */
declare namespace Cloudflare {
	interface Env {
		// Better Auth secrets
		BETTER_AUTH_SECRET: string;
		BETTER_AUTH_URL?: string;

		// Discord OAuth secrets
		DISCORD_CLIENT_ID: string;
		DISCORD_CLIENT_SECRET: string;

		// Sentry (optional)
		SENTRY_DSN?: string;

		// KV namespace for Better Auth secondary storage (sessions, rate limits)
		// Created via: wrangler kv namespace create AUTH_KV
		AUTH_KV: KVNamespace;
	}
}
