/// <reference types="vite/client" />

import {
	AppShell,
	ColorSchemeScript,
	createTheme,
	DEFAULT_THEME,
	MantineProvider,
	mantineHtmlProps,
	mergeMantineTheme,
} from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { NavigationProgress } from '@mantine/nprogress';
import { TanStackDevtools } from '@tanstack/react-devtools';
import type { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query';
import type * as React from 'react';
import { AuthProvider } from '~/components/AuthContext';
import { RootErrorComponent } from '~/components/ErrorBoundary/ErrorBoundary';
import { getSessionFn, type SessionData } from '~/server/auth/session';
import type { AppRouter } from '~/server/trpc/router';
import appCss from '~/styles/app.css?url';

const theme = mergeMantineTheme(
	DEFAULT_THEME,
	createTheme({
		fontFamily: `Inter, ${DEFAULT_THEME.fontFamily}`,
		primaryColor: 'teal',
		primaryShade: { light: 7, dark: 5 },
		defaultRadius: 'lg',
		components: {
			Card: {
				defaultProps: {
					shadow: 'sm',
					radius: 'lg',
				},
			},
			Paper: {
				defaultProps: {
					shadow: 'xs',
					radius: 'lg',
				},
			},
			Button: {
				defaultProps: {
					radius: 'md',
				},
			},
		},
	})
);

export interface RouterAppContext {
	trpc: TRPCOptionsProxy<AppRouter>;
	queryClient: QueryClient;
}

/**
 * Auth context returned by beforeLoad
 * Available to all child routes via Route.useRouteContext()
 */
export interface AuthContext {
	session: SessionData | null;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	/**
	 * Fetch auth session before loading the route tree
	 *
	 * Uses createServerFn for direct access to request headers during SSR.
	 */
	beforeLoad: async (): Promise<AuthContext> => {
		const session = await getSessionFn();
		return { session };
	},
	head: () => ({
		meta: [
			{
				charSet: 'utf-8',
			},
			{
				name: 'viewport',
				content: 'width=device-width, initial-scale=1',
			},
		],
		links: [
			{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
			{
				rel: 'preconnect',
				href: 'https://fonts.gstatic.com',
				crossOrigin: 'anonymous',
			},
			{
				rel: 'stylesheet',
				href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
			},
			{ rel: 'stylesheet', href: appCss },
			{
				rel: 'apple-touch-icon',
				sizes: '180x180',
				href: '/apple-touch-icon.png',
			},
			{
				rel: 'icon',
				type: 'image/png',
				sizes: '32x32',
				href: '/favicon-32x32.png',
			},
			{
				rel: 'icon',
				type: 'image/png',
				sizes: '16x16',
				href: '/favicon-16x16.png',
			},
			{ rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
			{ rel: 'icon', href: '/favicon.ico' },
		],
	}),
	errorComponent: (props) => {
		return (
			<RootDocument>
				<RootErrorComponent error={props.error} reset={props.reset} />
			</RootDocument>
		);
	},
	notFoundComponent: () => (
		<RootDocument>
			<RootErrorComponent error={new Error('404 Not Found')} />
		</RootDocument>
	),
	component: RootComponent,
});

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
		</RootDocument>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" {...mantineHtmlProps} suppressHydrationWarning>
			<head>
				<HeadContent />
				<ColorSchemeScript defaultColorScheme="auto" />
			</head>
			<body>
				<Providers>
					<AppShell>{children}</AppShell>
				</Providers>
				<Scripts />
			</body>
		</html>
	);
}

function Providers({ children }: { children: React.ReactNode }) {
	const { session } = Route.useRouteContext();

	return (
		<MantineProvider theme={theme} defaultColorScheme="auto">
			<ModalsProvider labels={{ confirm: 'Confirm', cancel: 'Cancel' }}>
				<Notifications position="top-right" limit={3} zIndex={2000} />
				<NavigationProgress size={2} color="teal" />
				<AuthProvider session={session}>{children}</AuthProvider>
			</ModalsProvider>
			<TanStackDevtools
				config={{
					position: 'bottom-right',
				}}
				plugins={[
					{
						name: 'Tanstack Router',
						render: <TanStackRouterDevtoolsPanel />,
					},
					{ name: 'React Query', render: <ReactQueryDevtoolsPanel /> },
				]}
			/>
		</MantineProvider>
	);
}
