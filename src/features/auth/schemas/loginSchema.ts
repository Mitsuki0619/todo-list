import { z } from "zod";

import { emailSchema } from "./emailSchema";
import { passwordSchema } from "./passwordSchema";

export const loginSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
});

export type LoginSchema = z.infer<typeof loginSchema>;
