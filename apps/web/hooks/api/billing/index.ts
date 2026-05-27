"use client";
import { trpc } from "~/trpc/client";

export type SubscriptionPlan = "free" | "pro" | "enterprise";

export const useUpdatePlan = () => {
  const utils = trpc.useUtils();
  const { mutateAsync: updatePlanAsync, isPending } = trpc.billing.updatePlan.useMutation({
    onSuccess: async () => {
      // Refresh the session so ctx.user.plan is up-to-date everywhere
      await utils.auth.getLoggedInUser.invalidate();
    },
  });
  return { updatePlanAsync, isPending };
};

export const useAdminListUserPlans = () => {
  const { data, isLoading, error } = trpc.billing.listUserPlans.useQuery();
  return { users: data ?? [], isLoading, error };
};
