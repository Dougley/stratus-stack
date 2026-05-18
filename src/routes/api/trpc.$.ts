import * as Sentry from '@sentry/cloudflare';
import { createFileRoute } from '@tanstack/react-router';
import { createMiddleware } from '@tanstack/react-start';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import type { RequestContext } from '~/server/request-context';
import { createTRPCContext } from '~/server/trpc/context';
import { appRouter } from '~/server/trpc/router';

/**
 * tRPC HTTP handler — delegates context construction to `createTRPCContext`
 * so the same shape is produced regardless of whether procedures are invoked
 * via HTTP here or via `unstable_localLink` during SSR.
 */
const handleRequest = (request: Request, ctx: RequestContext) =>
	fetchRequestHandler({
		endpoint: '/api/trpc',
		req: request,
		router: appRouter,
		createContext: () =>
			createTRPCContext({
				headers: request.headers,
				cf: ctx.cf ?? null,
			}),
		onError: ({ path, error }) => {
			console.error(`tRPC failed on ${path ?? '<no-path>'}:`, error);
			Sentry.captureException(error, { extra: { path } });
		},
	});

const requestContextMiddleware = createMiddleware({ type: 'request' }).server(
	async ({ next, request }) => {
		const cf = (request as Request & { cf?: IncomingRequestCfProperties }).cf;
		return next({
			context: { cf: cf ?? null } satisfies RequestContext,
		});
	}
);

export const Route = createFileRoute('/api/trpc/$')({
	server: {
		middleware: [requestContextMiddleware],
		handlers: {
			GET: async ({ request, context }) => handleRequest(request, context),
			POST: async ({ request, context }) => handleRequest(request, context),
		},
	},
});
