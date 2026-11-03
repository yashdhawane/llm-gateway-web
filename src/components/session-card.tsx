"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiError } from "@/lib/api";
import { fetchProfile, logout, useSession, type Profile } from "@/lib/auth";

/**
 * Shows who is signed in and proves the JWT is accepted by a protected route.
 *
 * `/auth/me` is the check: a token that the guard rejects means the session is
 * over, so the card closes it and sends the user back to the login screen
 * instead of leaving a dashboard that answers 401 to everything.
 */
export function SessionCard() {
  const session = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    if (!session) {
      return;
    }

    let active = true;

    void fetchProfile(session.accessToken)
      .then((next) => {
        if (active) {
          setProfile(next);
        }
      })
      .catch((cause: unknown) => {
        if (!active) {
          return;
        }

        if (cause instanceof ApiError && cause.code === "AUTHENTICATION_ERROR") {
          logout();
          toast.error("Your session expired. Sign in again.");
          router.replace("/login");
        }
      })
      .finally(() => {
        if (active) {
          setVerifying(false);
        }
      });

    return () => {
      active = false;
    };
  }, [session, router]);

  if (!session) {
    return null;
  }

  const user = profile ?? session.user;

  const signOut = () => {
    logout();
    toast.success("Signed out");
    router.replace("/login");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session</CardTitle>
        <CardDescription>
          Signed in with the JWT from the login response. The profile is read
          back from{" "}
          <span className="font-mono text-foreground">GET /auth/me</span>.
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOutIcon />
            Sign out
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-3">
        <dl className="grid gap-2 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-6">
          <dt className="text-muted-foreground">Email</dt>
          <dd className="font-medium break-all">{user.email}</dd>

          <dt className="text-muted-foreground">Name</dt>
          <dd>{user.name?.trim() || "—"}</dd>

          <dt className="text-muted-foreground">Role</dt>
          <dd>
            <Badge variant="outline">{user.role}</Badge>
          </dd>

          {profile && (
            <>
              <dt className="text-muted-foreground">Member since</dt>
              <dd>{new Date(profile.createdAt).toLocaleDateString()}</dd>
            </>
          )}
        </dl>

        <p className="text-xs text-muted-foreground">
          {verifying ? "Verifying with /auth/me…" : "Token accepted by /auth/me."}
        </p>
      </CardContent>
    </Card>
  );
}
