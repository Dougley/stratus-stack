import { createFileRoute } from '@tanstack/react-router';

import { createAuth } from '~/server/auth';

/**
 * Better Auth API route handler for TanStack Start
 *
 * Handles all auth routes under /api/auth/*
 * See: https://www.better-auth.com/docs/integrations/tanstack
 */
export const Route = createFileRoute('/api/auth/$')({
	server: {
		handlers: {
			GET: ({ request }) => createAuth().handler(request),
			POST: ({ request }) => createAuth().handler(request),
		},
	},
});
