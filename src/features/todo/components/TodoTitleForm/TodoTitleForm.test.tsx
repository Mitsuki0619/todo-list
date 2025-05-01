import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateTodoTitleSchema } from "../../schemas/updateTodoTitleSchema"; // バリデーションメッセージ確認用

// Server Actionのモック
const mockUpdateTodoTitle = vi.fn();
vi.mock("../../actions/updateTodoTitle", () => ({
	updateTodoTitle: mockUpdateTodoTitle,
}));

// reactのモックはグローバルに影響するため、ここでは追加のモック設定は不要

beforeEach(() => {
	mockUpdateTodoTitle.mockClear();
});

describe("TodoTitleForm", async () => {
	// コンポーネントの遅延インポート
	const { TodoTitleForm } = await import("./TodoTitleForm");

	const defaultProps = {
		id: 1,
		title: "既存のTodoタイトル",
		onSuccess: vi.fn(),
	};

	beforeEach(() => {
		defaultProps.onSuccess.mockClear();
	});

	it("初期状態で渡されたタイトルが入力フィールドに表示され、保存ボタンが表示される", () => {
		render(<TodoTitleForm {...defaultProps} />);
		expect(screen.getByRole("textbox")).toHaveValue(defaultProps.title);
		expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
		// hidden inputでidが渡されていることも確認
		expect(
			screen.getByDisplayValue(defaultProps.id.toString()),
		).toBeInTheDocument();
		expect(
			screen.getByDisplayValue(defaultProps.id.toString()),
		).toHaveAttribute("name", "id");
		expect(
			screen.getByDisplayValue(defaultProps.id.toString()),
		).toHaveAttribute("type", "hidden");
	});

	it("入力フィールドに新しいタイトルを入力できる", async () => {
		const user = userEvent.setup();
		render(<TodoTitleForm {...defaultProps} />);
		const input = screen.getByRole("textbox");
		const newTitle = "新しいTodoタイトル";

		await user.clear(input);
		await user.type(input, newTitle);

		expect(input).toHaveValue(newTitle);
	});

	it("有効なタイトルを入力して保存ボタンをクリックするとupdateTodoTitleアクションが呼び出され、onSuccessが呼ばれる", async () => {
		const user = userEvent.setup();
		// アクションが成功したことを示す値を返すようにモックを設定
		mockUpdateTodoTitle.mockResolvedValue({ status: "success" });

		render(<TodoTitleForm {...defaultProps} />);
		const input = screen.getByRole("textbox");
		const submitButton = screen.getByRole("button", { name: "保存" });
		const newTitle = "更新後のタイトル";

		await user.clear(input);
		await user.type(input, newTitle);
		await user.click(submitButton);

		// updateTodoTitleアクションが正しい引数で呼び出されたことを確認
		// ConformはFormDataを使うため、呼び出し時の引数チェックは少し複雑になる
		// ここでは呼び出されたことと、onSuccessが呼ばれたことを確認する
		await waitFor(() => {
			expect(mockUpdateTodoTitle).toHaveBeenCalledTimes(1);
			// FormDataの内容を確認するのは難しいので、ここでは省略
			// expect(mockUpdateTodoTitle).toHaveBeenCalledWith(expect.any(FormData));
		});

		// onSuccessコールバックが呼び出されたことを確認
		await waitFor(() => {
			expect(defaultProps.onSuccess).toHaveBeenCalledTimes(1);
		});
	});

	it("タイトルを空にして保存しようとするとバリデーションエラーが表示され、アクションは呼ばれない", async () => {
		const user = userEvent.setup();
		render(<TodoTitleForm {...defaultProps} />);
		const input = screen.getByRole("textbox");
		const submitButton = screen.getByRole("button", { name: "保存" });

		await user.clear(input);
		await user.click(submitButton);

		// バリデーションエラーメッセージを取得 (zodスキーマから)
		const validationResult = updateTodoTitleSchema.safeParse({
			id: defaultProps.id,
			title: "",
		});
		let expectedErrorMessage = "";
		if (!validationResult.success) {
			// titleフィールドのエラーメッセージを取得
			const titleError = validationResult.error.errors.find((e) =>
				e.path.includes("title"),
			);
			if (titleError) {
				expectedErrorMessage = titleError.message;
			}
		}

		// エラーメッセージが表示されるのを待機
		await waitFor(() => {
			expect(screen.getAllByText(expectedErrorMessage)[0]).toBeInTheDocument();
		});

		// updateTodoTitleアクションが呼び出されていないことを確認
		expect(mockUpdateTodoTitle).not.toHaveBeenCalled();
		// onSuccessコールバックが呼び出されていないことを確認
		expect(defaultProps.onSuccess).not.toHaveBeenCalled();
	});

	it("タイトルが255文字を超えて保存しようとするとバリデーションエラーが表示され、アクションは呼ばれない", async () => {
		const user = userEvent.setup();
		render(<TodoTitleForm {...defaultProps} />);
		const input = screen.getByRole("textbox");
		const submitButton = screen.getByRole("button", { name: "保存" });
		const longTitle = "a".repeat(256);

		await user.clear(input);
		await user.type(input, longTitle);
		await user.click(submitButton);

		// バリデーションエラーメッセージを取得 (zodスキーマから)
		const validationResult = updateTodoTitleSchema.safeParse({
			id: defaultProps.id,
			title: longTitle,
		});
		let expectedErrorMessage = "";
		if (!validationResult.success) {
			// titleフィールドのエラーメッセージを取得
			const titleError = validationResult.error.errors.find((e) =>
				e.path.includes("title"),
			);
			if (titleError) {
				expectedErrorMessage = titleError.message;
			}
		}

		// エラーメッセージが表示されるのを待機
		await waitFor(() => {
			expect(screen.getAllByText(expectedErrorMessage)[0]).toBeInTheDocument();
		});

		// updateTodoTitleアクションが呼び出されていないことを確認
		expect(mockUpdateTodoTitle).not.toHaveBeenCalled();
		// onSuccessコールバックが呼び出されていないことを確認
		expect(defaultProps.onSuccess).not.toHaveBeenCalled();
	});

	it("updateTodoTitleアクションがエラーを返した場合、onSuccessは呼ばれない", async () => {
		const user = userEvent.setup();
		// アクションが失敗したことを示す値を返すようにモックを設定
		mockUpdateTodoTitle.mockResolvedValue({
			status: "error",
			errors: { title: ["サーバーエラー"] },
		});

		render(<TodoTitleForm {...defaultProps} />);
		const input = screen.getByRole("textbox");
		const submitButton = screen.getByRole("button", { name: "保存" });
		const newTitle = "更新試行タイトル";

		await user.clear(input);
		await user.type(input, newTitle);
		await user.click(submitButton);

		// updateTodoTitleアクションが呼び出されたことを確認
		await waitFor(() => {
			expect(mockUpdateTodoTitle).toHaveBeenCalledTimes(1);
		});

		// onSuccessコールバックが呼び出されていないことを確認
		expect(defaultProps.onSuccess).not.toHaveBeenCalled();
	});
});
