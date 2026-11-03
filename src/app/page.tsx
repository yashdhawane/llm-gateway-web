import { BackendStatus } from "@/components/backend-status";
import { API_BASE_URL } from "@/lib/api";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center gap-8 p-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">LLM Gateway</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Dashboard for the gateway in the sibling repository: sessions, API
          keys, models and usage.
        </p>
      </header>

      <BackendStatus />

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-neutral-500 dark:text-neutral-400">API base</dt>
        <dd className="font-mono">{API_BASE_URL}</dd>
        <dt className="text-neutral-500 dark:text-neutral-400">Contract</dt>
        <dd className="font-mono">src/api/schema.d.ts</dd>
      </dl>

      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Scaffold only. Sign-in, key management and the chat playground come
        next.
      </p>
    </main>
  );
}
