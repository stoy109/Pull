import { VerifyResetForm } from "./verify-reset-form";

type VerifyResetPageProps = {
  searchParams: Promise<{
    email?: string | string[];
  }>;
};

export default async function VerifyResetPage({
  searchParams,
}: VerifyResetPageProps) {
  const params = await searchParams;
  const email = typeof params.email === "string" ? params.email : "";

  return <VerifyResetForm email={email} />;
}
