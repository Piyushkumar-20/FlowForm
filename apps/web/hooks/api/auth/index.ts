"use client";
import { trpc } from "~/trpc/client";

export const useSignup = () => {
  const utils = trpc.useUtils()
  const {
    mutateAsync: createUserWithEmailAndPasswordAsync,
    mutate: createUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
  } = trpc.auth.createUserWithEmailAndPassword.useMutation({
    onSuccess: async() => {
      await utils.auth.getLoggedInUser.invalidate();
    }
  });

  return {
    createUserWithEmailAndPasswordAsync,
    createUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle
  };
};

export const useSignin = () => {
  const utils = trpc.useUtils()
  const {
    mutateAsync: signInUserWithEmailAndPasswordAsync,
    mutate: signInUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
  } = trpc.auth.signInUserWithEmailAndPassword.useMutation({
    onSuccess: async() => {
      await utils.auth.getLoggedInUser.invalidate();
    }
  });

  return {
    signInUserWithEmailAndPasswordAsync,
    signInUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle
  };

};

export const useLogout = () => {
  const utils = trpc.useUtils()
  const { mutateAsync: logoutAsync, isPending } = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.getLoggedInUser.reset();
    },
  });

  return { logoutAsync, isPending };
};

export const useUser = () => {
  const {data: user, isFetched, isFetching, error, isLoading, status} = trpc.auth.getLoggedInUser.useQuery(undefined, {
    retry: false,
  })

  return {
    user,
    isFetched,
    isFetching,
    error,
    isLoading,
    status
  }
}