<div align="center">
  <h1>☁️ Stratus Stack</h1>
  <p><strong>Full-stack React apps that stay in formation.</strong></p>
  <p>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
    <img src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white" alt="React 19">
  </p>
  <p>
    <a href="https://cloudflare.com"><img src="https://workers.cloudflare.com/built-with-cloudflare.svg" alt="Built with Cloudflare"></a>
  </p>
</div>

---

A production-ready boilerplate for building type-safe applications on Cloudflare Workers. This is a highly opinionated stack, mostly inspired by the T3 Stack, but adapted for the Cloudflare ecosystem.

We've made the specific technology choices and handled the configuration so you can just focus on building your app.

## The Stack

This is an opinionated stack designed for developer experience and performance:

- **TanStack Start** - Full-stack React with server-side rendering (SSR).
- **Cloudflare Workers** - Deploy your app to the edge for low latency and high scalability.
- **Cloudflare D1** - SQLite database at the edge, powered by Drizzle ORM.
- **tRPC** - Call your server functions directly from the client with full type safety.
- **Better Auth** - Modern authentication with anonymous sign-in out of the box and easy social provider setup.
- **Mantine UI** - A comprehensive component library that looks great out of the box.
- **Sentry** - Error tracking and performance monitoring out of the box.
- **Biome** - A single, fast tool for formatting and linting.

### Why this stack?

1.  **End-to-End Type Safety** - If you change a backend function, TypeScript will let you know on the frontend immediately.
2.  **Serverless First** - No servers to manage. Your code runs on Cloudflare's global network.
3.  **Zero Configuration** - We've already set up the authentication, styling, and build pipeline.

## Getting Started

### 1. Environment Setup

You'll need a few environment variables to get started. Copy the example file:

```bash
cp .dev.vars.example .dev.vars
```

| Variable             | Description                                                              |
| :------------------- | :----------------------------------------------------------------------- |
| `BETTER_AUTH_SECRET` | A random string used for encryption (e.g., `openssl rand -base64 32`).  |
| `BETTER_AUTH_URL`    | Your deployment URL (optional — defaults to request origin in production). |
| `SENTRY_DSN`         | Your Sentry DSN for error tracking (optional).                           |
| `SENTRY_ORG`         | Your Sentry organization slug (optional, for source maps).               |
| `SENTRY_PROJECT`     | Your Sentry project slug (optional, for source maps).                    |
| `SENTRY_AUTH_TOKEN`  | Your Sentry auth token (optional, for source maps).                      |

### 2. Linting & Formatting

We use Biome instead of ESLint and Prettier. It's faster and requires less configuration.

```bash
# Check for issues
npm run check

# Fix issues automatically
npm run check:fix
```

### 3. Auth Configuration

Anonymous sign-in works out of the box — no additional setup required.

To add social providers (e.g., GitHub, Discord, Google), uncomment the relevant block in `src/server/auth/index.ts` and add the corresponding secrets to your `.dev.vars` file:

```ts
// src/server/auth/index.ts
socialProviders: {
  github: {
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
  },
},
```

See the [Better Auth docs](https://www.better-auth.com/docs/authentication/social-login) for a full list of supported providers.

### 4. Run the App

```bash
npm install
npm run dev
```

Your app should now be running at `http://localhost:5173`.

## Deployment

Deploying to Cloudflare is straightforward:

1.  **Create a KV Namespace** (used for rate limiting):

    ```bash
    wrangler kv namespace create AUTH_KV
    wrangler kv namespace create AUTH_KV --preview
    ```

    Copy the IDs returned by these commands and update your `wrangler.jsonc` file.

2.  **Create a D1 Database**:

    ```bash
    wrangler d1 create stratus-db
    ```

    Copy the database ID into your `wrangler.jsonc` file.

3.  **Run Migrations**:

    ```bash
    npm run db:migrate
    ```

4.  **Deploy**:

    ```bash
    npm run deploy
    ```

5.  **Set Production Secrets**:
    ```bash
    wrangler secret put BETTER_AUTH_SECRET
    # Add any social provider secrets here too, e.g.:
    # wrangler secret put GITHUB_CLIENT_ID
    # wrangler secret put GITHUB_CLIENT_SECRET
    ```

## Database

This stack uses [Drizzle ORM](https://orm.drizzle.team/) with Cloudflare D1. The schema is defined in `src/server/db/schema.ts`.

```bash
# Generate migrations from schema changes
npm run db:generate

# Apply migrations to your D1 database
npm run db:migrate

# Open Drizzle Studio to browse your data
npm run db:studio
```

## Project Structure

Here's how the project is organized:

```
src/
├── components/       # Reusable React components and Contexts
├── routes/          # File-based routing (TanStack Router)
│   ├── api/         # API endpoints (Auth, tRPC)
│   └── __root.tsx   # The main application wrapper
├── server/          # Backend logic
│   ├── auth/        # Better Auth configuration
│   ├── db/          # Drizzle ORM schema and database client
│   └── trpc/        # tRPC router and procedures
├── styles/          # Global CSS and theme files
└── client.tsx       # Browser entry point
```

## Inspiration

This project is heavily inspired by the [T3 Stack](https://create.t3.gg/). We love the T3 Stack's approach to full-stack TypeScript development and have adapted many of its principles to work seamlessly with Cloudflare Workers.
