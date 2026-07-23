import { requireRole } from "@/lib/auth/access";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireRole(["admin"]);

  return children;
}
