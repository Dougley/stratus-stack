import type { Session, User } from 'better-auth';

import type { Database } from '~/server/db';
import type { RequestContext } from '~/server/request-context';

/**
 * TRPC Context type
 *
 * Contains:
 * - cf: Cloudflare request properties (geolocation, etc.)
 * - session: Better Auth session (null if not authenticated)
 * - user: Better Auth user (null if not authenticated)
 * - headers: Request headers for server-side auth API calls
 * - db: Drizzle ORM database instance
 */
export type TRPCContext = RequestContext & {
	session: Session | null;
	user: User | null;
	headers: Headers;
	db: Database;
};

export const createTRPCContext = (
	ctx: RequestContext,
	session: Session | null,
	user: User | null,
	headers: Headers,
	db: Database
): TRPCContext => ({
	...ctx,
	session,
	user,
	headers,
	db,
});
