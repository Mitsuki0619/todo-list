import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { Todo } from "@/lib/db/schema";

// getTodosアクションのモック
const mockGetTodos = vi.fn();
vi.mock("../../actions/getTodos", () => ({
  getTodos: mockGetTodos,
}));

// TodoListItemコンポーネントのモック
vi.mock("../TodoListItem/TodoListItem", () => ({
  TodoListItem: ({ id, title, completed }: Todo) => (
    <div data-testid={`todo-item-${id}`}>
      <span>{title}</span>
      <span>{completed ? "完了" : "未完了"}</span>
    </div>
  ),
}));

describe("TodoList", async () => {
  const { TodoList } = await import("./TodoList"); // ← importを遅延させる
  const mockTodos: Todo[] = [
    { id: 1, userId: 1, title: "Todo 1", completed: 0 },
    { id: 2, userId: 1, title: "Todo 2", completed: 1 },
    { id: 3, userId: 1, title: "Todo 3", completed: 0 },
  ];

  it("Todoが存在する場合、リストが表示される", async () => {
    // getTodosがモックデータを返すように設定
    mockGetTodos.mockResolvedValue({
      todos: mockTodos,
      hasNextPage: false,
      hasPrevPage: false,
      page: 1,
    });

    // サーバーコンポーネントなので、renderの結果をawaitで待つ
    const { container } = render(await TodoList({ page: 1 }));

    // 各Todoアイテムがモックコンポーネントで表示されていることを確認
    for (const todo of mockTodos) {
      expect(screen.getByTestId(`todo-item-${todo.id}`)).toBeInTheDocument();
      expect(screen.getByTestId(`todo-item-${todo.id}`)).toHaveTextContent(
        todo.title
      );
      expect(screen.getByTestId(`todo-item-${todo.id}`)).toHaveTextContent(
        todo.completed ? "完了" : "未完了"
      );
    }

    // 「TODOがありません」メッセージが表示されていないことを確認
    expect(screen.queryByText("TODOがありません")).not.toBeInTheDocument();
  });

  it("Todoが存在しない場合、「TODOがありません」メッセージが表示される", async () => {
    // getTodosが空のリストを返すように設定
    mockGetTodos.mockResolvedValue({
      todos: [],
      hasNextPage: false,
      hasPrevPage: false,
      page: 1,
    });

    render(await TodoList({ page: 1 }));

    // 「TODOがありません」メッセージが表示されていることを確認
    expect(screen.getByText("TODOがありません")).toBeInTheDocument();
    expect(
      screen.getByText("新しいTODOを追加してください")
    ).toBeInTheDocument();

    // Todoアイテムが表示されていないことを確認
    expect(screen.queryByTestId(/todo-item-/)).not.toBeInTheDocument();
  });
});
