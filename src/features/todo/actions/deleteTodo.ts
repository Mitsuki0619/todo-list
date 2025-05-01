"use server";

import { db } from "@/lib/db/drizzle";
import { todos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const deleteTodo = async (id: number) => {
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

	await db.delete(todos).where(eq(todos.id, id));

	revalidatePath("/todos");

	return {
		success: true,
	};
};
