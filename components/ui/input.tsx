import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/class-names";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label?: string;
};

export function Input({ className, error, id, label, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="grid gap-2 text-sm font-medium text-text-primary">
      {label ? <span>{label}</span> : null}
      <input
        aria-invalid={Boolean(error)}
        aria-describedby={error && inputId ? `${inputId}-error` : undefined}
        className={cn(
          "h-11 rounded-lg border border-border bg-surface px-3 text-base text-text-primary shadow-sm outline-none transition-colors placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary-200",
          error ? "border-danger focus:border-danger focus:ring-accent-red-100" : "",
          className,
        )}
        id={inputId}
        {...props}
      />
      {error && inputId ? (
        <span className="text-sm font-medium text-danger" id={`${inputId}-error`}>
          {error}
        </span>
      ) : null}
    </label>
  );
}
