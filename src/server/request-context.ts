/**
 * Per-request context that gets passed from the worker entry (`server.ts`)
 * into TanStack Start's `handler.fetch`. Anything we want to read inside
 * routes/middleware that isn't already on the `Request` itself goes here.
 *
 * Note: `nonce` is technically owned by TanStack Start's internal `BaseContext`
 * (the framework injects it for CSP), but it must be declared here so the
 * structural intersection at the `handler.fetch` call site type-checks.
 */
export type RequestContext = {
	cf?: IncomingRequestCfProperties | null;
	nonce?: string;
};

// Register the context type with TanStack Start
declare module '@tanstack/react-start' {
	interface Register {
		server: {
			requestContext: RequestContext;
		};
	}
}

export const buildRequestContext = (request: Request): RequestContext => {
	const cf = (request as Request & { cf?: IncomingRequestCfProperties }).cf;
	return { cf: cf ?? null };
};
