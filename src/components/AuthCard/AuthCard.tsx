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
import { useState } from 'react';
import { useAuth } from '~/components/AuthContext';
import { signIn, signOut } from '~/server/auth/client';

export function AuthCard() {
	const [isLoading, setIsLoading] = useState(false);

	// Get session from AuthContext (populated by beforeLoad in __root.tsx)
	const { user, isAuthenticated } = useAuth();

	const handleAnonymousLogin = async () => {
		setIsLoading(true);
		try {
			await signIn.anonymous();
			window.location.href = '/';
		} catch (error) {
			console.error('Anonymous sign in failed:', error);
			setIsLoading(false);
		}
	};

	const handleLogout = async () => {
		setIsLoading(true);
		try {
			await signOut();
			window.location.href = '/';
		} catch (error) {
			console.error('Logout failed:', error);
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
