/**
 * Server-side session management using TanStack Start's createServerFn
 *
 * See: https://www.better-auth.com/docs/integrations/tanstack
 */

import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';

import { createAuth } from './index';

export interface SessionUser {
	id: string;
	name: string;
	email: string;
	image: string | null;
}

export interface SessionData {
	session: {
		token: string;
		expiresAt: Date;
	};
	user: SessionUser;
}

/**
 * Get the current session during SSR.
 * Returns null if not authenticated.
 *
 * @example
 * ```tsx
 * // In __root.tsx beforeLoad
 * beforeLoad: async () => {
 *   const session = await getSessionFn();
 *   return { session };
 * }
 * ```
 */
export const getSessionFn = createServerFn({ method: 'GET' }).handler(
	async (): Promise<SessionData | null> => {
		const headers = new Headers(getRequestHeaders());
		const sessionData = await createAuth().api.getSession({ headers });

		if (!sessionData?.session || !sessionData?.user) {
			return null;
		}

		return {
			session: {
				token: sessionData.session.token,
				expiresAt: sessionData.session.expiresAt,
			},
			user: {
				id: sessionData.user.id,
				name: sessionData.user.name,
				email: sessionData.user.email,
				image: sessionData.user.image ?? null,
			},
		};
	}
);

/**
 * Get the current session, throwing if not authenticated.
 * Use this in server functions that require authentication.
 *
 * @example
 * ```ts
 * export const myProtectedFn = createServerFn().handler(async () => {
 *   const session = await ensureSessionFn();
 *   // session.user is guaranteed non-null
 * });
 * ```
 */
export const ensureSessionFn = createServerFn({ method: 'GET' }).handler(
	async (): Promise<SessionData> => {
		const headers = new Headers(getRequestHeaders());
		const sessionData = await createAuth().api.getSession({ headers });

		if (!sessionData?.session || !sessionData?.user) {
			throw new Error('Unauthorized');
		}

		return {
			session: {
				token: sessionData.session.token,
				expiresAt: sessionData.session.expiresAt,
			},
			user: {
				id: sessionData.user.id,
				name: sessionData.user.name,
				email: sessionData.user.email,
				image: sessionData.user.image ?? null,
			},
		};
	}
);
