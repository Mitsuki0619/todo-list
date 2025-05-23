import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
	password: varchar({ length: 255 }).notNull(),
});

export const todos = pgTable("todos", {
	id: serial("id").primaryKey(),
	userId: integer()
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	title: varchar({ length: 255 }).notNull(),
	completed: integer().notNull().default(0),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
