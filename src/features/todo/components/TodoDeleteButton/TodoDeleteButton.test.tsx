import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest"; // Add beforeEach
import type { Todo } from "@/lib/db/schema";
import userEvent from "@testing-library/user-event";

// Server Actionのモック
const mockDeleteTodo = vi.fn();
vi.mock("../../actions/deleteTodo", () => ({
	deleteTodo: mockDeleteTodo,
}));

// useActionStateのモック (TodoListItem.test.tsx で設定済みだが、念のため再確認)
// reactのモックはグローバルに影響するため、ここでは追加のモック設定は不要
// ただし、テストごとにモック関数の状態をリセットする必要がある
beforeEach(() => {
	mockDeleteTodo.mockClear();
	// 必要であれば他のモックもリセット
});

describe("DeleteTodoButton", async () => {
	const { DeleteTodoButton } = await import("./TodoDeleteButton"); // ← importを遅延させる

	const mockId: Todo["id"] = 1;

	it("初期状態で削除ボタンが表示される", () => {
		render(<DeleteTodoButton id={mockId} />);
		expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
	});

	it("削除ボタンクリックで確認ダイアログが表示される", async () => {
		const user = userEvent.setup();

		render(<DeleteTodoButton id={mockId} />);
		const deleteButton = screen.getByRole("button", { name: "削除" });
		await user.click(deleteButton);

		// ダイアログが表示されるのを待機 (AlertDialogは非同期で表示されることがあるため)
		// waitFor(() => { // waitForは不要かもしれないが、念のため残す
		expect(
			screen.getByRole("heading", { name: "TODOの削除" }),
		).toBeInTheDocument();
		expect(
			screen.getByText(/本当に削除してもよろしいですか？/),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "キャンセル" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "削除する" }),
		).toBeInTheDocument();
		// });
	});

	it("ダイアログのキャンセルボタンクリックでダイアログが閉じる", async () => {
		const user = userEvent.setup();

		render(<DeleteTodoButton id={mockId} />);
		const deleteButton = screen.getByRole("button", { name: "削除" });
		await user.click(deleteButton);

		// ダイアログが表示されていることを確認
		const cancelButton = screen.getByRole("button", { name: "キャンセル" });
		expect(cancelButton).toBeInTheDocument();

		// キャンセルボタンをクリック
		await user.click(cancelButton);

		// ダイアログが閉じるのを待機
		await waitFor(() => {
			expect(
				screen.queryByRole("heading", { name: "TODOの削除" }),
			).not.toBeInTheDocument();
		});

		// deleteTodoアクションが呼び出されていないことを確認
		expect(mockDeleteTodo).not.toHaveBeenCalled();
	});

	it("ダイアログの削除するボタンクリックでdeleteTodoアクションが呼び出される", async () => {
		const user = userEvent.setup();

		render(<DeleteTodoButton id={mockId} />);
		const deleteButton = screen.getByRole("button", { name: "削除" });
		await user.click(deleteButton);

		// ダイアログが表示されていることを確認
		const confirmDeleteButton = screen.getByRole("button", {
			name: "削除する",
		});
		expect(confirmDeleteButton).toBeInTheDocument();

		// 削除するボタンをクリック
		await user.click(confirmDeleteButton);

		// deleteTodoアクションが正しいIDで呼び出されたことを確認
		// useActionStateのモックにより、action関数が直接実行される
		await waitFor(() => {
			expect(mockDeleteTodo).toHaveBeenCalledWith(mockId);
		});

		// アクション実行後、ダイアログが閉じることを確認（コンポーネント内のsetIsDialogOpen(false)が呼ばれる想定）
		// 注意: useActionStateのモック実装によっては、この確認が難しい場合がある。
		//       現在のモックではaction完了後の状態変化（isDialogOpen）は追えないため、
		//       アクション呼び出しの確認に留めるのが現実的かもしれない。
		await waitFor(() => {
			expect(
				screen.queryByRole("heading", { name: "TODOの削除" }),
			).not.toBeInTheDocument();
		});
	});
});
