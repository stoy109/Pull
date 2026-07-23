import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseOnboardingRole } from "@/lib/auth/roles";
import { CompleteProfileForm } from "./profile-form";

type LengkapiProfilPageProps = {
  searchParams: Promise<{
    role?: string | string[];
    displayName?: string | string[];
    businessName?: string | string[];
    headline?: string | string[];
    deliveryArea?: string | string[];
    phone?: string | string[];
  }>;
};

function readSearchString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function readMetadataString(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === "string" ? value : "";
}

function readMetadataStrings(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export default async function LengkapiProfilPage({
  searchParams,
}: LengkapiProfilPageProps) {
  const params = await searchParams;
  const { data: { user } } = await (await createClient()).auth.getUser();

  if (!user) {
    redirect("/register");
  }

  const metadata = user.user_metadata ?? {};
  const searchRole = parseOnboardingRole(readSearchString(params.role)) ?? "umkm";
  const role = parseOnboardingRole(readMetadataString(metadata, "role")) ?? searchRole;
  const displayName =
    readMetadataString(metadata, "display_name") ||
    readMetadataString(metadata, "full_name") ||
    readSearchString(params.displayName);
  const businessName =
    readMetadataString(metadata, "business_name") ||
    readSearchString(params.businessName);
  const headline =
    readMetadataString(metadata, "headline") ||
    readSearchString(params.headline);
  const deliveryArea =
    readMetadataString(metadata, "delivery_area") ||
    readSearchString(params.deliveryArea);
  const phone =
    readMetadataString(metadata, "phone") || readSearchString(params.phone);
  const skills = readMetadataStrings(metadata, "skills");

  return (
    <CompleteProfileForm
      defaultDisplayName={displayName}
      defaultBusinessName={businessName}
      defaultHeadline={headline}
      defaultDeliveryArea={deliveryArea}
      defaultPhone={phone}
      defaultSkills={skills}
      role={role}
    />
  );
}
