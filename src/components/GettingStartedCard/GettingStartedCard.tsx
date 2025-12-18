import { Alert, Card, Code, Stack, Text, Title } from '@mantine/core';

export function GettingStartedCard() {
	return (
		<Card withBorder p="lg">
			<Stack gap="sm">
				<Title order={3}>Getting Started</Title>
				<Text>
					This is your starting point. Edit <Code>src/routes/index.tsx</Code> to
					customize this page.
				</Text>
				<Alert color="blue" variant="light">
					Check the README.md for setup instructions and configuration options.
				</Alert>
			</Stack>
		</Card>
	);
}
