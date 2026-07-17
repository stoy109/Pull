import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CompleteProfileForm } from "./profile-form";

export default async function LengkapiProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const metadata = user.user_metadata;
  const role = typeof metadata.role === "string" ? metadata.role : "umkm";
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
