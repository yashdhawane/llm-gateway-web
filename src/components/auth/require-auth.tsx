"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth";

function GateSkeleton() {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-6 pt-8 pb-16">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
    </main>
  );
}

/**
 * Client-side gate for dashboard routes.
 *
 * There is no server-side session to read: the JWT lives only in memory, by
 * design. So the guard runs after hydration, shows a skeleton in the meantime,
 * and sends an unauthenticated visitor to `/login` with the path to return to.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const session = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [session, pathname, router]);

  if (!session) {
    return <GateSkeleton />;
  }

  return <>{children}</>;
}
