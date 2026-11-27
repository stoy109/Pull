"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isWorkerRoute = pathname === "/worker" || pathname.startsWith("/worker/");
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isWorkerRoute || isAdminRoute) return children;

  return (
    <div key={pathname} className="route-transition flex min-h-0 flex-1 flex-col">
      {children}
    </div>
  );
}
