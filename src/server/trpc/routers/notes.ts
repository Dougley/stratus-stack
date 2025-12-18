import type { TRPCRouterRecord } from '@trpc/server';
import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { notes } from '~/server/db/schema';
import { publicProcedure } from '~/server/trpc/instance';

/**
 * Notes router - demonstrates Drizzle ORM usage with tRPC
 *
 * Important: Database access should only happen through tRPC procedures,
 * not during SSR. This keeps the database layer isolated to the API.
 */
export const notesRouter = {
	/**
	 * Get all notes
	 */
	list: publicProcedure.query(async ({ ctx }) => {
		const result = await ctx.db
			.select()
			.from(notes)
			.orderBy(desc(notes.createdAt));
		return result;
	}),

	/**
	 * Create a new note
	 */
	create: publicProcedure
		.input(
			z.object({
				content: z.string().min(1).max(500),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const result = await ctx.db
				.insert(notes)
				.values({ content: input.content })
				.returning();
			return result[0];
		}),

	/**
	 * Delete a note by ID
	 */
	delete: publicProcedure
		.input(
			z.object({
				id: z.number(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db.delete(notes).where(eq(notes.id, input.id));
			return { success: true };
		}),
} satisfies TRPCRouterRecord;
