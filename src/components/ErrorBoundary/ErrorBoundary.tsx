import { Box, Button, Card, Container, Flex, Group, Text } from '@mantine/core';
import {
	IconAlertTriangle,
	IconArrowLeft,
	IconExclamationMark,
	IconFileUnknown,
	IconLockX,
	IconMoodSad,
	IconRefresh,
} from '@tabler/icons-react';
import { useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

interface ErrorDetails {
	icon: React.ReactNode;
	title: string;
	message: React.ReactNode;
	showRetry?: boolean;
	retryLabel?: string;
}

const HTTP_ERROR_DETAILS: Record<number, ErrorDetails> = {
	401: {
		icon: <IconLockX size={48} />,
		title: '401 Unauthorized',
		message: "You're not authorized to view this page. Are you logged in?",
		showRetry: true,
		retryLabel: 'Login',
	},
	403: {
		icon: <IconAlertTriangle size={48} />,
		title: '403 Forbidden',
		message: "You don't have permission to access this page.",
	},
	404: {
		icon: <IconFileUnknown size={48} />,
		title: '404 Not Found',
		message: "This page doesn't exist. Did you get lost?",
	},
};

function getErrorDetails(error: Error): ErrorDetails {
	// Check if it's an HTTP-like error with status code
	const statusMatch = error.message.match(/^(\d{3})/);
	if (statusMatch) {
		const status = Number.parseInt(statusMatch[1], 10);
		const details = HTTP_ERROR_DETAILS[status];
		if (details) {
			return details;
		}
		return {
			icon: <IconExclamationMark size={48} />,
			title: `${status} Error`,
			message: error.message,
		};
	}

	// Generic error
	return {
		icon: <IconMoodSad size={64} color="#fa5252" />,
		title: 'Something went wrong',
		message: 'This error is on our end. Please try again later.',
	};
}

export interface RootErrorComponentProps {
	error: Error;
	reset?: () => void;
}

export function RootErrorComponent({ error, reset }: RootErrorComponentProps) {
	const router = useRouter();
	const [eventId, setEventId] = useState<string | null>(null);
	const details = getErrorDetails(error);
	const isServerError = !error.message.match(/^(4\d{2})/); // Not a 4xx error

	useEffect(() => {
		// Only capture unexpected errors to Sentry (not 4xx client errors)
		// Dynamically import Sentry to avoid SSR issues
		if (isServerError && !eventId && typeof window !== 'undefined') {
			import('@sentry/tanstackstart-react').then((Sentry) => {
				const id = Sentry.captureException(error);
				setEventId(id);
			});
		}
	}, [error, eventId, isServerError]);

	const handleGoBack = () => {
		router.history.back();
	};

	const handleRetry = () => {
		if (reset) {
			reset();
		} else {
			router.invalidate();
		}
	};

	if (isServerError) {
		return (
			<Box>
				<Flex justify="center" align="center" h="100vh">
					<Card
						withBorder
						shadow="0 0 0 2px #fa5252, 0 8px 32px rgba(250,82,82,0.08)"
						p="md"
					>
						<Flex direction="column" align="center" gap="sm">
							{details.icon}
							<Text fw={900} fz="h2" ta="center" c="red.7">
								500 Internal Server Error
							</Text>
							<Text ta="center">{details.message}</Text>
							{eventId && (
								<Text ta="center" c="dimmed" size="xs">
									Error reference: <code>{eventId}</code>
								</Text>
							)}
							<Group gap="sm" justify="center">
								<Button
									leftSection={<IconArrowLeft />}
									variant="default"
									onClick={handleGoBack}
								>
									Go back
								</Button>
								<Button leftSection={<IconRefresh />} onClick={handleRetry}>
									Try again
								</Button>
							</Group>
						</Flex>
					</Card>
				</Flex>
			</Box>
		);
	}

	return (
		<Container>
			<Flex justify="center" align="center" h="100vh">
				<Card withBorder shadow="md" p="md">
					<Flex direction="column" align="center" gap="sm">
						{details.icon}
						<Text fw={900} fz="h2" ta="center">
							{details.title}
						</Text>
						<Text ta="center">{details.message}</Text>
						<Group gap="sm" justify="center">
							<Button
								leftSection={<IconArrowLeft />}
								variant="default"
								onClick={handleGoBack}
							>
								Go back
							</Button>
							{details.showRetry && (
								<Button leftSection={<IconRefresh />} onClick={handleRetry}>
									{details.retryLabel || 'Retry'}
								</Button>
							)}
						</Group>
					</Flex>
				</Card>
			</Flex>
		</Container>
	);
}
