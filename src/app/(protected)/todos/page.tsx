import { TodoPage } from "@/features/todo/components/TodoPage/TodoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "TODO一覧画面",
	description: "TODO一覧画面",
};

export const experimental_ppr = true;

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ page: number }>;
}) {
	const { page } = await searchParams;
	return <TodoPage page={page} />;
}
