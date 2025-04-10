"use client";

import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useActionState } from "react";
import { addTodo } from "../../actions/addTodo";
import { addTodoSchema } from "../../schemas/addTodoSchema";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldErrors } from "@/components/ui/field-errors";

export function TodoForm() {
	const [lastResult, action] = useActionState(addTodo, undefined);
	const [form, fields] = useForm({
		lastResult,
		defaultValue: {
			title: "",
		},
		onValidate: ({ formData }) => {
			return parseWithZod(formData, {
				schema: addTodoSchema,
			});
		},
		shouldRevalidate: "onInput",
	});

	return (
		<form id={form.id} key={form.key} action={action} onSubmit={form.onSubmit}>
			<div className="flex gap-4">
				<Input
					{...getInputProps(fields.title, { type: "text" })}
					className="w-[600px]"
					key={fields.title.key}
				/>
				<Button type="submit" variant="default">
					<PlusCircle className="h-4 w-4" />
					追加
				</Button>
			</div>
			<FieldErrors errors={fields.title.errors} />
		</form>
	);
}
