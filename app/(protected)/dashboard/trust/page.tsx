import { TrustPageView } from "@/features/umkm-core/components/trust-page";
import { getTrustWorkspace } from "@/features/umkm-core/data";

export default async function TrustScorePage() {
  const result = await getTrustWorkspace();
  return (
    <TrustPageView
      error={result.error}
      identity={result.identity}
      workspace={result.data}
    />
  );
}
