import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { addTodoSchema } from "../../schemas/addTodoSchema"; // バリデーションメッセージ確認用
import userEvent from "@testing-library/user-event";

// Server Actionのモック
const mockAddTodo = vi.fn();
vi.mock("../../actions/addTodo", () => ({
	addTodo: mockAddTodo,
}));

// reactのモックはグローバルに影響するため、ここでは追加のモック設定は不要

beforeEach(() => {
	mockAddTodo.mockClear();
});

describe("TodoForm", async () => {
	const { TodoForm } = await import("./TodoForm"); // ← importを遅延させる

	it("初期状態で入力フィールドと追加ボタンが表示される", () => {
		render(<TodoForm />);
		expect(screen.getByRole("textbox")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "追加" })).toBeInTheDocument();
	});

	it("入力フィールドにテキストを入力できる", async () => {
		const user = userEvent.setup();

		render(<TodoForm />);
		const input = screen.getByRole("textbox");
		await user.type(input, "新しいTodo");
		expect(input).toHaveValue("新しいTodo");
	});

	it("何も入力せずに送信するとバリデーションエラーが表示され、アクションは呼ばれない", async () => {
		const user = userEvent.setup();

		render(<TodoForm />);
		const submitButton = screen.getByRole("button", { name: "追加" });
		await user.click(submitButton);

		// バリデーションエラーメッセージを取得 (zodスキーマから)
		const validationResult = addTodoSchema.safeParse({ title: "" });
		let expectedErrorMessage = "";
		if (!validationResult.success) {
			expectedErrorMessage = validationResult.error.errors[0].message;
		}

		// エラーメッセージが表示されるのを待機
		await waitFor(() => {
			expect(screen.getAllByText(expectedErrorMessage)[0]).toBeInTheDocument();
		});

		// addTodoアクションが呼び出されていないことを確認
		expect(mockAddTodo).not.toHaveBeenCalled();
	});

	it("有効なテキストを入力して送信するとaddTodoアクションが呼び出される", async () => {
		// モックされたaddTodoが成功したと仮定する値を返すように設定
		// (ConformがフォームリセットのためにlastResultの変更を検知できるように)
		// ただし、現在のuseActionStateのモックではlastResultの更新はシミュレートされないため、
		// フォームリセットの確認は難しい。アクション呼び出しの確認に留める。
		const user = userEvent.setup();

		mockAddTodo.mockResolvedValue({ success: true });

		render(<TodoForm />);
		const input = screen.getByRole("textbox");
		const submitButton = screen.getByRole("button", { name: "追加" });
		const todoTitle = "有効なTodoタイトル";

		await user.type(input, todoTitle);
		await user.click(submitButton);

		// addTodoアクションが呼び出されたことを確認
		// Conformは内部でFormDataを使うため、直接の引数チェックは複雑になる。
		// ここではアクションが呼び出されたことの確認に留める。
		await waitFor(() => {
			expect(mockAddTodo).toHaveBeenCalled();
		});

		// オプション：フォームがリセットされるかの確認（現在のモックでは難しい）
		await waitFor(() => {
			expect(input).toHaveValue("");
		});
	});
});
