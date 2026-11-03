import { BackendStatus } from "@/components/backend-status";
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
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 pt-6 pb-16">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            LLM Gateway
          </h1>
          <Badge variant="secondary">scaffold</Badge>
        </div>
        <p className="max-w-xl text-muted-foreground">
          Dashboard for the gateway in the sibling repository: sessions, API
          keys, models and usage.
        </p>
      </header>

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
          <CardDescription>The order the remaining screens will land in.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>Sign in with the gateway JWT.</li>
            <li>Create, list and revoke API keys.</li>
            <li>Chat playground over SSE, once the backend streams.</li>
          </ol>
        </CardContent>
      </Card>
    </main>
  );
}
