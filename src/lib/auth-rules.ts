/**
 * Client-side mirrors of the gateway's `SignupDto` / `LoginDto` rules.
 *
 * They exist to give immediate feedback, not to be authoritative: the backend
 * still validates, and a mismatch surfaces as `VALIDATION_ERROR` with the same
 * field named in `param`.
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** `MinLength(8)` on SignupDto. */
export const PASSWORD_MIN_LENGTH = 8;

/** `MaxLength(72)` on SignupDto — bcrypt only uses the first 72 bytes. */
export const PASSWORD_MAX_LENGTH = 72;

/** `MaxLength(80)` on SignupDto. */
export const NAME_MAX_LENGTH = 80;

/**
 * Only same-site paths may be used as a post-login destination, otherwise
 * `?next=` becomes an open redirect.
 */
export function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}
