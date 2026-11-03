import type { ReactNode } from "react";
import Link from "next/link";
import { WaypointsIcon } from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";

/**
 * Chrome for the signed-out routes: no navigation, no session, one centred card.
 * The dashboard header lives in the `(app)` layout instead.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-6 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,var(--color-muted),transparent_70%)]"
      />

      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="relative w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <WaypointsIcon className="size-4" />
          </span>
          <span className="font-heading text-sm font-medium">LLM Gateway</span>
        </Link>

        <div className="rounded-xl bg-card p-6 text-card-foreground ring-1 ring-foreground/10">
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Self-hosted gateway · JWT sessions expire after 7 days
        </p>
      </div>
    </div>
  );
}
