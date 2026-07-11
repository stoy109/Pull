import type { HTMLAttributes } from "react";
import { cn } from "@/utils/class-names";

type BadgeTone = "neutral" | "success" | "warning" | "danger";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-border bg-surface-muted text-text-secondary",
  success: "border-secondary-200 bg-secondary-50 text-secondary-700",
  warning: "border-accent-yellow-200 bg-accent-yellow-50 text-accent-yellow-800",
  danger: "border-accent-red-200 bg-accent-red-50 text-accent-red-700",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
