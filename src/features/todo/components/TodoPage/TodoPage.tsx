import { PageLayout } from "@/components/layout/PageLayout";
import { TodoList } from "../TodoList/TodoList";
import { TodoForm } from "../TodoForm/TodoForm";

export async function TodoPage({ page }: { page: number }) {
	return (
		<PageLayout title="TODO一覧画面">
			<div className="flex flex-col gap-6">
				<TodoForm />
				<TodoList page={page} />
			</div>
		</PageLayout>
	);
}
