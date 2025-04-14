"use server";

import { getUser } from "@/lib/db/queries";
import { parseWithZod } from "@conform-to/zod";
import { addTodoSchema } from "../schemas/addTodoSchema";
import { db } from "@/lib/db/drizzle";
import { todos } from "@/lib/db/schema";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const addTodo = async (_: unknown, formData: FormData) => {
	const user = await getUser();

	if (user == null) {
		redirect("/login");
	}

	const submission = parseWithZod(formData, {
		schema: addTodoSchema,
	});

	if (submission.status !== "success") {
		return submission.reply();
	}

	const { title } = submission.value;

	await db
		.insert(todos)
		.values({
			title,
			userId: user.id,
		})
		.returning();

	revalidatePath("/todos");

	return submission.reply({
		resetForm: true,
	});
};
