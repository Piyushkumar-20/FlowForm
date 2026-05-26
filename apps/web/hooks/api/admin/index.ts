"use client";
import { trpc } from "~/trpc/client";

export const useAdminStats = () => {
  const { data, isLoading, error } = trpc.admin.getAdminStats.useQuery();
  return {
    stats: data ?? { totalUsers: 0, totalForms: 0, totalSubmissions: 0 },
    isLoading,
    error,
  };
};

export const useAdminRecentData = () => {
  const { data, isLoading, error } = trpc.admin.getAdminRecentData.useQuery();
  return {
    recentUsers: data?.recentUsers ?? [],
    recentForms: data?.recentForms ?? [],
    isLoading,
    error,
  };
};
