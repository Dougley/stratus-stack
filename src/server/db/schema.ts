import { sql } from 'drizzle-orm';
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Notes table - example schema for demonstrating Drizzle ORM usage
 *
 * This is a simple example table. Replace or extend with your own schema.
 */
export const notes = sqliteTable('notes', {
	id: int().primaryKey({ autoIncrement: true }),
	content: text().notNull(),
	createdAt: text().default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Add more tables here as needed
// export const posts = sqliteTable('posts', { ... });
