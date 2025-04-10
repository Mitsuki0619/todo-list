"use client";

import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { Todo } from "@/lib/db/schema";
import { Trash } from "lucide-react";
import { useActionState, useState } from "react";
import { deleteTodo } from "../../actions/deleteTodo";

export function DeleteTodoButton({ id }: { id: Todo["id"] }) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [, action, isPending] = useActionState(async () => {
		await deleteTodo(id);
		setIsDialogOpen(false);
	}, undefined);

	return (
		<AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<AlertDialogTrigger asChild>
				<Button type="button" variant="destructive">
					<Trash className="h-4 w-4" />
					<span>削除</span>
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-xl p-4 sm:p-6 rounded-lg sm:rounded-xl">
				<AlertDialogHeader>
					<AlertDialogTitle className="text-lg sm:text-xl font-bold">
						TODOの削除
					</AlertDialogTitle>
					<AlertDialogDescription className="text-sm sm:text-base mt-2">
						※この操作は取り消せません。
						<br />
						本当に削除してもよろしいですか？
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-4 mt-4 sm:mt-6">
					<AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1">
						キャンセル
					</AlertDialogCancel>
					<form
						action={action}
						onSubmit={(e) => e.stopPropagation()}
						className="w-full sm:w-auto order-1 sm:order-2"
					>
						<Button
							variant="destructive"
							type="submit"
							disabled={isPending}
							className="w-full sm:w-auto"
						>
							削除する
						</Button>
					</form>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
