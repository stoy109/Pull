import { requireUser } from "@/lib/auth/access";
import { PresenceHeartbeat } from "@/components/presence-heartbeat";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireUser();

  return (
    <>
      <PresenceHeartbeat />
      {children}
    </>
  );
}
