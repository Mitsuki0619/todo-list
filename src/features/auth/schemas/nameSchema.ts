import { z } from "zod";

export const nameSchema = z
	.string({ required_error: "ユーザー名は必須です" })
	.trim()
	.min(1)
	.max(255);
