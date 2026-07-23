export type SupplierProfile = {
  displayName: string;
  businessName: string;
  category: string;
  deliveryArea: string;
  phone: string;
  email: string;
  profileCompletion: number;
};

function readString(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

export function getSupplierProfile(
  metadata: Record<string, unknown>,
  email = "",
): SupplierProfile {
  const savedDisplayName = readString(metadata, "display_name") || readString(metadata, "full_name");
  const savedBusinessName = readString(metadata, "business_name");
  const category = readString(metadata, "headline");
  const deliveryArea = readString(metadata, "delivery_area");
  const phone = readString(metadata, "phone");
  const completionFields = [savedDisplayName, savedBusinessName, category, deliveryArea, phone];
  const savedCompletion = Number(metadata.profile_completion);

  return {
    displayName: savedDisplayName || "Mitra Supplier",
    businessName: savedBusinessName || savedDisplayName || "Mitra Supplier",
    category,
    deliveryArea,
    phone,
    email,
    profileCompletion: Number.isFinite(savedCompletion)
      ? Math.min(100, Math.max(0, Math.round(savedCompletion)))
      : Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100),
  };
}

export function supplierInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "SP";
}
