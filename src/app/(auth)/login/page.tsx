import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Sign in · LLM Gateway",
};

export default function LoginPage() {
  // `useSearchParams()` reads `?next=`, which is dynamic; the Suspense boundary
  // keeps the rest of the route prerenderable.
  return (
    <Suspense fallback={<Skeleton className="h-80 w-full rounded-lg" />}>
      <LoginForm />
    </Suspense>
  );
}
