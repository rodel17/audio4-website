"use client";

import { useState } from "react";
import { NamedIcon } from "@/components/icons";
import { IconPicker, RowControls, move } from "@/components/admin/editors";
import { slugify } from "@/components/admin/product-form";
import { Card, Checkbox, Field, Loading, Notice, PageHeader, SaveStatus, TextAreaField, TextField, btn } from "@/components/admin/ui";
import { api, useApi, useSaver } from "@/lib/admin-api";
import type { Category } from "@/lib/types";

type Draft = { id: number | null; slug: string; name: string; description: string; icon: string; visible: boolean };

const blank: Draft = { id: null, slug: "", name: "", description: "", icon: "package", visible: true };

function toDraft(c: Category): Draft {
  return { id: c.id, slug: c.slug, name: c.name, description: c.description, icon: c.icon, visible: c.visible };
}

export default function CategoriesPage() {
  const { data: categories, setData, error, reload } = useApi<Category[]>("/admin/categories");
  const [draft, setDraft] = useState<Draft | null>(null);
  const saver = useSaver();

  const current = draft ?? (categories?.[0] ? toDraft(categories[0]) : null);
  const original = categories?.find((c) => c.id === current?.id);

  async function reorder(from: number, to: number) {
    if (!categories) return;
    const next = move(categories, from, to);
    setData(next);
    await saver.run(() => api("/admin/categories/reorder", { method: "POST", body: { ids: next.map((c) => c.id) } }));
  }

  async function save() {
    if (!current) return;
    const { id, ...body } = current;
    const result = await saver.run(() =>
      id === null ? api<Category>("/admin/categories", { method: "POST", body }) : api<Category>(`/admin/categories/${id}`, { method: "PUT", body }),
    );
    if (result) {
      await reload();
      setDraft(toDraft(result));
    }
  }

  async function remove() {
    if (!current?.id || !window.confirm(`Delete the “${current.name}” category?`)) return;
    const deleted = await saver.run(async () => {
      await api(`/admin/categories/${current.id}`, { method: "DELETE" });
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
        title="Categories"
        description="Shown in the hero tiles, “What we carry”, the catalog filter and the footer. Use the arrows to change the order."
        actions={
          <button type="button" className={btn.primary} onClick={() => setDraft({ ...blank })}>
            + Add category
          </button>
        }
      />
      {error && <Notice tone="error">{error}</Notice>}
      {!categories ? (
        !error && <Loading />
      ) : (
        <div className="flex flex-wrap items-start gap-5">
          <ul aria-label="Categories" className="min-w-0 flex-[1_1_320px] overflow-hidden rounded-lg border border-line bg-white">
            {categories.map((c, i) => {
              const active = c.id === current?.id;
              return (
                <li key={c.id} className={`flex items-center border-b border-l-3 border-b-[#eef0f2] last:border-b-0 ${active ? "border-l-brand bg-[#fff7f7]" : "border-l-transparent"}`}>
                  <button type="button" onClick={() => setDraft(toDraft(c))} aria-current={active ? "true" : undefined} className="flex flex-1 items-center gap-3 py-3 pr-2 pl-4 text-left">
                    <span className="grid size-10 shrink-0 place-items-center rounded-md bg-ink text-white">
                      <NamedIcon name={c.icon} className="size-5" strokeWidth={1.6} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-bold">{c.name}</span>
                      <span className="block text-xs text-muted">
                        {c.productCount} products{c.visible ? "" : " · hidden"}
                      </span>
                    </span>
                  </button>
                  <div className="pr-2">
                    <RowControls index={i} count={categories.length} label={c.name} onMove={(to) => reorder(i, to)} />
                  </div>
                </li>
              );
            })}
          </ul>

          {current && (
            <Card className="min-w-0 flex-[2_1_460px]" title={current.id === null ? "New category" : `Edit “${original?.name ?? current.name}”`}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-4">
                  <TextField
                    className="flex-[1_1_220px]"
                    label="Name"
                    value={current.name}
                    maxLength={120}
                    onChange={(name) => set(current.id === null ? { name, slug: slugify(name) } : { name })}
                  />
                  <Field label="Web address" className="flex-[1_1_220px]">
                    {(id) => (
                      <div className="flex overflow-hidden rounded-md border border-field focus-within:border-brand">
                        <span className="grid place-items-center border-r border-field bg-canvas px-2.5 whitespace-nowrap text-muted">?category=</span>
                        <input id={id} value={current.slug} maxLength={80} onChange={(e) => set({ slug: slugify(e.target.value) })} className="min-h-10 min-w-0 flex-1 px-2.5 outline-none" />
                      </div>
                    )}
                  </Field>
                </div>
                <TextAreaField label="Description" rows={2} maxLength={400} value={current.description} onChange={(description) => set({ description })} />
                <IconPicker value={current.icon} onChange={(icon) => set({ icon })} />
                <Checkbox label="Show this category on the website" checked={current.visible} onChange={(visible) => set({ visible })} />
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eef0f2] pt-4">
                  {current.id !== null ? (
                    <button type="button" className={btn.danger} onClick={remove}>
                      Delete category
                    </button>
                  ) : (
                    <span />
                  )}
                  <div className="flex items-center gap-3">
                    <SaveStatus {...saver} />
                    <button type="button" className={btn.primary} disabled={saver.saving || !current.name.trim() || !current.slug} onClick={save}>
                      {current.id === null ? "Create category" : "Save changes"}
                    </button>
                  </div>
                </div>
                {original && original.productCount > 0 && (
                  <p className="text-xs text-muted">A category with products can&apos;t be deleted until its products are moved to another category.</p>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
