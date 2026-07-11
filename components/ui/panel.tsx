import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/class-names";

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  description?: ReactNode;
  title?: ReactNode;
};

export function Panel({
  children,
  className,
  description,
  title,
  ...props
}: PanelProps) {
  return (
    <section
      className={cn("rounded-lg border border-border bg-surface p-5 shadow-sm", className)}
      {...props}
    >
      {title || description ? (
        <div className="mb-4 grid gap-1">
          {title ? <h2 className="text-xl font-bold text-text-primary">{title}</h2> : null}
          {description ? (
            <p className="text-base leading-7 text-text-secondary">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
