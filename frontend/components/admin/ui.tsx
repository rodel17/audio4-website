"use client";

import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useId } from "react";
import type { InquiryStatus } from "@/lib/types";

export const btn = {
  primary:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-brand px-4 text-sm font-bold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60",
  secondary:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-field bg-white px-4 text-sm font-semibold text-ink transition hover:border-ink disabled:cursor-not-allowed disabled:opacity-60",
  dark: "inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60",
  danger:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#f3c2c5] bg-white px-4 text-sm font-bold text-[#a3000a] transition hover:bg-[#fff7f7] disabled:cursor-not-allowed disabled:opacity-60",
  dashed:
    "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md border border-dashed border-[#c4c8cd] bg-white px-3 text-sm font-semibold transition hover:border-ink",
  icon: "grid size-10 shrink-0 place-items-center rounded-md text-muted transition hover:bg-canvas hover:text-ink disabled:opacity-30",
};

export const inputClass =
  "w-full min-h-10 rounded-md border border-field bg-white px-3 text-sm text-ink outline-none transition placeholder:text-neutral-400 focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-canvas";

export function PageHeader({
  title,
  description,
  back,
  actions,
}: {
  title: string;
  description?: string;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {back && (
          <Link href={back.href} className="text-sm font-semibold text-muted hover:text-ink">
            ← {back.label}
          </Link>
        )}
        <h1 className={`text-[26px] font-extrabold tracking-tight ${back ? "mt-1.5" : ""}`}>{title}</h1>
        {description && <p className="mt-1 text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  description,
  actions,
  children,
  className = "",
  id,
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-6 rounded-lg border border-line bg-white p-6 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-bold">{title}</h2>}
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

/** A labelled control. `children` receives the generated id. */
export function Field({
  label,
  hint,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: (id: string) => React.ReactNode;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold">
        {label}
        {hint && <span className="font-normal text-muted"> — {hint}</span>}
      </label>
      {children(id)}
    </div>
  );
}

export function TextField({
  label,
  hint,
  value,
  onChange,
  className,
  ...props
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "className">) {
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => <input id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} {...props} />}
    </Field>
  );
}

export function TextAreaField({
  label,
  hint,
  value,
  onChange,
  rows = 3,
  className,
  maxLength,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  className?: string;
  maxLength?: number;
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => (
        <textarea
          id={id}
          rows={rows}
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} resize-y py-2.5 leading-relaxed`}
        />
      )}
    </Field>
  );
}

export function SelectField<T extends string>({
  label,
  hint,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  hint?: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)} className={inputClass}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

export function Checkbox({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-brand" />
      <span>
        <span className="font-semibold">{label}</span>
        {description && <span className="block text-xs text-muted">{description}</span>}
      </span>
    </label>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "warning"; children: React.ReactNode }) {
  const styles = {
    info: "border-line bg-white text-ink",
    error: "border-[#f3c2c5] bg-[#fff7f7] text-[#7a0008]",
    warning: "border-[#f3d9a8] bg-[#fdf6e7] text-[#6b4300]",
  }[tone];
  return (
    <div role={tone === "error" ? "alert" : undefined} className={`flex gap-2.5 rounded-md border px-4 py-3 text-sm ${styles}`}>
      {tone !== "info" && <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />}
      <div>{children}</div>
    </div>
  );
}

export function SaveStatus({ status, message }: { status: "idle" | "saving" | "saved" | "error"; message?: string }) {
  if (status === "saving")
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-muted" role="status">
        <LoaderCircle className="size-4 animate-spin" aria-hidden /> Saving…
      </span>
    );
  if (status === "saved")
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1f6b40]" role="status">
        <CircleCheck className="size-4" aria-hidden /> Saved
      </span>
    );
  if (status === "error")
    return (
      <span className="max-w-md text-sm font-semibold text-[#a3000a]" role="alert">
        {message}
      </span>
    );
  return null;
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-10 text-muted" role="status">
      <LoaderCircle className="size-5 animate-spin" aria-hidden />
      {label}
    </div>
  );
}

const statusStyles: Record<InquiryStatus, [string, string]> = {
  new: ["New", "bg-[#fde8e9] text-[#a3000a]"],
  contacted: ["Contacted", "bg-[#e6f0fb] text-[#1d4f8f]"],
  quoted: ["Quoted", "bg-[#fdf1dc] text-[#8a5300]"],
  won: ["Closed — won", "bg-[#e7f4ec] text-[#1f6b40]"],
  lost: ["Closed — lost", "bg-[#eceef0] text-[#4b5058]"],
};

export const inquiryStatusOptions = (Object.keys(statusStyles) as InquiryStatus[]).map((value) => ({
  value,
  label: statusStyles[value][0],
}));

export function InquiryStatusPill({ status }: { status: InquiryStatus }) {
  const [label, style] = statusStyles[status];
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${style}`}>{label}</span>;
}

export function PublishedPill({ published }: { published: boolean }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
        published ? "bg-[#e7f4ec] text-[#1f6b40]" : "bg-[#eceef0] text-[#4b5058]"
      }`}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}
