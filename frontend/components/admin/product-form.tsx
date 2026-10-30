"use client";

import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, useApi, useSaver } from "@/lib/admin-api";
import type { Category, Product, Spec } from "@/lib/types";
import { SpecsEditor, StringListEditor } from "./editors";
import { ImageListEditor } from "./image-upload";
import { Card, Checkbox, Field, Loading, PageHeader, SaveStatus, SelectField, TextAreaField, TextField, btn, inputClass } from "./ui";

type Draft = {
  name: string;
  slug: string;
  categoryId: number;
  summary: string;
  description: string;
  highlights: string[];
  specs: Spec[];
  images: string[];
  featured: boolean;
  published: boolean;
  seoTitle: string;
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function toDraft(p: Product): Draft {
  const { name, slug, categoryId, summary, description, highlights, specs, images, featured, published, seoTitle } = p;
  return { name, slug, categoryId, summary, description, highlights, specs, images, featured, published, seoTitle };
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const categories = useApi<Category[]>("/admin/categories");
  const saver = useSaver();
  const [draft, setDraft] = useState<Draft | null>(product ? toDraft(product) : null);
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [saved, setSaved] = useState<Draft | null>(product ? toDraft(product) : null);

  // New products start in the first category once categories load.
  if (!draft && categories.data) {
    setDraft({
      name: "",
      slug: "",
      categoryId: categories.data[0]?.id ?? 0,
      summary: "",
      description: "",
      highlights: [],
      specs: [],
      images: [],
      featured: false,
      published: true,
      seoTitle: "",
    });
  }

  if (!draft || !categories.data) return <Loading />;

  const set = (patch: Partial<Draft>) => setDraft({ ...draft, ...patch });
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  async function save() {
    if (!draft) return;
    const body = {
      ...draft,
      highlights: draft.highlights.filter((h) => h.trim()),
      specs: draft.specs.filter((s) => s.label.trim() && s.value.trim()),
    };
    const result = await saver.run(() =>
      product
        ? api<Product>(`/admin/products/${product.id}`, { method: "PUT", body })
        : api<Product>("/admin/products", { method: "POST", body }),
    );
    if (!result) return;
    const next = toDraft(result);
    setDraft(next);
    setSaved(next);
    if (!product) router.replace(`/admin/products/${result.id}`);
  }

  async function remove() {
    if (!product || !window.confirm(`Delete “${product.name}”? This can't be undone.`)) return;
    const deleted = await saver.run(async () => {
      await api(`/admin/products/${product.id}`, { method: "DELETE" });
      return true;
    });
    if (deleted) router.replace("/admin/products");
  }

  return (
    <>
      <PageHeader
        title={product ? "Edit product" : "Add product"}
        back={{ href: "/admin/products", label: "Products" }}
        actions={
          <>
            <SaveStatus {...saver} />
            {dirty && saver.status === "idle" && <span className="text-[13px] text-muted">Unsaved changes</span>}
            {product?.published && (
              <a href={`/products/${product.slug}`} target="_blank" rel="noreferrer" className={btn.secondary}>
                Preview
              </a>
            )}
            <button type="button" className={btn.primary} disabled={saver.saving || !draft.name.trim() || !draft.slug} onClick={save}>
              {product ? "Save changes" : "Create product"}
            </button>
          </>
        }
      />

      {categories.data.length === 0 && (
        <p className="rounded-md border border-[#f3d9a8] bg-[#fdf6e7] px-4 py-3 text-sm">Create a category first — every product belongs to one.</p>
      )}

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[2_1_520px] flex-col gap-5">
          <Card title="Basic details">
            <div className="flex flex-col gap-4">
              <TextField
                label="Product name"
                value={draft.name}
                maxLength={200}
                onChange={(name) => set(slugTouched ? { name } : { name, slug: slugify(name) })}
              />
              <div className="flex flex-wrap gap-4">
                <Field label="Web address" className="flex-[2_1_260px]">
                  {(id) => (
                    <div className="flex overflow-hidden rounded-md border border-field focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                      <span className="grid place-items-center border-r border-field bg-canvas px-2.5 text-muted">/products/</span>
                      <input
                        id={id}
                        value={draft.slug}
                        maxLength={120}
                        onChange={(e) => {
                          setSlugTouched(true);
                          set({ slug: slugify(e.target.value) });
                        }}
                        className="min-h-10 min-w-0 flex-1 px-2.5 text-sm outline-none"
                      />
                    </div>
                  )}
                </Field>
                <SelectField
                  className="flex-[1_1_200px]"
                  label="Category"
                  value={String(draft.categoryId)}
                  options={categories.data.map((c) => ({ value: String(c.id), label: c.name }))}
                  onChange={(v) => set({ categoryId: Number(v) })}
                />
              </div>
              <Field label="Short summary" hint="shown on product cards">
                {(id) => (
                  <>
                    <input id={id} value={draft.summary} maxLength={300} onChange={(e) => set({ summary: e.target.value })} className={inputClass} />
                    <p className="mt-1.5 text-xs text-muted">{draft.summary.length} / 300 characters</p>
                  </>
                )}
              </Field>
              <TextAreaField label="Overview" hint="shown on the product page" rows={5} maxLength={5000} value={draft.description} onChange={(description) => set({ description })} />
            </div>
          </Card>

          <Card title="Photos" description="The first photo is the main image. Until a photo is added, the site shows a branded placeholder.">
            <ImageListEditor images={draft.images} onChange={(images) => set({ images })} />
          </Card>

          <Card title="Key highlights" description="Short bullet points shown next to the photo.">
            <StringListEditor
              label="Highlights"
              items={draft.highlights}
              onChange={(highlights) => set({ highlights })}
              addLabel="Add highlight"
              itemLabel="Highlight"
              placeholder="e.g. Built-in Class-D amplifier"
            />
          </Card>

          <Card title="Specifications" description="Each row becomes a line in the specs table. Empty rows are skipped.">
            <SpecsEditor specs={draft.specs} onChange={(specs) => set({ specs })} />
          </Card>
        </div>

        <aside className="flex min-w-0 flex-[1_1_280px] flex-col gap-5">
          <Card title="Publishing">
            <div className="flex flex-col gap-4">
              <SelectField
                label="Status"
                value={draft.published ? "published" : "draft"}
                options={[
                  { value: "published", label: "Published — visible on the site" },
                  { value: "draft", label: "Draft — hidden from the site" },
                ]}
                onChange={(v) => set({ published: v === "published" })}
              />
              <Checkbox label="Feature on homepage" description="Shows in “Popular picks”." checked={draft.featured} onChange={(featured) => set({ featured })} />
              {product && <p className="text-xs text-muted">Last updated {new Date(product.updatedAt).toLocaleString()}</p>}
            </div>
          </Card>

          <section className="flex gap-3 rounded-lg border border-[#f3c2c5] bg-[#fff7f7] p-4 text-[13px] leading-normal">
            <Lock className="size-5 shrink-0 text-brand" aria-hidden />
            <div>
              <p className="font-bold">No price field — by design</p>
              <p className="mt-1 text-muted">Pricing stays confidential. Visitors see “Quote on request” and are sent to Contact Sales.</p>
            </div>
          </section>

          <Card title="Search & sharing" description="Optional. Defaults to the product name and summary.">
            <TextField label="Page title" value={draft.seoTitle} maxLength={200} placeholder={draft.name} onChange={(seoTitle) => set({ seoTitle })} />
          </Card>

          {product && (
            <Card title="Delete product" description="Removes it from the catalog. Past inquiries keep the product name.">
              <button type="button" className={btn.danger} onClick={remove}>
                Delete product
              </button>
            </Card>
          )}
        </aside>
      </div>
    </>
  );
}
