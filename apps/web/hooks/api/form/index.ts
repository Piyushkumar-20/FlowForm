"use client";
import { useMemo } from "react";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";
import { getTRPCErrorMessage } from "~/lib/trpc-error";
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
    onError: (err) => {
      console.error("[useCreateForm] mutation failed:", err.message);
      toast.error(getTRPCErrorMessage(err, "Unable to create form. Please try again."));
    },
  });

  return { CreateFormAsync, CreateForm, error, failureCount, isError, isIdle };
};

type Form = RouterOutputs["form"]["listForms"][number];
export type Field = RouterOutputs["form"]["getFields"][number];

export const useListForms = () => {
  const { data, error, failureCount, isError, isFetching, isLoading } =
    trpc.form.listForms.useQuery();

  // Memoize the fallback so the reference is stable across renders.
  const forms = useMemo(() => (data ?? []) as Form[], [data]);

  return { forms, error, failureCount, isError, isFetching, isLoading };
};

export const useGetFormForDashboard = (formId: string) => {
  const { data: form, isLoading, isFetching, error, refetch } =
    trpc.form.getFormForDashboard.useQuery({ formId }, { enabled: Boolean(formId) });

  return { form, isLoading, isFetching, error, refetch };
};

export const usePublishForm = () => {
  const utils = trpc.useUtils();
  const { mutateAsync: publishFormAsync, isPending } = trpc.form.publishForm.useMutation({
    onSuccess: async (_, variables) => {
      await utils.form.getFormForDashboard.invalidate({ formId: variables.formId });
      await utils.form.listForms.invalidate();
    },
  });
  return { publishFormAsync, isPending };
};

export const useUnpublishForm = () => {
  const utils = trpc.useUtils();
  const { mutateAsync: unpublishFormAsync, isPending } = trpc.form.unpublishForm.useMutation({
    onSuccess: async (_, variables) => {
      await utils.form.getFormForDashboard.invalidate({ formId: variables.formId });
      await utils.form.listForms.invalidate();
    },
  });
  return { unpublishFormAsync, isPending };
};

export const useUpdateForm = () => {
  const utils = trpc.useUtils();
  const { mutateAsync: updateFormAsync, isPending } = trpc.form.updateForm.useMutation({
    onSuccess: async (_, variables) => {
      await utils.form.getFormForDashboard.invalidate({ formId: variables.formId });
      await utils.form.listForms.invalidate();
    },
  });
  return { updateFormAsync, isPending };
};

export const useDeleteForm = () => {
  const utils = trpc.useUtils();
  const { mutateAsync: deleteFormAsync, isPending } = trpc.form.deleteForm.useMutation({
    onSuccess: async () => {
      await utils.form.listForms.invalidate();
    },
  });
  return { deleteFormAsync, isPending };
};

export const useGetFields = (formId: string) => {
  const { data, isFetched, isFetching, isLoading, error, refetch, status } =
    trpc.form.getFields.useQuery({ formId }, { enabled: Boolean(formId) });


  const fields = useMemo(() => data ?? [], [data]);

  return { fields, error, isFetching, isLoading, status, isFetched, refetch };
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
      if (variables.formId !== formId) return;

      utils.form.getFields.setData({ formId }, (fields) => {
        const currentFields = fields ?? [];
        if (currentFields.some((field) => field.id === createdField.id)) return currentFields;
        return [...currentFields, createdField as Field];
      });

      void utils.form.getFields.invalidate({ formId });
      void utils.form.getFields.refetch({ formId });
    },
  });

  return { CreateFieldAsync, CreateField, failureCount, error, isIdle, isSuccess, status };
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

  return { UpdateFieldAsync, UpdateField, failureCount, error, isIdle, isSuccess, status };
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

  return { deleteFieldAsync, deleteField, failureCount, error, isIdle, isSuccess, status };
};

export const useGetFormSubmissions = (formId: string) => {
  const { data, isLoading, isFetching, error, refetch } =
    trpc.form.getFormSubmissions.useQuery({ formId }, { enabled: Boolean(formId) });

  const submissions = useMemo(() => data ?? [], [data]);

  return { submissions, isLoading, isFetching, error, refetch };
};

export const useSubmitForm = () => {
  const {
    mutateAsync: submitFormAsync,
    mutate: submitForm,
    isPending,
    isSuccess,
    error,
    reset,
  } = trpc.form.submitForm.useMutation({
    onError: (err) => {
      toast.error(getTRPCErrorMessage(err, "Failed to submit form. Please try again."));
    },
  });

  return { submitFormAsync, submitForm, isPending, isSuccess, error, reset };
};

export const useGetForm = (formId: string) => {
  const { data: form, isFetched, isFetching, isLoading, error, refetch, status } =
    trpc.form.getForm.useQuery({ formId }, { enabled: Boolean(formId) });

  return { form, error, isFetching, isLoading, status, isFetched, refetch };
};

export const useGetFormBySlug = (slug: string) => {
  const { data: form, isFetched, isFetching, isLoading, error, refetch, status } =
    trpc.form.getFormBySlug.useQuery({ slug }, { enabled: Boolean(slug) });

  return { form, error, isFetching, isLoading, status, isFetched, refetch };
};

export const useCloneForm = () => {
  const utils = trpc.useUtils();
  const { mutateAsync: cloneFormAsync, isPending } = trpc.form.cloneForm.useMutation({
    onSuccess: async () => {
      await utils.form.listForms.invalidate();
    },
  });
  return { cloneFormAsync, isPending };
};

export const useArchiveForm = () => {
  const utils = trpc.useUtils();
  const { mutateAsync: archiveFormAsync, isPending } = trpc.form.archiveForm.useMutation({
    onSuccess: async () => {
      await utils.form.listForms.invalidate();
    },
  });
  return { archiveFormAsync, isPending };
};

export const useRestoreForm = () => {
  const utils = trpc.useUtils();
  const { mutateAsync: restoreFormAsync, isPending } = trpc.form.restoreForm.useMutation({
    onSuccess: async () => {
      await utils.form.listForms.invalidate();
    },
  });
  return { restoreFormAsync, isPending };
};

export const useGetPublicForms = () => {
  const { data, isLoading, error } = trpc.form.getPublicForms.useQuery();
  const forms = useMemo(() => data ?? [], [data]);
  return { forms, isLoading, error };
};
