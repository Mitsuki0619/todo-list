"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { CardFooter } from "@/components/ui/card";
import { FieldErrors } from "@/components/ui/field-errors";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import Link from "next/link";
import { useActionState } from "react";
import { signUp } from "../../actions/signUp";
import { signUpSchema } from "../../schemas/signUpSchema";

export function SignUpForm() {
	const [lastResult, action] = useActionState(signUp, undefined);
	const [form, fields] = useForm({
		lastResult,
		defaultValue: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
		onValidate: ({ formData }) => {
			return parseWithZod(formData, {
				schema: signUpSchema,
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
					<CardTitle>アカウント新規登録</CardTitle>
					<CardDescription>
						必要情報を入力して新しいアカウントを作成してください
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor={fields.name.id}>名前</Label>
						<Input
							{...getInputProps(fields.name, { type: "text" })}
							key={fields.name.key}
						/>
						<FieldErrors errors={fields.name.errors} />
					</div>
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
					<div className="space-y-2">
						<Label htmlFor={fields.confirmPassword.id}>確認用パスワード</Label>
						<Input
							{...getInputProps(fields.confirmPassword, {
								type: "password",
							})}
							key={fields.confirmPassword.key}
						/>
						<FieldErrors errors={fields.confirmPassword.errors} />
					</div>
				</CardContent>
				<CardFooter className="flex justify-between items-center gap-4">
					<div>
						<span className="text-sm text-muted-foreground">
							すでにアカウントをお持ちの方は
						</span>
						<Button variant="link" className="p-0 h-auto text-sm" asChild>
							<Link href="/login">ログイン</Link>
						</Button>
					</div>
					<Button type="submit">登録</Button>
				</CardFooter>
			</Card>
		</form>
	);
}
