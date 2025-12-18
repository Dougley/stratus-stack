import type { TRPCRouterRecord } from '@trpc/server';
import { z } from 'zod';

import { publicProcedure } from '~/server/trpc/instance';

/**
 * Example router - demonstrates tRPC patterns
 *
 * Replace this with your own routers as needed.
 */
export const exampleRouter = {
	/**
	 * Simple hello query with input validation
	 */
	hello: publicProcedure
		.input(
			z.object({
				name: z.string().min(1).max(100),
			})
		)
		.query(({ input }) => {
			return {
				greeting: `Hello, ${input.name}!`,
				timestamp: new Date().toISOString(),
			};
		}),

	/**
	 * Get server time - useful for testing SSR vs client fetch
	 */
	getServerTime: publicProcedure.query(() => {
		return {
			time: new Date().toISOString(),
			random: Math.random().toString(36).substring(7),
		};
	}),
} satisfies TRPCRouterRecord;
