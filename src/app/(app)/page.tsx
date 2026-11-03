import { BackendStatus } from "@/components/backend-status";
import { RequireAuth } from "@/components/auth/require-auth";
import { SessionCard } from "@/components/session-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/api";

export default function Home() {
  return (
    <RequireAuth>
      <main className="mx-auto w-full max-w-4xl px-6 pt-8 pb-16">
        <div className="flex flex-col gap-6">
          <header className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-heading text-3xl font-semibold tracking-tight">
                Dashboard
              </h1>
              <Badge variant="secondary">scaffold</Badge>
            </div>
            <p className="max-w-xl text-muted-foreground">
              Sessions, API keys, models and usage, all backed by the gateway in
              the sibling repository.
            </p>
          </header>

          <SessionCard />

          <BackendStatus />

          <Card>
            <CardHeader>
              <CardTitle>Wiring</CardTitle>
              <CardDescription>
                Two values decide whether this app can talk to the gateway.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-2 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-6">
                <dt className="text-muted-foreground">API base</dt>
                <dd className="font-mono break-all">{API_BASE_URL}</dd>
                <dt className="text-muted-foreground">Contract</dt>
                <dd className="font-mono">src/api/schema.d.ts</dd>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next</CardTitle>
              <CardDescription>
                The order the remaining screens will land in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
                <li>Create, list and revoke API keys.</li>
                <li>Chat playground over SSE, once the backend streams.</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </main>
    </RequireAuth>
  );
}
