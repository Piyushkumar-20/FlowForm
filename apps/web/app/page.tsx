"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "~/hooks/api/auth";
import FormFlowLanding from "~/components/form-flow-landing";

export default function Home() {
  const { user, isLoading, isFetching } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isFetching && user?.id) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, isFetching, router]);

  if (isLoading || isFetching) return null;
  if (user?.id) return null;

  return <FormFlowLanding />;
}
