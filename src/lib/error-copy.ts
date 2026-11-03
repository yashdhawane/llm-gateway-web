import { ApiError } from "@/lib/api";

/** Everything an error surface needs, already phrased for a human. */
export interface ErrorCopy {
  title: string;
  message: string;
  code?: string;
  traceId?: string;
}

type AuthAction = "signin" | "signup";

/**
 * Turns the gateway's error envelope into copy.
 *
 * Switching on `code` rather than `message` is the contract rule: the backend
 * owns the code, the frontend owns the wording. `traceId` is carried through
 * so a user can quote it and the request can be found in the gateway log.
 */
export function describeAuthError(
  error: unknown,
  action: AuthAction,
): ErrorCopy {
  if (error instanceof ApiError) {
    const shared = { code: error.code, traceId: error.traceId };

    switch (error.code) {
      case "AUTHENTICATION_ERROR":
        return {
          ...shared,
          title: "Could not sign in",
          message:
            action === "signin"
              ? "That email and password combination does not match an account."
              : "The account was created but the session could not be started. Try signing in.",
        };

      case "EMAIL_ALREADY_EXISTS":
        return {
          ...shared,
          title: "Email already registered",
          message:
            "An account with this email already exists. Sign in instead, or use a different address.",
        };

      case "VALIDATION_ERROR":
        return {
          ...shared,
          title: "Check the form",
          message: error.message,
        };

      case "RATE_LIMIT_ERROR":
        return {
          ...shared,
          title: "Too many attempts",
          message: "Wait a moment before trying again.",
        };

      case "NETWORK_ERROR":
        return {
          ...shared,
          title: "Gateway unreachable",
          message: error.message,
        };

      default:
        return {
          ...shared,
          title: "Something went wrong",
          message: error.message,
        };
    }
  }

  return {
    title: "Something went wrong",
    message: "The request failed before the gateway answered. Try again.",
  };
}
