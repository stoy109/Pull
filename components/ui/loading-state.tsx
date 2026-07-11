import type { HTMLAttributes } from "react";
import { cn } from "@/utils/class-names";

type LoadingStateProps = HTMLAttributes<HTMLDivElement> & {
  label?: string;
};

export function LoadingState({
  className,
  label = "Loading...",
  ...props
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-40 items-center justify-center rounded-lg border border-border bg-surface text-sm font-medium text-text-secondary",
        className,
      )}
      role="status"
      {...props}
    >
      {label}
    </div>
  );
}
