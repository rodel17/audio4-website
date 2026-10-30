"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { inputClass } from "@/components/admin/ui";
import { api, errorText } from "@/lib/admin-api";

function safeNext(next: string | null): string {
  // Only allow redirects back into the admin.
  return next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await api("/auth/login", { method: "POST", body: { email: data.get("email"), password: data.get("password") } });
      router.replace(safeNext(params.get("next")));
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-line bg-white p-7">
      <div>
        <h1 className="text-xl font-extrabold">Sign in</h1>
        <p className="mt-1 text-sm text-muted">Manage the website content, catalog and inquiries.</p>
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold">
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="username" autoFocus className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-[13px] font-semibold">
          Password
        </label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </div>
      {error && (
        <p role="alert" className="rounded-md border border-[#f3c2c5] bg-[#fff7f7] px-3 py-2 text-sm text-[#7a0008]">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand font-bold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {busy && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
        Sign in
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink px-4 py-10 text-ink">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center">
          <span className="display text-4xl tracking-tight">
            <span className="text-[#e5323d]">Audio</span>
            <span className="mx-0.5 text-[1.35em] text-white">4</span>
            <span className="text-[#e5323d]">Design</span>
          </span>
          <span className="tag-bar -mt-1 text-[10px]!">Admin</span>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
