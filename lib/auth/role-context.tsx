"use client";

import { createContext, useContext } from "react";
import type { Role } from "@/lib/auth/roles";

const RoleContext = createContext<Role | null>(null);

export function RoleProvider({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const role = useContext(RoleContext);
  if (!role) throw new Error("useRole harus dipakai di dalam RoleProvider.");
  return role;
}
