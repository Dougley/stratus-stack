import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

import { createTRPCRouter } from '~/server/trpc/instance';

import { authRouter } from './routers/auth';
import { exampleRouter } from './routers/example';
import { notesRouter } from './routers/notes';

/**
 * Main app router - composes all sub-routers
 * Procedures are namespaced: example.hello, auth.getGuilds, etc.
 */
export const appRouter = createTRPCRouter({
	auth: authRouter,
	example: exampleRouter,
	notes: notesRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Inference helpers for input types
 * @example
 * type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example
 * type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
