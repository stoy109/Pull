import { requireRole } from "@/lib/auth/access";

export default async function SupplierLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireRole(["supplier"]);

  return children;
}
