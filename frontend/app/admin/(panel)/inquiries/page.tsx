"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  InquiryStatusPill,
  Loading,
  Notice,
  PageHeader,
  SaveStatus,
  SelectField,
  TextAreaField,
  TextField,
  btn,
  inputClass,
  inquiryStatusOptions,
} from "@/components/admin/ui";
import { api, useApi, useSaver } from "@/lib/admin-api";
import { formatDate, telHref, timeAgo } from "@/lib/format";
import type { Inquiry, InquiryStatus } from "@/lib/types";

type ListResponse = { items: Inquiry[]; counts: Record<"all" | "new" | "contacted" | "quoted" | "closed", number> };

const tabs = [
  { value: "", label: "All", count: "all" },
  { value: "new", label: "New", count: "new" },
  { value: "contacted", label: "Contacted", count: "contacted" },
  { value: "quoted", label: "Quoted", count: "quoted" },
  { value: "closed", label: "Closed", count: "closed" },
] as const;

const preferLabels = { phone: "Phone call", email: "Email", either: "Either" };

function InquiryDetail({ id, onChanged }: { id: number; onChanged: (inquiry: Inquiry) => void }) {
  const { data, setData, error } = useApi<Inquiry>(`/admin/inquiries/${id}`);
  const saver = useSaver();
  const [draft, setDraft] = useState<{ status: InquiryStatus; assignee: string; notes: string } | null>(null);

  useEffect(() => {
    if (data) setDraft({ status: data.status, assignee: data.assignee, notes: data.notes });
  }, [data]);

  if (error) return <Notice tone="error">{error}</Notice>;
  if (!data || !draft) return <Loading />;

  const dirty = draft.status !== data.status || draft.assignee !== data.assignee || draft.notes !== data.notes;

  async function save() {
    const updated = await saver.run(() => api<Inquiry>(`/admin/inquiries/${id}`, { method: "PATCH", body: draft }));
    if (updated) {
      setData(updated);
      onChanged(updated);
    }
  }

  const facts = [
    ["Interested in", data.subject],
    ["Quantity", data.quantity || "—"],
    ["Email", data.email],
    ["Phone", data.phone],
    ["Prefers", preferLabels[data.preferredContact] ?? data.preferredContact],
  ];

  return (
    <article className="rounded-lg border border-line bg-white">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-6 py-5">
        <div>
          <h2 className="text-xl font-extrabold">{data.name}</h2>
          <p className="mt-1 text-muted">
            {data.company ? `${data.company} · ` : ""}received {formatDate(data.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={telHref(data.phone)} className={btn.secondary}>
            Call
          </a>
          <a href={`mailto:${data.email}?subject=${encodeURIComponent(`Re: ${data.subject}`)}`} className={btn.primary}>
            Reply by email
          </a>
        </div>
      </header>

      <div className="flex flex-col gap-6 p-6">
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-bold tracking-wider text-muted uppercase">{label}</dt>
              <dd className="mt-1 font-semibold break-words">{value}</dd>
            </div>
          ))}
        </dl>
        {data.productSlug && (
          <a href={`/products/${data.productSlug}`} target="_blank" rel="noreferrer" className="-mt-2 text-[13px] font-bold text-brand">
            View the product they asked about →
          </a>
        )}

        <div>
          <h3 className="text-xs font-bold tracking-wider text-muted uppercase">Message</h3>
          <p className="mt-2 rounded-md bg-canvas p-4 leading-relaxed whitespace-pre-line">{data.message}</p>
        </div>

        <div className="flex flex-wrap gap-5">
          <SelectField
            className="flex-1 basis-48"
            label="Status"
            value={draft.status}
            options={inquiryStatusOptions}
            onChange={(status) => setDraft({ ...draft, status })}
          />
          <TextField className="flex-1 basis-48" label="Assigned to" value={draft.assignee} maxLength={120} onChange={(assignee) => setDraft({ ...draft, assignee })} />
        </div>
        <TextAreaField
          label="Internal notes"
          hint="never shown to the customer"
          rows={4}
          maxLength={5000}
          value={draft.notes}
          onChange={(notes) => setDraft({ ...draft, notes })}
        />

        <div>
          <h3 className="mb-2.5 text-xs font-bold tracking-wider text-muted uppercase">Activity</h3>
          <ol className="flex flex-col gap-2.5 border-l-2 border-line pl-4 text-[13px] text-[#3f4349]">
            {data.events.map((e, i) => (
              <li key={i}>
                {e.text} · <span className="text-muted">{timeAgo(e.createdAt)}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#eef0f2] pt-4">
          <SaveStatus {...saver} />
          <button type="button" className={btn.dark} disabled={!dirty || saver.saving} onClick={save}>
            Save changes
          </button>
        </div>
      </div>
    </article>
  );
}

function InquiriesView() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const { data, setData, error } = useApi<ListResponse>(`/admin/inquiries?status=${status}&q=${encodeURIComponent(query)}`);
  const selectedId = Number(params.get("id")) || data?.items[0]?.id;

  // Search after the user stops typing.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(q), 300);
    return () => clearTimeout(timer);
  }, [q]);

  function select(id: number) {
    router.replace(`/admin/inquiries?id=${id}`, { scroll: false });
  }

  function handleChanged(updated: Inquiry) {
    setData((current) => current && { ...current, items: current.items.map((i) => (i.id === updated.id ? updated : i)) });
  }

  return (
    <>
      <PageHeader title="Inquiries" description="Messages sent from the Contact Sales form. Track each one until it's closed." />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-1.5">
          {tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              aria-pressed={status === t.value}
              onClick={() => setStatus(t.value)}
              className={`min-h-9 rounded-full border px-3.5 font-semibold ${
                status === t.value ? "border-ink bg-ink text-white" : "border-field bg-white hover:border-ink"
              }`}
            >
              {t.label}
              {data && ` · ${data.counts[t.count]}`}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-72">
          <label htmlFor="inq-search" className="sr-only">
            Search inquiries
          </label>
          <input id="inq-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, company or item…" className={inputClass} />
        </div>
      </div>

      {error && <Notice tone="error">{error}</Notice>}
      {!data ? (
        !error && <Loading />
      ) : data.items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-field bg-white px-6 py-14 text-center text-muted">No inquiries match.</div>
      ) : (
        <div className="flex flex-wrap items-start gap-5">
          <ul aria-label="Inquiries" className="min-w-0 flex-[1_1_320px] overflow-hidden rounded-lg border border-line bg-white">
            {data.items.map((item) => {
              const active = item.id === selectedId;
              return (
                <li key={item.id} className="border-b border-[#eef0f2] last:border-b-0">
                  <button
                    type="button"
                    onClick={() => select(item.id)}
                    aria-current={active ? "true" : undefined}
                    className={`block w-full border-l-3 px-4 py-3.5 text-left ${active ? "border-brand bg-[#fff7f7]" : "border-transparent hover:bg-canvas"}`}
                  >
                    <span className="flex justify-between gap-2">
                      <span className="font-bold">{item.name}</span>
                      <span className="text-xs whitespace-nowrap text-muted">{timeAgo(item.createdAt)}</span>
                    </span>
                    <span className="mt-0.5 block text-[13px] text-[#3f4349]">{item.subject}</span>
                    <span className="mt-2 block">
                      <InquiryStatusPill status={item.status} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="min-w-0 flex-[2_1_480px]">{selectedId && <InquiryDetail key={selectedId} id={selectedId} onChanged={handleChanged} />}</div>
        </div>
      )}
    </>
  );
}

export default function InquiriesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <InquiriesView />
    </Suspense>
  );
}
