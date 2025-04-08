import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config();

const url =
	process.env.NODE_ENV === "production"
		? // biome-ignore lint/style/noNonNullAssertion: <explanation>
			process.env.POSTGRES_URL!
		: // biome-ignore lint/style/noNonNullAssertion: <explanation>
			process.env.LOCAL_POSTGRES_URL!;

export const client = postgres(url);
export const db = drizzle(client, {
	schema,
});
