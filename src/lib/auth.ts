"use client";

import { useSyncExternalStore } from "react";

import {
  apiRequest,
  type LoginRequest,
  type SignupRequest,
} from "@/lib/api";

/**
 * The session store, and the only module that knows where the JWT lives.
 *
 * The backend contract does not publish a response schema for `/auth/login` or
 * `/auth/signup` — the routes return the object below without a Swagger
 * response model — so the shape is written from `docs/FRONTEND_CONTRACT.md` §3.
 *
 * Storage rule (contract §3): memory only. Not `localStorage`, not
 * `sessionStorage`: the token lasts 7 days and cannot be revoked, so a single
 * XSS would hand over a week of access. The cost is that a reload signs you
 * out; the refresh-token phase replaces this file with a 15-minute access token
 * plus an httpOnly cookie, and nothing else should need to change.
 */
export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export interface Session {
  accessToken: string;
  user: SessionUser;
}

/** `GET /auth/me` returns the user plus the row's creation time. */
export interface Profile extends SessionUser {
  createdAt: string;
}

let session: Session | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function snapshot(): Session | null {
  return session;
}

/**
 * The server renders as signed out, which is also the truth before any login
 * has happened on the client. Returning `null` here keeps hydration consistent.
 */
function serverSnapshot(): null {
  return null;
}

export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

export function getAccessToken(): string | null {
  return session?.accessToken ?? null;
}

export async function login(input: LoginRequest): Promise<Session> {
  const next = await apiRequest<Session>("/auth/login", {
    method: "POST",
    body: input,
  });

  session = next;
  emit();

  return next;
}

export async function signup(input: SignupRequest): Promise<Session> {
  const next = await apiRequest<Session>("/auth/signup", {
    method: "POST",
    body: input,
  });

  session = next;
  emit();

  return next;
}

export function fetchProfile(token: string): Promise<Profile> {
  return apiRequest<Profile>("/auth/me", { token });
}

/**
 * Local only: the backend has no logout endpoint yet, so the token stays valid
 * server-side until it expires. This closes the session in this tab.
 */
export function logout(): void {
  session = null;
  emit();
}
