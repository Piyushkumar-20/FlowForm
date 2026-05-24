"use client";
import { trpc } from "~/trpc/client";

export const useCreateForm = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: CreateFormAsync,
    mutate: CreateForm,
    error,
    failureCount,
    isError,
    isIdle,
  } = trpc.form.createForm.useMutation({
    onSuccess: async () => {
      await utils.form.invalidate();
    },
  });

  return {
    CreateFormAsync,
    CreateForm,
    error,
    failureCount,
    isError,
    isIdle,
  };
};

export const useListForms = () => {
  const {
    data: forms,
    error,
    failureCount,
    isError,
    isFetching,
    isLoading,
  } = trpc.form.listForms.useQuery();

  return {
    forms,
    error,
    failureCount,
    isError,
    isFetching,
    isLoading,
  };
};
