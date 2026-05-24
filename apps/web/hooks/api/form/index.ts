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

export const useGetFields = (formId: string) => {
  const {data: fields, isFetched, isFetching, isLoading, error, status} = trpc.form.getFields.useQuery({formId})

  return {
    fields,
    error,
    isFetching,
    isLoading,
    status,
    isFetched
  }
}

export const useCreateField = (formId: string) => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: CreateFieldAsync,
    mutate: CreateField,
    error,
    failureCount,
    isIdle,
    isSuccess,
    status
  } = trpc.form.createField.useMutation({
    onSuccess: async () => {
      await utils.form.getFields.invalidate({ formId });
    },
  });

return {
    CreateFieldAsync,
    CreateField,
    failureCount,
    error,
    isIdle,
    isSuccess,
    status
  }

}

export const useUpdateField = (formId: string) => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: UpdateFieldAsync,
    mutate: UpdateField,
    error,
    failureCount,
    isIdle,
    isSuccess,
    status
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
    status
  }
}

export const useDeleteField = (formId: string) => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: deleteFieldAsync,
    mutate: deleteField,
    error,
    failureCount,
    isIdle,
    isSuccess,
    status
  } = trpc.form.updateField.useMutation({
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
    status
  }
}