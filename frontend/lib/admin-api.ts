"use client";

import { useCallback, useEffect, useState } from "react";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type FastApiDetail = string | { loc?: (string | number)[]; msg: string }[];

function detailMessage(detail: FastApiDetail | undefined, fallback: string): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length) {
    return detail
      .map((d) => {
        const field = d.loc?.filter((p) => p !== "body").join(" › ");
        return field ? `${field}: ${d.msg}` : d.msg;
      })
      .join("; ");
  }
  return fallback;
}

/** Calls the backend through the Next.js proxy (`/api/...`). Redirects to sign-in when the session is gone. */
export async function api<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown; formData?: FormData } = {},
): Promise<T> {
  const { method = "GET", body, formData } = options;
  const res = await fetch(`/api${path}`, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
    cache: "no-store",
  });
  if (res.status === 401 && !path.startsWith("/auth/login")) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/admin/login?next=${next}`;
    throw new ApiError(401, "Your session has ended. Please sign in again.");
  }
  if (!res.ok) {
    let detail: FastApiDetail | undefined;
    try {
      detail = (await res.json()).detail;
    } catch {
      // Not JSON: fall back to the status text.
    }
    throw new ApiError(res.status, detailMessage(detail, `Request failed (${res.status})`));
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export function errorText(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}

/** Loads `path` on mount (and whenever it changes). Pass null to skip loading. */
export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(path !== null);

  const reload = useCallback(async () => {
    if (path === null) return;
    setLoading(true);
    try {
      setData(await api<T>(path));
      setError(null);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, setData, error, loading, reload };
}

/** Tracks a save action: "saving", then "saved" (fades after a moment) or an error message. */
export function useSaver() {
  const [state, setState] = useState<{ status: "idle" | "saving" | "saved" | "error"; message?: string }>({ status: "idle" });

  useEffect(() => {
    if (state.status !== "saved") return;
    const timer = setTimeout(() => setState({ status: "idle" }), 2500);
    return () => clearTimeout(timer);
  }, [state.status]);

  const run = useCallback(async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
    setState({ status: "saving" });
    try {
      const result = await action();
      setState({ status: "saved" });
      return result;
    } catch (err) {
      setState({ status: "error", message: errorText(err) });
      return undefined;
    }
  }, []);

  return { ...state, saving: state.status === "saving", run };
}
