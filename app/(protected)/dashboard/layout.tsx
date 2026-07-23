import { requireRole } from "@/lib/auth/access";

export default async function UmkmLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireRole(["umkm"]);

  return children;
}
