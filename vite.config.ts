import { cloudflare } from '@cloudflare/vite-plugin';
import { sentryTanstackStart } from '@sentry/tanstackstart-react/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	build: {
		sourcemap: true,
	},
	server: {
		port: 3000,
		warmup: {
			// Pre-bundle SSR entry files so the module runner doesn't trigger
			// repeated "new version of the pre-bundle" reloads on dev server restart
			ssrFiles: ['./src/router.tsx', './src/server.ts'],
			// Pre-bundle client entry files so dynamic dep discovery doesn't
			// trigger optimizer reloads after the page loads
			clientFiles: ['./src/routes/**/*'],
		},
	},
	plugins: [
		tsConfigPaths({
			projects: ['./tsconfig.json'],
		}),
		cloudflare({ viteEnvironment: { name: 'ssr' } }),
		tanstackStart(),
		viteReact(),
		// Use the dedicated TanStack Start Sentry plugin (instead of the generic
		// `@sentry/vite-plugin`) so that source maps are wired up correctly *and*
		// TanStack Start middlewares get auto-instrumented for tracing.
		// Must come last per Sentry docs.
		sentryTanstackStart({
			org: process.env.SENTRY_ORG,
			project: process.env.SENTRY_PROJECT,
			authToken: process.env.SENTRY_AUTH_TOKEN,
			// Skip source-map upload entirely when no auth token is available
			// (local dev, contributor PRs, etc.)
			sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
		}),
	],
});
