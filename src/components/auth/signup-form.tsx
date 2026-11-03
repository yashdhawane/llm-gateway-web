"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { AuthError } from "@/components/auth/auth-error";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signup, useSession } from "@/lib/auth";
import {
  EMAIL_PATTERN,
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  safeNextPath,
} from "@/lib/auth-rules";
import { describeAuthError, type ErrorCopy } from "@/lib/error-copy";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useSession();
  const next = safeNextPath(searchParams.get("next"));

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<ErrorCopy | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (session) {
      router.replace(next);
    }
  }, [session, next, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length > NAME_MAX_LENGTH) {
      nextErrors.name = `Use ${NAME_MAX_LENGTH} characters or fewer.`;
    }

    if (!trimmedEmail) {
      nextErrors.email = "Enter your email address.";
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      nextErrors.password = `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
    } else if (password.length > PASSWORD_MAX_LENGTH) {
      nextErrors.password = `Use ${PASSWORD_MAX_LENGTH} characters or fewer.`;
    }

    if (confirm !== password) {
      nextErrors.confirm = "Passwords do not match.";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      await signup({
        email: trimmedEmail,
        password,
        name: trimmedName || undefined,
      });
      toast.success("Account created");
    } catch (cause) {
      setError(describeAuthError(cause, "signup"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          One account holds your API keys and usage history.
        </p>
      </div>

      {error && <AuthError error={error} />}

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <FieldGroup>
          <Field data-invalid={Boolean(fieldErrors.name)}>
            <FieldLabel htmlFor="signup-name">
              Name <span className="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Input
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Yash"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError(null);
              }}
              aria-invalid={Boolean(fieldErrors.name)}
              disabled={pending}
            />
            <FieldError errors={[{ message: fieldErrors.name }]} />
          </Field>

          <Field data-invalid={Boolean(fieldErrors.email)}>
            <FieldLabel htmlFor="signup-email">Email</FieldLabel>
            <Input
              id="signup-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="you@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError(null);
              }}
              aria-invalid={Boolean(fieldErrors.email)}
              disabled={pending}
            />
            <FieldError errors={[{ message: fieldErrors.email }]} />
          </Field>

          <Field data-invalid={Boolean(fieldErrors.password)}>
            <FieldLabel htmlFor="signup-password">Password</FieldLabel>
            <PasswordInput
              id="signup-password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(null);
              }}
              aria-invalid={Boolean(fieldErrors.password)}
              disabled={pending}
            />
            <FieldDescription>
              At least {PASSWORD_MIN_LENGTH} characters.
            </FieldDescription>
            <FieldError errors={[{ message: fieldErrors.password }]} />
          </Field>

          <Field data-invalid={Boolean(fieldErrors.confirm)}>
            <FieldLabel htmlFor="signup-confirm">Confirm password</FieldLabel>
            <PasswordInput
              id="signup-confirm"
              name="confirm"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => {
                setConfirm(event.target.value);
                setError(null);
              }}
              aria-invalid={Boolean(fieldErrors.confirm)}
              disabled={pending}
            />
            <FieldError errors={[{ message: fieldErrors.confirm }]} />
          </Field>
        </FieldGroup>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending && <Loader2Icon className="animate-spin" />}
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={
            next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`
          }
          className="font-medium text-foreground underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>

      <p className="border-t pt-4 text-xs text-muted-foreground">
        Signing up also starts a session. It is held in memory, so reloading the
        page signs you out.
      </p>
    </div>
  );
}
