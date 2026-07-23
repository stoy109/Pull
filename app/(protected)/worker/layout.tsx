import { requireRole } from "@/lib/auth/access";

export default async function WorkerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireRole(["pekerja"]);

  return children;
}
