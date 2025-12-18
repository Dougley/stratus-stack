import { Container, Stack, Text, Title } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { AuthCard } from '~/components/AuthCard';
import { GettingStartedCard } from '~/components/GettingStartedCard';
import { NotesCard } from '~/components/NotesCard';

export const Route = createFileRoute('/')({
	component: LandingPage,
});

function LandingPage() {
	return (
		<Container size="md" py="xl">
			<Stack gap="xl">
				<Title order={1} ta="center">
					Stratus Stack
				</Title>
				<Text c="dimmed" ta="center">
					TanStack Start + tRPC + Better Auth + Cloudflare Workers
				</Text>

				<AuthCard />

				<NotesCard />

				<GettingStartedCard />
			</Stack>
		</Container>
	);
}
