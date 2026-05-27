type TRPCLikeError = {
  message?: string;
  data?: { code?: string } | null;
  // tRPC v11 puts the code directly on the error in some paths
  shape?: { data?: { code?: string } };
};

export function getTRPCErrorMessage(
  err: TRPCLikeError | null | undefined,
  fallback = "Something went wrong. Please try again."
): string {
  if (!err) return fallback;

  const code = err.data?.code ?? err.shape?.data?.code;

  switch (code) {
    case "UNAUTHORIZED":
      return "Session expired. Please log in again.";
    case "FORBIDDEN":
      return "You don't have permission to do this.";
    case "CONFLICT":
      // Let the server's specific message through for conflicts (e.g. duplicate email).
      return err.message || "This resource already exists.";
    case "NOT_FOUND":
      return err.message || "The requested resource was not found.";
    case "BAD_REQUEST":
      // Validation errors — server message is usually safe to show.
      return err.message || "Invalid request. Please check your inputs.";
    case "TOO_MANY_REQUESTS":
      return "Too many requests. Please wait a moment and try again.";
    case "INTERNAL_SERVER_ERROR":
      return fallback;
    default:
      // Pass the server message through if present and no sensitive code.
      return err.message || fallback;
  }
}
