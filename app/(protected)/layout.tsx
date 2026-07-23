import { PresenceHeartbeat } from "@/components/presence-heartbeat";
import { requireUser } from "@/lib/auth/access";

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
