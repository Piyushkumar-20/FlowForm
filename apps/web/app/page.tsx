"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "~/hooks/api/auth";
import FormFlowLanding from "~/components/form-flow-landing";

export default function Home() {
  // isFetched = true once the auth query has settled (success OR 401 error).
  // We use it instead of isLoading so the landing page is visible immediately
  // on first paint — no blank screen while the auth check is in flight.
  const { user, isFetched } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isFetched && user?.id) {
      router.replace("/dashboard");
    }
  }, [user, isFetched, router]);

  // Confirmed logged-in: show nothing while the router navigation happens.
  if (isFetched && user?.id) return null;

  // Show landing page immediately in all other cases:
  //   • Auth query still in-flight  (isFetched=false) → no black screen
  //   • Auth query settled with 401  (isFetched=true, user=null) → stays here
  return <FormFlowLanding />;
}
