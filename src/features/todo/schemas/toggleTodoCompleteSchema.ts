import { z } from "zod";

export const toggleTodoCompleteSchema = z.object({
	id: z.coerce.number().min(1),
});
