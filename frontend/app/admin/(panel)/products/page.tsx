"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { NamedIcon } from "@/components/icons";
import { Checkbox, Loading, Notice, PageHeader, PublishedPill, SaveStatus, btn, inputClass } from "@/components/admin/ui";
import { api, useApi, useSaver } from "@/lib/admin-api";
import { timeAgo } from "@/lib/format";
import type { Category, Product, ProductPage } from "@/lib/types";

function ProductsView() {
  const params = useSearchParams();
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [featured, setFeatured] = useState(params.get("featured") === "1");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const saver = useSaver();

  const categories = useApi<Category[]>("/admin/categories");
  const filters = new URLSearchParams({ page: String(page), pageSize: "10" });
  if (query) filters.set("q", query);
  if (categoryId) filters.set("categoryId", categoryId);
  if (status) filters.set("status", status);
  if (featured) filters.set("featured", "true");
  const path = `/admin/products?${filters}`;
  const { data, setData, error, reload } = useApi<ProductPage>(path);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(q);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => setSelected([]), [path]);

  async function toggleFeatured(product: Product) {
    const updated = await saver.run(() => api<Product>(`/admin/products/${product.id}`, { method: "PATCH", body: { featured: !product.featured } }));
    if (updated) setData((d) => d && { ...d, items: d.items.map((p) => (p.id === updated.id ? updated : p)) });
  }

  async function bulk(action: "publish" | "draft" | "delete") {
    if (action === "delete" && !window.confirm(`Delete ${selected.length} product(s)? This can't be undone.`)) return;
    const done = await saver.run(() => api("/admin/products/bulk", { method: "POST", body: { ids: selected, action } }));
    if (done !== undefined) {
      setSelected([]);
      await reload();
    }
  }

  const items = data?.items ?? [];
  const allSelected = items.length > 0 && items.every((p) => selected.includes(p.id));
  const firstShown = data ? (data.page - 1) * data.pageSize + 1 : 0;

  return (
    <>
      <PageHeader
        title="Products"
        description="Everything listed in the public catalog. Prices are never stored or shown."
        actions={
          <Link href="/admin/products/new" className={btn.primary}>
            + Add product
          </Link>
        }
      />

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-line bg-white p-4">
        <div className="flex-[2_1_240px]">
          <label htmlFor="p-search" className="mb-1.5 block text-[13px] font-semibold">
            Search
          </label>
          <input id="p-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or web address…" className={inputClass} />
        </div>
        <div className="flex-[1_1_180px]">
          <label htmlFor="p-cat" className="mb-1.5 block text-[13px] font-semibold">
            Category
          </label>
          <select
            id="p-cat"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className={inputClass}
          >
            <option value="">All categories</option>
            {categories.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-[1_1_160px]">
          <label htmlFor="p-status" className="mb-1.5 block text-[13px] font-semibold">
            Status
          </label>
          <select
            id="p-status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className={inputClass}
          >
            <option value="">Any status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="flex min-h-10 items-center">
          <Checkbox
            label="Featured only"
            checked={featured}
            onChange={(v) => {
              setFeatured(v);
              setPage(1);
            }}
          />
        </div>
      </div>

      {error && <Notice tone="error">{error}</Notice>}

      <section className="rounded-lg border border-line bg-white">
        <div className="flex min-h-15 flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <span className="text-muted">{selected.length ? `${selected.length} selected` : "Select products for bulk actions"}</span>
          <div className="flex flex-wrap items-center gap-2">
            <SaveStatus {...saver} />
            {selected.length > 0 && (
              <>
                <button type="button" className={btn.secondary} onClick={() => bulk("publish")}>
                  Publish
                </button>
                <button type="button" className={btn.secondary} onClick={() => bulk("draft")}>
                  Move to draft
                </button>
                <button type="button" className={btn.danger} onClick={() => bulk("delete")}>
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {!data ? (
          !error && <Loading />
        ) : items.length === 0 ? (
          <p className="px-6 py-14 text-center text-muted">No products match these filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="text-xs tracking-wider text-muted uppercase">
                  <th className="w-11 px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label="Select all on this page"
                      checked={allSelected}
                      onChange={(e) => setSelected(e.target.checked ? items.map((p) => p.id) : [])}
                      className="size-4 accent-brand"
                    />
                  </th>
                  <th className="px-2 py-3 font-bold">Product</th>
                  <th className="px-2 py-3 font-bold">Category</th>
                  <th className="px-2 py-3 font-bold">Status</th>
                  <th className="px-2 py-3 font-bold">Featured</th>
                  <th className="px-2 py-3 font-bold">Updated</th>
                  <th className="px-4 py-3 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-t border-[#eef0f2]">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Select ${p.name}`}
                        checked={selected.includes(p.id)}
                        onChange={(e) => setSelected((s) => (e.target.checked ? [...s, p.id] : s.filter((id) => id !== p.id)))}
                        className="size-4 accent-brand"
                      />
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-md bg-ink">
                          {p.images[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element -- uploaded thumbnail
                            <img src={p.images[0]} alt="" className="absolute inset-0 size-full bg-white object-contain" />
                          ) : (
                            <>
                              <span className="absolute inset-y-0 -right-1.5 w-1/4 -skew-x-12 bg-brand" />
                              <NamedIcon name={p.categoryIcon} className="relative size-5.5 text-white" strokeWidth={1.4} />
                            </>
                          )}
                        </span>
                        <span className="min-w-0">
                          <Link href={`/admin/products/${p.id}`} className="block font-bold hover:text-brand">
                            {p.name}
                          </Link>
                          <span className="block text-xs text-muted">
                            /products/{p.slug} · {p.images.length ? `${p.images.length} photo${p.images.length > 1 ? "s" : ""}` : "no photos yet"}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-3">{p.categoryName}</td>
                    <td className="px-2 py-3">
                      <PublishedPill published={p.published} />
                    </td>
                    <td className="px-2 py-3">
                      <label className="inline-flex cursor-pointer items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={p.featured}
                          onChange={() => toggleFeatured(p)}
                          aria-label={`Feature ${p.name} on homepage`}
                          className="size-4 accent-brand"
                        />
                        <span className="text-[13px] text-muted">{p.featured ? "Yes" : "No"}</span>
                      </label>
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap text-muted">{timeAgo(p.updatedAt)}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link href={`/admin/products/${p.id}`} className={`${btn.secondary} min-h-8! px-3!`}>
                        Edit
                      </Link>
                      {p.published && (
                        <a href={`/products/${p.slug}`} target="_blank" rel="noreferrer" className="ml-1 inline-flex min-h-8 items-center px-3 font-semibold text-muted hover:text-ink">
                          View
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3.5">
            <span className="text-muted">
              Showing {firstShown}–{firstShown + items.length - 1} of {data.total}
            </span>
            {data.pageCount > 1 && (
              <nav aria-label="Pagination" className="flex gap-1.5">
                {Array.from({ length: data.pageCount }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    aria-current={n === data.page ? "page" : undefined}
                    className={`grid size-9 place-items-center rounded-md font-bold ${n === data.page ? "bg-ink text-white" : "border border-field hover:border-ink"}`}
                  >
                    {n}
                  </button>
                ))}
              </nav>
            )}
          </div>
        )}
      </section>
    </>
  );
}

export default function ProductsAdminPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProductsView />
    </Suspense>
  );
}
