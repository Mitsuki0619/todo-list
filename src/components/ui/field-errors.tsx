import { cn } from "@/lib/utils";

export function FieldErrors({
  errorMessageId,
  errors,
  className,
}: {
  errorMessageId: string;
  errors: string[] | undefined;
  className?: string;
}) {
  if (errors == null || !errors.length) return null;
  return (
    <div className={cn("text-red-500 text-sm", className)} id={errorMessageId}>
      {errors.map((err, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <div key={i}>{err}</div>
      ))}
    </div>
  );
}
