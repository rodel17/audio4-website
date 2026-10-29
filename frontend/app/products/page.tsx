import { PackageSearch, Search } from "lucide-react";
import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { CategoryIcon } from "@/components/icons";
import { Pagination } from "@/components/pagination";
import { ProductCard } from "@/components/product-card";
import { CtaBand, PageHero } from "@/components/sections";
import { getCategories, getCategory, getProductCounts, getProductPage } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse speakers, amplifiers, mixers, microphones, CCTV systems, cables and accessories.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function productsHref(category?: string, q?: string, page?: number) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  if (page && page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = first(params.q)?.trim() || undefined;
  const category = await getCategory(first(params.category) ?? "");
  const requestedPage = Number(first(params.page)) || 1;

  const [categories, counts, result] = await Promise.all([
    getCategories(),
    getProductCounts(),
    getProductPage({ category: category?.slug, q, page: requestedPage }),
  ]);
  const firstShown = (result.page - 1) * result.pageSize + 1;
  const lastShown = firstShown + result.items.length - 1;
  const categoryNames = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const filters = [
    { slug: undefined, name: "All products", count: total },
    ...categories.map((c) => ({ slug: c.slug, name: c.name, count: counts[c.slug] ?? 0 })),
  ];

  return (
    <>
      <PageHero
        eyebrow="Catalog"
        title={category?.name ?? "Products"}
        description={category?.description ?? "Browse our range and check the specs. Prices are available on request from our sales team."}
      />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[16rem_1fr]">
        <aside className="min-w-0 space-y-8">
          <Form action="/products" role="search" className="relative">
            {category && <input type="hidden" name="category" value={category.slug} />}
            <label htmlFor="q" className="sr-only">
              Search products
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Search products…"
              className="w-full border border-black/15 py-3 pr-11 pl-4 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <button type="submit" aria-label="Search" className="absolute inset-y-0 right-0 grid w-11 place-items-center text-steel hover:text-brand">
              <Search className="size-4" />
            </button>
          </Form>

          <nav aria-label="Categories">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-steel">Categories</h2>
            <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0 lg:pb-0">
              {filters.map((f) => {
                const active = f.slug === category?.slug;
                return (
                  <li key={f.name} className="shrink-0">
                    <Link
                      href={productsHref(f.slug, q)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center justify-between gap-3 border px-4 py-2.5 text-sm font-semibold transition lg:border-0 lg:border-l-4 ${
                        active
                          ? "border-brand bg-brand text-white lg:bg-mist lg:text-brand"
                          : "border-black/10 hover:text-brand lg:border-transparent lg:hover:border-black/20"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        {f.slug && <CategoryIcon slug={f.slug} className="size-4 max-lg:hidden" />}
                        {f.name}
                      </span>
                      <span className={`text-xs ${active ? "opacity-80" : "text-neutral-400"}`}>{f.count}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <section aria-label="Product results" className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-4 text-sm">
            <p className="text-neutral-600">
              {result.pageCount > 1 && (
                <>
                  Showing{" "}
                  <span className="font-bold text-ink">
                    {firstShown}–{lastShown}
                  </span>{" "}
                  of{" "}
                </>
              )}
              <span className="font-bold text-ink">{result.total}</span> {result.total === 1 ? "item" : "items"}
              {q && (
                <>
                  {" "}
                  for <span className="font-bold text-ink">&ldquo;{q}&rdquo;</span>
                </>
              )}
            </p>
            {q && (
              <Link href={productsHref(category?.slug)} className="font-semibold text-brand hover:underline">
                Clear search
              </Link>
            )}
          </div>

          {result.items.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((p) => (
                  <ProductCard key={p.slug} product={p} categoryName={categoryNames[p.category]} />
                ))}
              </div>
              <Pagination
                page={result.page}
                pageCount={result.pageCount}
                hrefFor={(page) => productsHref(category?.slug, q, page)}
              />
            </>
          ) : (
            <div className="border border-dashed border-black/20 px-6 py-16 text-center">
              <PackageSearch className="mx-auto size-10 text-steel" aria-hidden />
              <h2 className="mt-4 text-lg font-bold">No items found</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600">
                Can&apos;t find what you&apos;re looking for? We can source many items on request — ask our sales team.
              </p>
              <Link href="/contact" className="btn mt-6">
                Ask our sales team
              </Link>
            </div>
          )}
        </section>
      </div>

      <CtaBand />
    </>
  );
}
