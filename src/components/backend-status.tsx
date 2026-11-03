"use client";

import { useEffect, useState } from "react";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  Loader2Icon,
  RefreshCwIcon,
} from "lucide-react";

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
import { healthUrl } from "@/lib/api";

interface Health {
  status: string;
  db: string;
  uptimeSeconds: number;
}

type State =
  | { kind: "checking" }
  | { kind: "up"; health: Health }
  | { kind: "down"; message: string };

/** Seconds are precise but unreadable; minutes and hours are what a human wants. */
function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }

  return `${seconds}s`;
}

/**
 * Reads the public readiness probe.
 *
 * A plain function that returns the next state instead of calling `setState`
 * itself: the effect and the button need the same request, and the effect can
 * then settle it in a promise callback rather than a synchronous update.
 */
async function probe(): Promise<State> {
  try {
    const response = await fetch(healthUrl(), {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        kind: "down",
        message: `The gateway answered ${response.status}.`,
      };
    }

    return { kind: "up", health: (await response.json()) as Health };
  } catch {
    return {
      kind: "down",
      message: `Could not reach ${healthUrl()}. Start the gateway, or set NEXT_PUBLIC_API_BASE_URL.`,
    };
  }
}

/**
 * Proves the two things that break first when the frontend and the gateway are
 * wired together: the base URL, and browser access (CORS). A failure here is a
 * configuration problem, not a UI problem.
 */
export function BackendStatus() {
  const [state, setState] = useState<State>({ kind: "checking" });

  useEffect(() => {
    let active = true;

    void probe().then((next) => {
      if (active) {
        setState(next);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const recheck = () => {
    setState({ kind: "checking" });
    void probe().then(setState);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gateway</CardTitle>
        <CardDescription>
          Live readiness probe from the browser. This proves the base URL and
          CORS before any feature depends on them.
        </CardDescription>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            onClick={recheck}
            disabled={state.kind === "checking"}
          >
            {state.kind === "checking" ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <RefreshCwIcon />
            )}
            Recheck
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-2">
        {state.kind === "checking" && (
          <Badge variant="secondary">
            <Loader2Icon className="animate-spin" />
            Checking
          </Badge>
        )}

        {state.kind === "up" && (
          <>
            <Badge variant="outline">
              <CircleCheckIcon />
              {state.health.status} · db {state.health.db}
            </Badge>
            <p className="text-sm text-muted-foreground">
              Up {formatUptime(state.health.uptimeSeconds)}
            </p>
          </>
        )}

        {state.kind === "down" && (
          <>
            <Badge variant="destructive">
              <CircleAlertIcon />
              Unreachable
            </Badge>
            <p className="text-sm text-muted-foreground">{state.message}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
