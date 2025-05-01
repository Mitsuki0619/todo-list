"use client";

import type { Todo } from "@/lib/db/schema";
import { useActionState, useId } from "react";
import { updateTodoTitle } from "../../actions/updateTodoTitle";
import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { updateTodoTitleSchema } from "../../schemas/updateTodoTitleSchema";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldErrors } from "@/components/ui/field-errors";

interface TodoTitleFormProps {
  id: Todo["id"];
  title: Todo["title"];
  onSuccess: () => void;
}

export function TodoTitleForm({ id, title, onSuccess }: TodoTitleFormProps) {
  const [lastResult, action] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await updateTodoTitle(_, formData);
      if (result.status === "success") {
        onSuccess();
      }
      return result;
    },
    undefined
  );
  const [form, fields] = useForm({
    lastResult,
    defaultValue: {
      title,
    },
    onValidate: ({ formData }) => {
      return parseWithZod(formData, {
        schema: updateTodoTitleSchema,
      });
    },
    shouldRevalidate: "onInput",
  });
  const errormessageId = useId();

  return (
    <form id={form.id} key={form.key} action={action} onSubmit={form.onSubmit}>
      <div className="flex items-center gap-2">
        <Input
          className="w-[600px]"
          {...getInputProps(fields.title, { type: "text" })}
          key={fields.title.key}
          aria-errormessage={errormessageId}
        />
        <Button type="submit" variant="default">
          <CheckCircle className="h-4 w-4" />
          保存
        </Button>
      </div>
      <FieldErrors
        errors={fields.title.errors}
        errorMessageId={errormessageId}
      />
      <input type="hidden" name="id" value={id} />
    </form>
  );
}
