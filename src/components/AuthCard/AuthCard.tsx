import {
	Alert,
	Avatar,
	Button,
	Card,
	Group,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { useAuth } from '~/components/AuthContext';
import { signIn, signOut } from '~/server/auth/client';

export function AuthCard() {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	// Get session from AuthContext (populated by beforeLoad in __root.tsx)
	const { user, isAuthenticated } = useAuth();

	// Re-run the root `beforeLoad` (which calls `getSessionFn`) so the new
	// session shows up everywhere via context — no full page reload needed.
	const refreshSession = () => router.invalidate();

	const handleAnonymousLogin = async () => {
		setIsLoading(true);
		try {
			await signIn.anonymous();
			await refreshSession();
		} catch (error) {
			console.error('Anonymous sign in failed:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogout = async () => {
		setIsLoading(true);
		try {
			await signOut();
			await refreshSession();
		} catch (error) {
			console.error('Logout failed:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card withBorder p="lg">
			<Stack gap="sm">
				<Group justify="space-between">
					<Title order={3}>Authentication</Title>
				</Group>

				{isAuthenticated && user ? (
					<>
						<Group>
							<Avatar src={user.image} alt={user.name} radius="xl" size="lg" />
							<Stack gap={2}>
								<Text fw={500}>{user.name}</Text>
								<Text size="sm" c="dimmed">
									{user.email}
								</Text>
							</Stack>
						</Group>
						<Button
							variant="light"
							color="red"
							onClick={handleLogout}
							loading={isLoading}
						>
							Sign Out
						</Button>
					</>
				) : (
					<>
						<Text c="dimmed">Sign in to access protected features.</Text>
						<Button
							variant="light"
							onClick={handleAnonymousLogin}
							loading={isLoading}
						>
							Continue as guest
						</Button>
					</>
				)}

				<Alert color="cyan" variant="light">
					Uses Better Auth with D1 for user/session storage. Configure
					additional auth methods in <code>src/server/auth/index.ts</code>.
				</Alert>
			</Stack>
		</Card>
	);
}
