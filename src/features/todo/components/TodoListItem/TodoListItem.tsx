"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DeleteTodoButton } from "@/features/todo/components/TodoDeleteButton/TodoDeleteButton";
import type { Todo } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { useActionState, useOptimistic, useState, useTransition } from "react";
import { toggleTodoComplete } from "../../actions/toggleTodoComplete";
import { TodoTitleForm } from "../TodoTitleForm/TodoTitleForm";

export interface TodoListItemProps {
	id: Todo["id"];
	title: Todo["title"];
	completed: Todo["completed"];
}

export function TodoListItem({ id, title, completed }: TodoListItemProps) {
	const [editMode, setEditMode] = useState(false);
	const [lastResult, toggleTodoCompleteAction] = useActionState(
		async () => toggleTodoComplete(id),
		undefined,
	);
	const [, startTransition] = useTransition();

	const [optimisticState, addOptimistic] = useOptimistic(
		{ completed: lastResult?.completed ?? completed },
		(_, newState: { completed: number }) => {
			return newState;
		},
	);

	return (
		<div className="flex items-center justify-between p-4 border rounded-lg bg-white">
			<div className="flex items-center gap-3 flex-1 min-w-0">
				<Checkbox
					onCheckedChange={() => {
						startTransition(() => {
							addOptimistic({
								completed: optimisticState.completed === 0 ? 1 : 0,
							});
							toggleTodoCompleteAction();
						});
					}}
					defaultChecked={completed === 1}
				/>
				{editMode ? (
					<TodoTitleForm
						id={id}
						title={title}
						onSuccess={() => setEditMode(false)}
					/>
				) : (
					<span
						className={cn(
							"text-lg font-bold leading-none truncate",
							optimisticState.completed && "text-muted-foreground",
						)}
					>
						{title}
					</span>
				)}
			</div>
			<div className="ml-4 flex items-center gap-4">
				<Button
					type="button"
					onClick={() => setEditMode((prev) => !prev)}
					variant="outline"
				>
					{!editMode && <Pencil className="h-4 w-4" />}
					<span>{editMode ? "キャンセル" : "編集"}</span>
				</Button>
				<DeleteTodoButton id={id} />
			</div>
		</div>
	);
}
