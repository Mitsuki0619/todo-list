import { z } from "zod";

export const addTodoSchema = z.object({
	title: z.string({ required_error: "タイトルは必須です" }).max(255, {
		message: "タイトルは255文字以内で入力してください",
	}),
});
