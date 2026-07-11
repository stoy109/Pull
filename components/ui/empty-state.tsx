import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/class-names";

type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  action?: ReactNode;
  message?: ReactNode;
  title?: ReactNode;
};

export function EmptyState({
  action,
  className,
  message = "There is nothing here yet.",
  title = "No results",
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "grid min-h-40 place-items-center rounded-lg border border-dashed border-border bg-surface p-6 text-center",
        className,
      )}
      {...props}
    >
      <div className="grid gap-3">
        <h2 className="text-lg font-bold text-text-primary">{title}</h2>
        <p className="max-w-md text-sm leading-6 text-text-secondary">{message}</p>
        {action ?? null}
      </div>
    </div>
  );
}
