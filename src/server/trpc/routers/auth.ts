import type { TRPCRouterRecord } from '@trpc/server';

import { protectedProcedure } from '../instance';

/**
 * Auth router - add auth-related tRPC procedures here
 *
 * Note: Session fetching is handled by getSessionFn (createServerFn) in beforeLoad.
 * This router is for client-side auth procedures that need to be called after load.
 *
 * Example:
 * getProfile: protectedProcedure.query(async ({ ctx }) => {
 *   return ctx.user;
 * }),
 */
export const authRouter = {
	// Add auth-related procedures here
} satisfies TRPCRouterRecord;
