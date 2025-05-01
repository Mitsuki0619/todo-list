import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries";
import { todos } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export const getTodos = async (page: number) => {
	const user = await getUser();
	if (!user) {
		return {
			success: false,
			errors: ["ユーザーが見つかりません"],
		};
	}
	const res = await db
		.select({
			id: todos.id,
			title: todos.title,
			completed: todos.completed,
		})
		.from(todos)
		.where(eq(todos.userId, user.id))
		.orderBy(todos.id)
		.limit(10)
		.offset((page - 1) * 10);

	const totalCount = await db
		.select({ count: sql<number>`COUNT(*)` })
		.from(todos)
		.where(eq(todos.userId, user.id));

	const total = totalCount[0]?.count ?? 0;
	return {
		success: true,
		todos: res,
		page,
		total,
		hasNextPage: res.length === 10,
		hasPrevPage: page > 1,
	};
};
