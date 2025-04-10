"use server";

import { db } from "@/lib/db/drizzle";
import { type Todo, todos } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export const toggleTodoComplete = async (id: Todo["id"]) => {
	const targetTodo = await db
		.select()
		.from(todos)
		.where(eq(todos.id, id))
		.limit(1);

	if (targetTodo.length === 0) {
		return {
			success: false,
			errors: ["TODOが見つかりませんでした"],
		};
	}

	const { completed } = targetTodo[0];

	const todo = await db
		.update(todos)
		.set({ completed: completed === 1 ? 0 : 1 })
		.where(eq(todos.id, id))
		.returning();

	revalidatePath("/todos");

	return {
		success: true,
		completed: todo[0].completed,
	};
};
