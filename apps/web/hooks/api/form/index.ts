"use client";
import { trpc } from "~/trpc/client";
import type { RouterOutputs } from "../../../../../packages/trpc/client/index";

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

type Form = RouterOutputs["form"]["listForms"][number];
export type Field = RouterOutputs["form"]["getFields"][number];

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
    forms: (forms ?? []) as Form[],
    error,
    failureCount,
    isError,
    isFetching,
    isLoading,
  };
};

export const useGetFields = (formId: string) => {
  const {
    data: fields,
    isFetched,
    isFetching,
    isLoading,
    error,
    refetch,
    status,
  } = trpc.form.getFields.useQuery({ formId }, { enabled: Boolean(formId) });

  return {
    fields: fields ?? [],
    error,
    isFetching,
    isLoading,
    status,
    isFetched,
    refetch,
  };
};

export const useCreateField = (formId: string) => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: CreateFieldAsync,
    mutate: CreateField,
    error,
    failureCount,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.createField.useMutation({
    onSuccess: (createdField, variables) => {
      if (variables.formId !== formId) {
        return;
      }

      utils.form.getFields.setData({ formId }, (fields) => {
        const currentFields = fields ?? [];
        const fieldAlreadyRendered = currentFields.some((field) => field.id === createdField.id);

        if (fieldAlreadyRendered) {
          return currentFields;
        }

        return [...currentFields, createdField as Field];
      });

      void utils.form.getFields.invalidate({ formId });
      void utils.form.getFields.refetch({ formId });
    },
  });

  return {
    CreateFieldAsync,
    CreateField,
    failureCount,
    error,
    isIdle,
    isSuccess,
    status,
  };
};

export const useUpdateField = (formId: string) => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: UpdateFieldAsync,
    mutate: UpdateField,
    error,
    failureCount,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.updateField.useMutation({
    onSuccess: async () => {
      await utils.form.getFields.invalidate({ formId });
    },
  });

  return {
    UpdateFieldAsync,
    UpdateField,
    failureCount,
    error,
    isIdle,
    isSuccess,
    status,
  };
};

export const useDeleteField = (formId: string) => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: deleteFieldAsync,
    mutate: deleteField,
    error,
    failureCount,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.deleteField.useMutation({
    onSuccess: async () => {
      await utils.form.getFields.invalidate({ formId });
    },
  });

  return {
    deleteFieldAsync,
    deleteField,
    failureCount,
    error,
    isIdle,
    isSuccess,
    status,
  };
};
