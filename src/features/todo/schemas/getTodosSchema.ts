import { z } from "zod";

export const getTodosSchema = z.object({
	page: z.coerce.number().min(1).default(1),
});
