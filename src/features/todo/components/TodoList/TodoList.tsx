import { getTodos } from "../../actions/getTodos";
import { TodoListItem } from "../TodoListItem/TodoListItem";

export async function TodoList({ page }: { page: number }) {
	const {
		todos,
		hasNextPage,
		hasPrevPage,
		page: currentPage,
	} = await getTodos(page);

	return (
		<>
			{!todos?.length ? (
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<p className="text-muted-foreground mb-2">TODOがありません</p>
					<p className="text-sm text-muted-foreground">
						新しいTODOを追加してください
					</p>
				</div>
			) : (
				<ul className="space-y-3">
					{todos?.map((todo) => (
						<li key={todo.id}>
							<TodoListItem
								id={todo.id}
								title={todo.title}
								completed={todo.completed}
							/>
						</li>
					))}
				</ul>
			)}
		</>
	);
}
