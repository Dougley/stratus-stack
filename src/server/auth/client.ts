import { anonymousClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth client for React
 *
 * Provides hooks and methods for authentication:
 * - useSession() - Access reactive session data
 * - signIn.anonymous() - Sign in without credentials (demo / onboarding)
 * - signIn.social() - Initiate OAuth flow
 * - signOut() - End session
 */
export const authClient = createAuthClient({
	plugins: [anonymousClient()],
});

// Re-export commonly used hooks and methods
export const { useSession, signIn, signOut } = authClient;
