import { OctagonXIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ErrorCopy } from "@/lib/error-copy";

/**
 * One error surface for both auth forms.
 *
 * The code and trace ID are shown, not hidden: the contract says the trace ID
 * is the only way to find the failing request in the gateway's log.
 */
export function AuthError({ error }: { error: ErrorCopy }) {
  return (
    <Alert variant="destructive">
      <OctagonXIcon />
      <AlertTitle>{error.title}</AlertTitle>
      <AlertDescription>
        <p>{error.message}</p>
        {error.code && (
          <p className="mt-1 font-mono text-xs break-all opacity-70">
            {error.code}
            {error.traceId ? ` · trace ${error.traceId}` : ""}
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}
