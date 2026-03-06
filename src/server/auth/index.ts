import { env } from 'cloudflare:workers';
import { getRequest } from '@tanstack/react-start/server';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { anonymous } from 'better-auth/plugins';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { withCloudflare } from 'better-auth-cloudflare';
import { createDb } from '~/server/db';

/**
 * Better Auth configuration with Cloudflare D1 + KV
 *
 * - D1: primary storage for users, sessions, accounts
 * - KV: secondary storage for rate limiting
 * - anonymous plugin: sign in without credentials (demo / onboarding)
 * - TanStack Start cookie plugin must be last
 *
 * To add authentication methods, uncomment or add options below.
 * See: https://www.better-auth.com/docs/authentication/email-password
 */
export function createAuth() {
	const db = createDb();
	const request = getRequest();
	const cf = (request as Request & { cf?: IncomingRequestCfProperties }).cf;

	return betterAuth({
		...withCloudflare(
			{
				kv: env.AUTH_KV,
				cf: cf ?? undefined,
				autoDetectIpAddress: true,
				geolocationTracking: true,
				d1: {
					// biome-ignore lint/suspicious/noExplicitAny: withCloudflare expects a generic DrizzleD1Database
					db: db as any,
					options: { usePlural: true },
				},
			},
			{
				secret: env.BETTER_AUTH_SECRET,
				baseURL: env.BETTER_AUTH_URL,
				trustedOrigins: env.BETTER_AUTH_URL ? [env.BETTER_AUTH_URL] : [],

				// Add authentication methods here.
				// Example: email and password
				// emailAndPassword: { enabled: true },

				// Example: social providers
				// socialProviders: {
				// 	github: {
				// 		clientId: env.GITHUB_CLIENT_ID,
				// 		clientSecret: env.GITHUB_CLIENT_SECRET,
				// 	},
				// },

				// Rate limiting via KV - window must be >= 60s (KV minimum TTL)
				rateLimit: {
					enabled: true,
					storage: 'secondary-storage',
					window: 60,
					max: 100,
				},

				// TanStack Start cookie plugin must be LAST
				plugins: [anonymous(), tanstackStartCookies()],
			}
		),
	});
}

/**
 * Static export for better-auth CLI schema generation.
 * Run: pnpm dlx @better-auth/cli generate
 * (plain betterAuth - no withCloudflare which requires CF context at import time)
 */
export const auth = betterAuth({
	plugins: [anonymous()],
	database: drizzleAdapter(
		{},
		{
			provider: 'sqlite',
			usePlural: true,
		}
	),
});

export type Auth = ReturnType<typeof createAuth>;
