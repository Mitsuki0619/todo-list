import { verifyToken } from "@/lib/auth/session";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "./drizzle";
import { users } from "./schema";

export async function getUser() {
	const sessionCookie = (await cookies()).get("session");
	if (!sessionCookie || !sessionCookie.value) {
		return null;
	}

	const sessionData = await verifyToken(sessionCookie.value);
	if (
		!sessionData ||
		!sessionData.user ||
		typeof sessionData.user.id !== "number"
	) {
		return null;
	}

	if (new Date(sessionData.expires) < new Date()) {
		return null;
	}

	const user = await db
		.select()
		.from(users)
		.where(and(eq(users.id, sessionData.user.id)))
		.limit(1);

	if (user.length === 0) {
		return null;
	}

	return user[0];
}
