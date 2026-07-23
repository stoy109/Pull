import { SupplierShell } from "@/features/supplier/components/supplier-shell";
import { getSupplierProfile } from "@/features/supplier/profile";
import { requireRole } from "@/lib/auth/require-role";

export default async function SupplierLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user } = await requireRole(["supplier"]);
  const profile = getSupplierProfile(user.user_metadata ?? {}, user.email ?? "");

  return (
    <SupplierShell ownerName={profile.businessName} profileCompletion={profile.profileCompletion}>
      {children}
    </SupplierShell>
  );
}
