import { z } from "zod";

import { emailSchema } from "./emailSchema";
import { confirmPasswordSchema, passwordSchema } from "./passwordSchema";
import { nameSchema } from "@/features/auth/schemas/nameSchema";

export const signUpSchema = z
	.object({
		name: nameSchema,
		email: emailSchema,
		password: passwordSchema,
		confirmPassword: confirmPasswordSchema,
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "パスワードと確認用パスワードが一致しません",
		path: ["confirmPassword"],
	});

export type SignUpSchema = z.infer<typeof signUpSchema>;
