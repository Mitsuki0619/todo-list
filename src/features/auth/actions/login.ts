"use server";

import { parseWithZod } from "@conform-to/zod";
import { loginSchema } from "@/features/auth/schemas/loginSchema";
import { comparePasswords, setSession } from "@/lib/auth/session";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/drizzle";

export const login = async (_: unknown, formData: FormData) => {
	const submission = parseWithZod(formData, {
		schema: loginSchema,
	});

	if (submission.status !== "success") {
		return submission.reply();
	}

	const { email, password } = submission.value;

	const foundUsers = await db
		.select({
			user: users,
		})
		.from(users)
		.where(eq(users.email, email))
		.limit(1);

	if (foundUsers.length === 0) {
		return submission.reply({
			fieldErrors: {
				email: ["このメールアドレスは登録されていません"],
			},
		});
	}

	const { user: foundUser } = foundUsers[0];

	const isPasswordValid = await comparePasswords(password, foundUser.password);

	if (!isPasswordValid) {
		return submission.reply({
			formErrors: ["パスワードが間違っています"],
		});
	}

	await setSession(foundUser);
	redirect("/todos");
};
