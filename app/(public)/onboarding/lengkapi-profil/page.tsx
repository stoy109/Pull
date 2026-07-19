import { createClient } from "@/lib/supabase/server";
import { CompleteProfileForm } from "./profile-form";

type LengkapiProfilPageProps = {
  searchParams: Promise<{
    role?: string;
  }>;
};

export default async function LengkapiProfilPage({
  searchParams,
}: LengkapiProfilPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const metadata = user?.user_metadata ?? {};
  const searchRole =
    params.role === "pekerja"
      ? "pekerja"
      : params.role === "supplier"
        ? "supplier"
        : "umkm";
  const role = typeof metadata.role === "string" ? metadata.role : searchRole;
  const fullName =
    typeof metadata.full_name === "string" ? metadata.full_name : "";
  const phone = typeof metadata.phone === "string" ? metadata.phone : "";

  return (
    <CompleteProfileForm
      defaultDisplayName={fullName}
      defaultPhone={phone}
      role={role}
    />
  );
}
