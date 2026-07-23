import { redirectToRoleDashboard } from "@/lib/auth/access";

export default async function RoleRedirectPage() {
  await redirectToRoleDashboard();
}
