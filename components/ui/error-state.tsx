import type { ComponentProps, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/class-names";
import { Button } from "./button";

type ErrorStateProps = HTMLAttributes<HTMLDivElement> & {
  action?: ReactNode;
  message?: ReactNode;
  title?: ReactNode;
};

export function ErrorState({
  action,
  className,
  message = "Something went wrong. Please try again.",
  title = "Unable to load",
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "grid min-h-40 place-items-center rounded-lg border border-accent-red-200 bg-accent-red-50 p-6 text-center",
        className,
      )}
      role="alert"
      {...props}
    >
      <div className="grid gap-3">
        <h2 className="text-lg font-bold text-danger">{title}</h2>
        <p className="max-w-md text-sm leading-6 text-accent-red-700">{message}</p>
        {action ?? null}
      </div>
    </div>
  );
}

export function RetryButton(props: ComponentProps<typeof Button>) {
  return <Button variant="danger" {...props} />;
}
