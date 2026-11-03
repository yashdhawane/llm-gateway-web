# LLM Gateway Web

Dashboard for the [LLM Gateway](../LLM%20Gateway) API: sign in, manage API
keys, browse models and watch usage.

The gateway lives in its own repository. This app is a client of it and nothing
else — no database access, no shared code, no secrets.

| Piece | Where |
| --- | --- |
| Frontend (this repo) | `http://localhost:3000` |
| Gateway API | `http://localhost:4000/api/v1` |
| Gateway contract | `../LLM Gateway/contracts/openapi.json` |
| Integration rules | `../LLM Gateway/docs/FRONTEND_CONTRACT.md` |

The port split is the reason both can run at once: the gateway was moved to 4000
so this app keeps Next.js's conventional 3000.

## Stack

- Next.js **16.4.4** (App Router, Turbopack, React Compiler off)
- React 19, TypeScript, Tailwind CSS v4
- Types generated from the gateway's OpenAPI contract

## Setup

```bash
npm install
cp .env.example .env.local     # already present for local work
npm run dev                    # http://localhost:3000
```

The gateway has to be running for the status card on the home page to turn
green:

```bash
cd "../LLM Gateway" && npm run start:dev
```

## The API contract

`src/api/schema.d.ts` is **generated, never hand-edited**. It comes from the
backend's committed `contracts/openapi.json`:

```bash
npm run contract:types
```

Run it after the backend publishes a contract change (a new route, a renamed
field, a new enum) and commit the result. `src/lib/api.ts` builds on those types,
so a breaking change shows up as a TypeScript error instead of a runtime bug.

If the backend repository is not checked out beside this one, point the script at
the raw file instead:

```bash
npx openapi-typescript https://raw.githubusercontent.com/<owner>/LLM-Gateway/main/contracts/openapi.json -o src/api/schema.d.ts
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server on 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run contract:types` | Regenerate API types from the gateway contract |

## Structure

```text
src/
  api/schema.d.ts          generated from the gateway's OpenAPI contract
  app/                     App Router: layout, home page
  components/              UI
  lib/api.ts               the only module that calls the gateway
```

## Rules this app follows

1. **One client module.** `src/lib/api.ts` owns the base URL, the auth header,
   `credentials: 'include'` and error parsing. Nothing else calls `fetch`
   against the API.
2. **Switch on `error.code`,** never on `error.message`. Every failure is the
   gateway's single error envelope.
3. **Two credentials, never interchangeable.** Dashboard routes take the JWT
   from `/auth/login`; `/chat/completions` and `/models` take an `lg_...` API
   key. Using the wrong one is a 401, not a fallback.
4. **Keep the session in memory.** The JWT is valid for 7 days and cannot be
   revoked, so it must not reach `localStorage`. A refresh cookie arrives in a
   later backend phase; until then only `src/lib/api.ts` and the auth state
   should need to change.
5. **No secrets in `NEXT_PUBLIC_*`.** Those values are inlined into the browser
   bundle.

## CORS

The gateway allows exactly the origins in its `CORS_ORIGINS` list, which
defaults to `http://localhost:3000` in development. A deployed build must be
added there explicitly, or every browser request fails while `curl` keeps
working.
