import { cloudflare } from '@cloudflare/vite-plugin';
import { sentryVitePlugin } from '@sentry/vite-plugin';
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
		sentryVitePlugin({
			org: process.env.SENTRY_ORG,
			project: process.env.SENTRY_PROJECT,
			authToken: process.env.SENTRY_AUTH_TOKEN,
			disable: !process.env.SENTRY_AUTH_TOKEN,
		}),
	],
});
