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
import { useActionState, useId } from "react";
import { login } from "../../actions/login";
import { loginSchema } from "../../schemas/loginSchema";

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

  const errormessageId = useId();

  return (
    <form
      id={form.id}
      onSubmit={form.onSubmit}
      action={action}
      className="bg-white"
      key={form.key}
    >
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">ログイン</CardTitle>
          <CardDescription>
            メールアドレスとパスワードを入力してログインしてください
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor={fields.email.id}>メールアドレス</Label>
            <Input
              {...getInputProps(fields.email, { type: "email" })}
              key={fields.email.key}
              aria-errormessage={`email-${errormessageId}`}
            />
            <FieldErrors
              errors={fields.email.errors}
              errorMessageId={`email-${errormessageId}`}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={fields.password.id}>パスワード</Label>
            <Input
              {...getInputProps(fields.password, { type: "password" })}
              key={fields.password.key}
              aria-errormessage={`password-${errormessageId}`}
            />
            <FieldErrors
              errors={fields.password.errors}
              errorMessageId={`password-${errormessageId}`}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center gap-4">
          <div>
            <span className="text-sm text-muted-foreground">
              アカウントをお持ちでない方は
            </span>
            <Button variant="link" className="p-0 h-auto text-sm" asChild>
              <Link href="/signup">新規登録</Link>
            </Button>
          </div>
          <Button type="submit">ログイン</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
