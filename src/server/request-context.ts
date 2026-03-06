export type RequestContext = {
	cf?: IncomingRequestCfProperties | null;
	nonce?: string; // Required by TanStack Start BaseContext
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
