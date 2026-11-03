"use client";

import { useEffect, useState } from "react";
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

/**
 * Reads the public readiness probe.
 *
 * Deliberately a plain function that returns the next state instead of calling
 * `setState` itself: the effect and the button both need the same request, and
 * keeping the fetch free of React state lets the effect settle it in a promise
 * callback rather than a synchronous update.
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
    <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          Gateway
        </h2>
        <button
          type="button"
          onClick={recheck}
          className="rounded-md border border-neutral-300 px-3 py-1 text-sm transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          Recheck
        </button>
      </div>

      <p className="mt-3 text-lg font-semibold">
        {state.kind === "checking" && "Checking…"}
        {state.kind === "up" && (
          <span className="text-emerald-600 dark:text-emerald-400">
            {state.health.status} · db {state.health.db}
          </span>
        )}
        {state.kind === "down" && (
          <span className="text-red-600 dark:text-red-400">Unreachable</span>
        )}
      </p>

      {state.kind === "up" && (
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Up {state.health.uptimeSeconds}s
        </p>
      )}

      {state.kind === "down" && (
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {state.message}
        </p>
      )}
    </section>
  );
}
