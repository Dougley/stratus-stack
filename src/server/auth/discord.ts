/**
 * Discord API utilities for fetching user data using OAuth access tokens
 *
 * Note: Access tokens are NOT stored in cookies. Use authClient.getAccessToken()
 * to get a fresh token when needed (auto-refreshes if expired).
 */

import {
	type APIUser,
	CDNRoutes,
	ImageFormat,
	type RESTAPIPartialCurrentUserGuild,
	type RESTGetAPICurrentUserGuildsResult,
	type RESTGetAPICurrentUserResult,
} from 'discord-api-types/v10';

const DISCORD_API_BASE = 'https://discord.com/api/v10';
const DISCORD_CDN_BASE = 'https://cdn.discordapp.com';

/**
 * Fetch the user's Discord guilds (servers)
 * Requires the "guilds" scope in OAuth
 */
export async function getDiscordGuilds(
	accessToken: string
): Promise<RESTGetAPICurrentUserGuildsResult> {
	const response = await fetch(`${DISCORD_API_BASE}/users/@me/guilds`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(
			`Failed to fetch Discord guilds: ${response.status} ${error}`
		);
	}

	return response.json();
}

/**
 * Fetch the current Discord user
 * Requires the "identify" scope in OAuth
 */
export async function getDiscordUser(
	accessToken: string
): Promise<RESTGetAPICurrentUserResult> {
	const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(
			`Failed to fetch Discord user: ${response.status} ${error}`
		);
	}

	return response.json();
}

/**
 * Generate Discord avatar URL for a user
 * @see https://discord.com/developers/docs/reference#image-formatting-cdn-endpoints
 */
export function getUserAvatarUrl(
	user: Pick<APIUser, 'id' | 'avatar' | 'discriminator'>,
	size: number = 128
): string {
	if (user.avatar) {
		const format = user.avatar.startsWith('a_')
			? ImageFormat.GIF
			: ImageFormat.PNG;
		return `${DISCORD_CDN_BASE}${CDNRoutes.userAvatar(user.id, user.avatar, format)}?size=${size}`;
	}

	// Default avatar based on discriminator or user ID
	const index =
		user.discriminator && user.discriminator !== '0'
			? Number.parseInt(user.discriminator, 10) % 5
			: Number((BigInt(user.id) >> BigInt(22)) % BigInt(6));

	return `${DISCORD_CDN_BASE}${CDNRoutes.defaultUserAvatar(index as 0 | 1 | 2 | 3 | 4 | 5)}`;
}

/**
 * Generate Discord guild icon URL
 * @see https://discord.com/developers/docs/reference#image-formatting-cdn-endpoints
 */
export function getGuildIconUrl(
	guild: Pick<RESTAPIPartialCurrentUserGuild, 'id' | 'icon'>,
	size: number = 128
): string | null {
	if (!guild.icon) return null;

	const format = guild.icon.startsWith('a_')
		? ImageFormat.GIF
		: ImageFormat.PNG;
	return `${DISCORD_CDN_BASE}${CDNRoutes.guildIcon(guild.id, guild.icon, format)}?size=${size}`;
}
