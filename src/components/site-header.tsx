"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOutIcon, WaypointsIcon } from "lucide-react";
import { toast } from "sonner";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { logout, useSession } from "@/lib/auth";

/** App chrome for signed-in routes. The signature-invariant lives in the store. */
export function SiteHeader() {
  const session = useSession();
  const router = useRouter();

  const signOut = () => {
    logout();
    toast.success("Signed out");
    router.replace("/login");
  };

  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <WaypointsIcon className="size-4" />
          </span>
          <span className="text-sm font-medium">LLM Gateway</span>
        </Link>

        <div className="flex items-center gap-1.5">
          {session && (
            <>
              <span className="hidden max-w-56 truncate text-sm text-muted-foreground sm:inline">
                {session.user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOutIcon />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
