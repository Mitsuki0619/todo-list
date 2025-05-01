import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockAddTodo = vi.fn();
vi.mock("../../actions/addTodo", () => ({
  addTodo: mockAddTodo,
}));
beforeEach(() => {
  mockAddTodo.mockClear();
});
const { TodoForm } = await import("./TodoForm");

const user = userEvent.setup();

const setupForm = () => {
  render(<TodoForm />);
  const input = screen.getByRole("textbox");
  const submitButton = screen.getByRole("button", { name: "追加" });
  return { input, submitButton };
};

const fillValueAndSubmit = async (value: string) => {
  const { input, submitButton } = setupForm();
  await user.type(input, value);
  await user.click(submitButton);
  return { input, submitButton };
};

describe("TodoForm", async () => {
  test("初期状態で入力フィールドと追加ボタンが表示される", () => {
    setupForm();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "追加" })).toBeInTheDocument();
  });

  test("有効なテキストを入力して送信するとaddTodoアクションが呼び出され、フィールドが初期値に戻る", async () => {
    const { input } = await fillValueAndSubmit("正常な値");
    mockAddTodo.mockResolvedValueOnce({ success: true });
    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });

  test("何も入力せずに送信するとバリデーションエラーが表示され、アクションは呼ばれない", async () => {
    const { submitButton } = setupForm();
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText("タイトルは必須です"));
    });
    expect(mockAddTodo).not.toBeCalled();
  });

  test("256文字入力して送信するとバリデーションエラーが表示され、アクションは呼ばれない", async () => {
    await fillValueAndSubmit(
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    );
    await waitFor(() => {
      expect(screen.getByText("タイトルは255文字以内で入力してください"));
    });
    expect(mockAddTodo).not.toBeCalled();
  });
  test("255文字入力して送信するとmockAddTodoが呼び出される", async () => {
    await fillValueAndSubmit(
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    );
    mockAddTodo.mockResolvedValueOnce({ success: true });
  });
});
