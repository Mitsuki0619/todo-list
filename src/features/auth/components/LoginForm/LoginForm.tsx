"use client";

import { useActionState } from "react";
import { login } from "../../actions/login";
import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { loginSchema } from "../../schemas/loginSchema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { CardFooter } from "@/components/ui/card";
import { FieldErrors } from "@/components/ui/field-errors";

export function LoginForm() {
	const [lastResult, action] = useActionState(login, undefined);
	const [form, fields] = useForm({
		lastResult,
		defaultValue: {
			email: "",
			password: "",
		},
		onValidate: ({ formData }) => {
			return parseWithZod(formData, {
				schema: loginSchema,
			});
		},
		shouldRevalidate: "onInput",
	});

	return (
		<form
			id={form.id}
			onSubmit={form.onSubmit}
			action={action}
			className="bg-white"
			key={form.key}
		>
			<Card className="w-[350px] max-w-sm">
				<CardHeader>
					<CardTitle>ログイン</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor={fields.email.id}>メールアドレス</Label>
						<Input
							{...getInputProps(fields.email, { type: "email" })}
							key={fields.email.key}
						/>
						<FieldErrors errors={fields.email.errors} />
					</div>
					<div className="space-y-2">
						<Label htmlFor={fields.password.id}>パスワード</Label>
						<Input
							{...getInputProps(fields.password, { type: "password" })}
							key={fields.password.key}
						/>
						<FieldErrors errors={fields.password.errors} />
					</div>
				</CardContent>
				<CardFooter className="flex justify-end">
					<Button type="submit">ログイン</Button>
				</CardFooter>
			</Card>
		</form>
	);
}
