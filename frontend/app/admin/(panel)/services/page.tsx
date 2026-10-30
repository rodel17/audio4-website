"use client";

import { useEffect, useState } from "react";
import { NamedIcon } from "@/components/icons";
import { IconPicker, RowControls, StepsEditor, StringListEditor, move } from "@/components/admin/editors";
import { slugify } from "@/components/admin/product-form";
import { Card, Checkbox, Loading, Notice, PageHeader, SaveStatus, TextAreaField, TextField, btn } from "@/components/admin/ui";
import { api, useApi, useSaver } from "@/lib/admin-api";
import type { Service, ServicesPageContent } from "@/lib/types";

type Draft = Omit<Service, "id" | "sortOrder"> & { id: number | null };

const blank: Draft = { id: null, slug: "", name: "", summary: "", includes: [], icon: "wrench", showOnHome: true, offerInForm: true };

function toDraft(s: Service): Draft {
  const { sortOrder: _sortOrder, ...rest } = s;
  return rest;
}

function ProcessSteps() {
  const { data, error } = useApi<ServicesPageContent>("/admin/content/services");
  const [content, setContent] = useState<ServicesPageContent | null>(null);
  const saver = useSaver();

  useEffect(() => {
    if (data) setContent(data);
  }, [data]);

  if (error) return <Notice tone="error">{error}</Notice>;
  if (!content) return null;

  async function save() {
    const result = await saver.run(() => api<ServicesPageContent>("/admin/content/services", { method: "PUT", body: content }));
    if (result) setContent(result);
  }

  return (
    <Card
      title="“How we work” steps"
      description="The numbered process on the Services page."
      actions={
        <div className="flex items-center gap-3">
          <SaveStatus {...saver} />
          <button type="button" className={btn.dark} disabled={saver.saving} onClick={save}>
            Save steps
          </button>
        </div>
      }
    >
      <StepsEditor steps={content.steps} max={8} multilineText onChange={(steps) => setContent({ ...content, steps: steps })} />
    </Card>
  );
}

export default function ServicesAdminPage() {
  const { data: services, setData, error, reload } = useApi<Service[]>("/admin/services");
  const [draft, setDraft] = useState<Draft | null>(null);
  const saver = useSaver();

  const current = draft ?? (services?.[0] ? toDraft(services[0]) : null);

  async function reorder(from: number, to: number) {
    if (!services) return;
    const next = move(services, from, to);
    setData(next);
    await saver.run(() => api("/admin/services/reorder", { method: "POST", body: { ids: next.map((s) => s.id) } }));
  }

  async function save() {
    if (!current) return;
    const { id, ...rest } = current;
    const body = { ...rest, includes: rest.includes.filter((i) => i.trim()) };
    const result = await saver.run(() =>
      id === null ? api<Service>("/admin/services", { method: "POST", body }) : api<Service>(`/admin/services/${id}`, { method: "PUT", body }),
    );
    if (result) {
      await reload();
      setDraft(toDraft(result));
    }
  }

  async function remove() {
    if (!current?.id || !window.confirm(`Delete the “${current.name}” service?`)) return;
    const deleted = await saver.run(async () => {
      await api(`/admin/services/${current.id}`, { method: "DELETE" });
      return true;
    });
    if (deleted) {
      setDraft(null);
      await reload();
    }
  }

  const set = (patch: Partial<Draft>) => current && setDraft({ ...current, ...patch });

  return (
    <>
      <PageHeader
        title="Services"
        description="Service cards on the homepage and the Services page. Each one can be requested from the contact form."
        actions={
          <button type="button" className={btn.primary} onClick={() => setDraft({ ...blank })}>
            + Add service
          </button>
        }
      />
      {error && <Notice tone="error">{error}</Notice>}
      {!services ? (
        !error && <Loading />
      ) : (
        <div className="flex flex-wrap items-start gap-5">
          <ul aria-label="Services" className="min-w-0 flex-[1_1_320px] overflow-hidden rounded-lg border border-line bg-white">
            {services.map((s, i) => {
              const active = s.id === current?.id;
              return (
                <li key={s.id} className={`flex items-center border-b border-l-3 border-b-[#eef0f2] last:border-b-0 ${active ? "border-l-brand bg-[#fff7f7]" : "border-l-transparent"}`}>
                  <button type="button" onClick={() => setDraft(toDraft(s))} aria-current={active ? "true" : undefined} className="flex flex-1 items-center gap-3 py-3 pr-2 pl-4 text-left">
                    <span className="grid size-10 shrink-0 place-items-center rounded-md bg-[#fff1f1] text-brand">
                      <NamedIcon name={s.icon} className="size-5" strokeWidth={1.6} />
                    </span>
                    <span className="min-w-0 font-bold">{s.name}</span>
                  </button>
                  <div className="pr-2">
                    <RowControls index={i} count={services.length} label={s.name} onMove={(to) => reorder(i, to)} />
                  </div>
                </li>
              );
            })}
          </ul>

          {current && (
            <Card className="min-w-0 flex-[2_1_460px]" title={current.id === null ? "New service" : `Edit “${services.find((s) => s.id === current.id)?.name ?? current.name}”`}>
              <div className="flex flex-col gap-4">
                <TextField label="Service name" value={current.name} maxLength={160} onChange={(name) => set(current.id === null ? { name, slug: slugify(name) } : { name })} />
                <TextAreaField label="Summary" rows={3} maxLength={600} value={current.summary} onChange={(summary) => set({ summary })} />
                <StringListEditor
                  label="What's included"
                  items={current.includes}
                  onChange={(includes) => set({ includes })}
                  addLabel="Add item"
                  itemLabel="Included item"
                  max={12}
                />
                <IconPicker value={current.icon} onChange={(icon) => set({ icon })} />
                <div className="flex flex-wrap gap-x-8 gap-y-3">
                  <Checkbox label="Show on homepage" checked={current.showOnHome} onChange={(showOnHome) => set({ showOnHome })} />
                  <Checkbox label="Offer in the contact form" description="Adds a “Request this service” link." checked={current.offerInForm} onChange={(offerInForm) => set({ offerInForm })} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eef0f2] pt-4">
                  {current.id !== null ? (
                    <button type="button" className={btn.danger} onClick={remove}>
                      Delete service
                    </button>
                  ) : (
                    <span />
                  )}
                  <div className="flex items-center gap-3">
                    <SaveStatus {...saver} />
                    <button type="button" className={btn.primary} disabled={saver.saving || !current.name.trim() || !current.slug} onClick={save}>
                      {current.id === null ? "Create service" : "Save changes"}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      <ProcessSteps />
    </>
  );
}
