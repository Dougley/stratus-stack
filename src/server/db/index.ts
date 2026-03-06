import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function createDb() {
	return drizzle(env.DB, { schema });
}

export type Database = ReturnType<typeof createDb>;

export * from './schema';
