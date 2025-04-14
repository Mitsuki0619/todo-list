"use server";

import { db } from "@/lib/db/drizzle";
import { todos } from "@/lib/db/schema";
import { parseWithZod } from "@conform-to/zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { updateTodoTitleSchema } from "../schemas/updateTodoTitleSchema";

export const updateTodoTitle = async (_: unknown, formData: FormData) => {
	const submission = parseWithZod(formData, {
		schema: updateTodoTitleSchema,
	});

	if (submission.status !== "success") {
		return submission.reply();
	}

	const { id, title } = submission.value;

	const targetTodo = await db
		.select()
		.from(todos)
		.where(eq(todos.id, id))
		.limit(1);

	if (targetTodo.length === 0) {
		return submission.reply({
			formErrors: ["TODOが見つかりませんでした"],
		});
	}

	await db.update(todos).set({ title }).where(eq(todos.id, id));

	revalidatePath("/todos");

	return submission.reply();
};
