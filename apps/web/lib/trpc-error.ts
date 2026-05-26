type TRPCLikeError = {
  message?: string;
  data?: { code?: string } | null;
};

export function getTRPCErrorMessage(
  err: TRPCLikeError | null | undefined,
  fallback = "Something went wrong. Please try again."
): string {
  if (!err) return fallback;
  const code = err.data?.code;
  if (code === "UNAUTHORIZED") return "Session expired. Please log in again.";
  if (code === "FORBIDDEN") return "You don't have permission to do this.";
  if (code === "INTERNAL_SERVER_ERROR") return fallback;
  return err.message || fallback;
}
