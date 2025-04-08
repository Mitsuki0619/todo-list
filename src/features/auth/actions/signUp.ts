"use server";

import { hashPassword, setSession } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import { type NewUser, users } from "@/lib/db/schema";
import { parseWithZod } from "@conform-to/zod";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { signUpSchema } from "../schemas/signUpSchema";

export const signUp = async (_: unknown, formData: FormData) => {
	const submission = parseWithZod(formData, {
		schema: signUpSchema,
	});
	if (submission.status !== "success") {
		return submission.reply();
	}

	const { name, email, password } = submission.value;

	const existingUser = await db
		.select()
		.from(users)
		.where(eq(users.email, email))
		.limit(1);

	if (existingUser.length > 0) {
		return submission.reply({
			fieldErrors: {
				email: ["このメールアドレスは既に使用されています"],
			},
		});
	}

	const passwordHash = await hashPassword(password);

	const newUser: NewUser = {
		name,
		email,
		password: passwordHash,
	};

	const [createdUser] = await db.insert(users).values(newUser).returning();

	if (!createdUser) {
		return submission.reply({
			formErrors: ["ユーザーの作成に失敗しました"],
		});
	}
	await setSession(createdUser);
	redirect("/todos");
};
