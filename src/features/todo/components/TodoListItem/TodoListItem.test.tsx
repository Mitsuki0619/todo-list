import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { TodoListItem, type TodoListItemProps } from "./TodoListItem"; // Import type
import type { Todo } from "@/lib/db/schema";

// Server Actionのモック
vi.mock("../../actions/toggleTodoComplete", () => ({
  toggleTodoComplete: vi.fn(),
}));

// DeleteTodoButtonのモック（内部のアクションまではテストしない）
vi.mock("../TodoDeleteButton/TodoDeleteButton", () => ({
  DeleteTodoButton: ({ id }: { id: Todo["id"] }) => (
    <button type="button" data-testid={`delete-button-${id}`}>
      削除
    </button>
  ),
}));

// TodoTitleFormのモック（内部のアクションまではテストしない）
vi.mock("../TodoTitleForm/TodoTitleForm", () => ({
  TodoTitleForm: ({
    id,
    title,
    onSuccess,
  }: {
    id: Todo["id"];
    title: string;
    onSuccess: () => void;
  }) => (
    <div data-testid={`edit-form-${id}`}>
      <input defaultValue={title} />
      <button type="button" onClick={onSuccess}>
        保存
      </button>
    </div>
  ),
}));

// useActionState, useOptimistic, useTransition を React からインポートしてモック
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  const { useState } = actual; // オリジナルのuseStateを取得

  return {
    ...actual,
    // useActionState は単純な state と dispatch 関数を返すようにモック
    useActionState: vi.fn((action, initialState) => [initialState, action]),
    // useOptimistic は useState を使って状態管理を模倣する
    useOptimistic: vi.fn((initialState) => {
      // biome-ignore lint/correctness/useHookAtTopLevel: <explanation>
      const [state, setState] = useState(initialState); // useStateで状態を管理
      const addOptimistic = (newState: unknown) => {
        setState(newState); // addOptimisticで状態を更新
      };
      return [state, addOptimistic];
    }),
    // useTransition は isPending=false と startTransition 関数を返すようにモック
    useTransition: vi.fn(() => [false, vi.fn((callback) => callback())]),
  };
});

describe("TodoListItem", () => {
  const mockTodo: TodoListItemProps = {
    id: 1, // Changed to number
    title: "Test Todo",
    completed: 0,
  };

  const mockCompletedTodo: TodoListItemProps = {
    id: 2, // Changed to number
    title: "Completed Todo",
    completed: 1,
  };

  it("未完了のTodoが正しく表示される", () => {
    render(<TodoListItem {...mockTodo} />);

    // タイトルが表示されている
    expect(screen.getByText(mockTodo.title)).toBeInTheDocument();
    // タイトルに打ち消し線がない（または特定のクラスがない）ことを確認
    expect(screen.getByText(mockTodo.title)).not.toHaveClass(
      "text-muted-foreground"
    );
    // チェックボックスがチェックされていない
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    // 編集ボタンが表示されている
    expect(screen.getByRole("button", { name: "編集" })).toBeInTheDocument();
    // 削除ボタンが表示されている (モックを使用)
    expect(
      screen.getByTestId(`delete-button-${mockTodo.id}`)
    ).toBeInTheDocument();
  });

  it("完了済みのTodoが正しく表示される", () => {
    render(<TodoListItem {...mockCompletedTodo} />);

    // タイトルが表示されている
    expect(screen.getByText(mockCompletedTodo.title)).toBeInTheDocument();
    // タイトルに打ち消し線がある（または特定のクラスがある）ことを確認
    expect(screen.getByText(mockCompletedTodo.title)).toHaveClass(
      "text-muted-foreground"
    );
    // チェックボックスがチェックされている
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("チェックボックスをクリックすると完了状態が切り替わる（オプティミスティック）", async () => {
    const user = userEvent.setup();
    const { toggleTodoComplete } = await import(
      "../../actions/toggleTodoComplete"
    );
    render(<TodoListItem {...mockTodo} />);

    const checkbox = screen.getByRole("checkbox");
    const titleElement = screen.getByText(mockTodo.title);

    // 初期状態を確認
    expect(checkbox).not.toBeChecked();
    expect(titleElement).not.toHaveClass("text-muted-foreground");

    // チェックボックスをクリック
    await user.click(checkbox);

    // オプティミスティックUIにより即座にスタイルが変わることを確認
    // (useOptimisticのモックにより、stateが即時反映される想定)
    // 注意: 実際のuseOptimisticの挙動とは異なる可能性があるため、モックの実装に依存します。
    //       ここではモックが状態を即時反映すると仮定してテストします。
    //       より正確なテストのためには、React Testing LibraryのwaitForなどを使うか、
    //       useOptimisticのモックをより精緻にする必要があります。
    //       今回は簡略化のため、モックが即時反映する前提で進めます。
    expect(titleElement).toHaveClass("text-muted-foreground");

    // toggleTodoCompleteアクションが呼び出されたことを確認
    expect(toggleTodoComplete).toHaveBeenCalledWith(mockTodo.id);
  });

  it("編集ボタンをクリックすると編集モードに切り替わる", async () => {
    const user = userEvent.setup();
    render(<TodoListItem {...mockTodo} />);

    const editButton = screen.getByRole("button", { name: "編集" });
    await user.click(editButton);

    // タイトル表示が消え、編集フォームが表示される (モックを使用)
    expect(screen.queryByText(mockTodo.title)).not.toBeInTheDocument();
    expect(screen.getByTestId(`edit-form-${mockTodo.id}`)).toBeInTheDocument();
    // 編集ボタンのテキストが「キャンセル」に変わる
    expect(
      screen.getByRole("button", { name: "キャンセル" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "編集" })
    ).not.toBeInTheDocument();
  });

  it("キャンセルボタンをクリックすると表示モードに戻る", async () => {
    const user = userEvent.setup();
    render(<TodoListItem {...mockTodo} />);

    // まず編集モードにする
    const editButton = screen.getByRole("button", { name: "編集" });
    await user.click(editButton);

    // 編集フォームが表示されていることを確認
    expect(screen.getByTestId(`edit-form-${mockTodo.id}`)).toBeInTheDocument();

    // キャンセルボタンをクリック
    const cancelButton = screen.getByRole("button", { name: "キャンセル" });
    await user.click(cancelButton);

    // 編集フォームが消え、タイトル表示に戻る
    expect(
      screen.queryByTestId(`edit-form-${mockTodo.id}`)
    ).not.toBeInTheDocument();
    expect(screen.getByText(mockTodo.title)).toBeInTheDocument();
    // ボタンのテキストが「編集」に戻る
    expect(screen.getByRole("button", { name: "編集" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "キャンセル" })
    ).not.toBeInTheDocument();
  });
});
