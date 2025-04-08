import { z } from "zod";

export const emailSchema = z
	.string({ required_error: "メールアドレスは必須です" })
	.email("メールアドレスの形式が正しくありません")
	.trim()
	.max(255, "メールアドレスは255文字以内で入力してください")
	.min(1);
