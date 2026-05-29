import { Suspense } from "react";

import { MagicLinkClient } from "@/components/MagicLinkClient";

export default function MagicLinkPage() {
  return (
    <Suspense fallback={<p data-testid="magic-link-status">Signing you in...</p>}>
      <MagicLinkClient />
    </Suspense>
  );
}
