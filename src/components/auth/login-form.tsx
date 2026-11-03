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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { login, useSession } from "@/lib/auth";
import { EMAIL_PATTERN, safeNextPath } from "@/lib/auth-rules";
import { describeAuthError, type ErrorCopy } from "@/lib/error-copy";

interface FieldErrors {
  email?: string;
  password?: string;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useSession();
  const next = safeNextPath(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<ErrorCopy | null>(null);
  const [pending, setPending] = useState(false);

  // Covers both cases: arriving here while already signed in, and the moment
  // `login()` puts a session in the store.
  useEffect(() => {
    if (session) {
      router.replace(next);
    }
  }, [session, next, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Enter your email address.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Enter your password.";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      await login({ email: email.trim(), password });
      toast.success("Signed in");
    } catch (cause) {
      setError(describeAuthError(cause, "signin"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to manage API keys and see your usage.
        </p>
      </div>

      {error && <AuthError error={error} />}

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <FieldGroup>
          <Field data-invalid={Boolean(fieldErrors.email)}>
            <FieldLabel htmlFor="login-email">Email</FieldLabel>
            <Input
              id="login-email"
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
            <FieldLabel htmlFor="login-password">Password</FieldLabel>
            <PasswordInput
              id="login-password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(null);
              }}
              aria-invalid={Boolean(fieldErrors.password)}
              disabled={pending}
            />
            <FieldError errors={[{ message: fieldErrors.password }]} />
          </Field>
        </FieldGroup>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending && <Loader2Icon className="animate-spin" />}
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        No account?{" "}
        <Link
          href={
            next === "/" ? "/signup" : `/signup?next=${encodeURIComponent(next)}`
          }
          className="font-medium text-foreground underline underline-offset-4"
        >
          Create one
        </Link>
      </p>

      <p className="border-t pt-4 text-xs text-muted-foreground">
        Sessions are held in memory, never in browser storage, so reloading the
        page signs you out.
      </p>
    </div>
  );
}
