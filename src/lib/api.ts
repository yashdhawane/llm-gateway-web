/**
 * The one place that talks to the gateway.
 *
 * Every rule from the backend's `docs/FRONTEND_CONTRACT.md` lives here once:
 * the base URL, the auth header, `credentials: 'include'` (required for the
 * refresh cookie that lands later), the error envelope, and the trace ID that
 * makes a failure findable in the gateway's request log.
 */
import type { components } from "@/api/schema";

const DEFAULT_BASE_URL = "http://localhost:4000/api/v1";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_BASE_URL
).replace(/\/+$/, "");

export type ChatRequest = components["schemas"]["ChatCompletionRequestDto"];
export type ChatResponse = components["schemas"]["ChatCompletionResponseDto"];
export type ModelList = components["schemas"]["ModelListDto"];
export type LoginRequest = components["schemas"]["LoginDto"];
export type SignupRequest = components["schemas"]["SignupDto"];

/** The envelope the gateway returns for every failure, without exception. */
export interface ApiErrorBody {
  message: string;
  type: string;
  param: string | null;
  code: string;
  trace_id?: string;
  status_code: number;
  timestamp: string;
}

/**
 * Branch on `code`, never on `message`: the message is for humans and the code
 * is the contract. `traceId` is the only handle the backend support flow needs.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly type: string;
  readonly param: string | null;
  readonly traceId: string | undefined;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.status = status;
    this.code = body.code;
    this.type = body.type;
    this.param = body.param;
    this.traceId = body.trace_id;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
  /** JWT for dashboard routes, or an `lg_...` API key for chat and models. */
  token?: string;
  signal?: AbortSignal;
}

/** Joins the base URL and a path exactly once, whatever the caller passes. */
function resolveUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** `/health` deliberately sits outside the versioned prefix. */
export function healthUrl(): string {
  return API_BASE_URL.replace(/\/api\/v\d+\/?$/, "") + "/health";
}

function isErrorBody(value: unknown): value is { error: ApiErrorBody } {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = (value as { error?: unknown }).error;

  return (
    typeof candidate === "object" &&
    candidate !== null &&
    typeof (candidate as ApiErrorBody).code === "string"
  );
}

/**
 * Calls the gateway and returns the parsed body.
 *
 * Throws `ApiError` for both HTTP failures and transport failures (a fetch
 * rejection becomes `code: "NETWORK_ERROR"`), so callers only ever handle one
 * error type.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, token, signal } = options;

  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers["content-type"] = "application/json";
  }

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(resolveUrl(path), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "include",
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new ApiError(0, {
      message:
        "Could not reach the gateway. Is it running on the configured base URL?",
      type: "server_error",
      param: null,
      code: "NETWORK_ERROR",
      status_code: 0,
      timestamp: new Date().toISOString(),
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const payload: unknown = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    if (isErrorBody(payload)) {
      throw new ApiError(response.status, payload.error);
    }

    throw new ApiError(response.status, {
      message: `Unexpected ${response.status} response from the gateway.`,
      type: "server_error",
      param: null,
      code: "UNEXPECTED_RESPONSE",
      status_code: response.status,
      timestamp: new Date().toISOString(),
    });
  }

  return payload as T;
}
