import type { TRPCRouterRecord } from '@trpc/server';
import type { RESTAPIPartialCurrentUserGuild } from 'discord-api-types/v10';

import { createAuth } from '~/server/auth';
import { getDiscordGuilds, getGuildIconUrl } from '~/server/auth/discord';
import { protectedProcedure } from '../instance';

/**
 * Auth router - handles Discord API data fetching
 *
 * Note: Session fetching is handled by getSessionFn (createServerFn) in beforeLoad.
 * This router only contains procedures that need to be called client-side.
 */
export const authRouter = {
	/**
	 * Get current user's Discord guilds (protected)
	 *
	 * Requires authentication. Fetches guilds using OAuth access token.
	 */
	getGuilds: protectedProcedure.query(async ({ ctx }) => {
		// Get access token from Better Auth
		const auth = createAuth(ctx.env);
		const tokenResponse = await auth.api.getAccessToken({
			body: {
				providerId: 'discord',
			},
			headers: ctx.headers,
		});

		if (!tokenResponse?.accessToken) {
			throw new Error('Failed to get Discord access token');
		}

		// Fetch guilds from Discord API
		const guilds = await getDiscordGuilds(tokenResponse.accessToken);

		// Add icon URLs and return
		return guilds.map(
			(guild): RESTAPIPartialCurrentUserGuild & { iconUrl: string | null } => ({
				...guild,
				iconUrl: getGuildIconUrl(guild),
			})
		);
	}),
} satisfies TRPCRouterRecord;
