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

export const useAdminListAllForms = () => {
  const { data, isLoading, error } = trpc.admin.listAllForms.useQuery();
  return { forms: data ?? [], isLoading, error };
};

export const useAdminArchiveAnyForm = () => {
  const utils = trpc.useUtils();
  const { mutateAsync, isPending } = trpc.admin.archiveAnyForm.useMutation({
    onSuccess: () => {
      void utils.admin.listAllForms.invalidate();
      void utils.form.getPublicForms.invalidate();
    },
  });
  return { archiveAnyFormAsync: mutateAsync, isPending };
};

export const useAdminUnarchiveAnyForm = () => {
  const utils = trpc.useUtils();
  const { mutateAsync, isPending } = trpc.admin.unarchiveAnyForm.useMutation({
    onSuccess: () => {
      void utils.admin.listAllForms.invalidate();
    },
  });
  return { unarchiveAnyFormAsync: mutateAsync, isPending };
};

export const useAdminDeleteAnyForm = () => {
  const utils = trpc.useUtils();
  const { mutateAsync, isPending } = trpc.admin.deleteAnyForm.useMutation({
    onSuccess: () => {
      void utils.admin.listAllForms.invalidate();
      void utils.admin.getAdminStats.invalidate();
      void utils.form.getPublicForms.invalidate();
    },
  });
  return { deleteAnyFormAsync: mutateAsync, isPending };
};

export const useAdminToggleFeaturedForm = () => {
  const utils = trpc.useUtils();
  const { mutateAsync, isPending } = trpc.admin.toggleFeaturedForm.useMutation({
    onSuccess: () => {
      void utils.admin.listAllForms.invalidate();
      void utils.form.getPublicForms.invalidate();
    },
  });
  return { toggleFeaturedFormAsync: mutateAsync, isPending };
};
