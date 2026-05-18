import type { Session, User } from 'better-auth';

import { createAuth } from '~/server/auth';
import { createDb, type Database } from '~/server/db';
import type { RequestContext } from '~/server/request-context';

/**
 * tRPC Context type
 *
 * Contains:
 * - cf: Cloudflare request properties (geolocation, etc.) — `null` when running
 *   outside a Cloudflare worker (e.g. tests).
 * - session/user: Better Auth session, both `null` if not authenticated.
 * - headers: the original Request headers (escape hatch for procedures that
 *   need to read e.g. `Accept-Language`, do downstream auth, etc.)
 * - db: Drizzle ORM database instance.
 */
export type TRPCContext = RequestContext & {
	session: Session | null;
	user: User | null;
	headers: Headers;
	db: Database;
};

/**
 * Build the tRPC context from the inputs available at request time.
 *
 * Both call sites — the HTTP route handler (`/api/trpc/$`) and the
 * server-side `unstable_localLink` (used during SSR) — funnel through this
 * function. That keeps the session-fetching logic in one place and ensures
 * procedures see an identical context regardless of how they were invoked.
 */
export const createTRPCContext = async (opts: {
	headers: Headers;
	cf: IncomingRequestCfProperties | null;
}): Promise<TRPCContext> => {
	const sessionData = await createAuth().api.getSession({
		headers: opts.headers,
	});

	return {
		cf: opts.cf,
		session: sessionData?.session ?? null,
		user: sessionData?.user ?? null,
		headers: opts.headers,
		db: createDb(),
	};
};
