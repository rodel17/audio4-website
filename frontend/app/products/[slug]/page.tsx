import { ChevronRight, CircleCheck, MessageSquare, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductVisual } from "@/components/product-visual";
import { CtaBand, PricingNote } from "@/components/sections";
import { getCategory, getProduct, getProducts, getRelatedProducts } from "@/lib/catalog";
import { site } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  return product ? { title: product.name, description: product.summary } : {};
}

export default async function ProductPage({ params }: { params: Params }) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  const [category, related] = await Promise.all([getCategory(product.category), getRelatedProducts(product)]);

  return (
    <>
      <div className="border-b border-black/10 bg-mist">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-neutral-500">
            <li>
              <Link href="/products" className="hover:text-brand">
                Products
              </Link>
            </li>
            {category && (
              <li className="flex items-center gap-1.5">
                <ChevronRight className="size-3.5" aria-hidden />
                <Link href={`/products?category=${category.slug}`} className="hover:text-brand">
                  {category.name}
                </Link>
              </li>
            )}
            <li aria-current="page" className="flex items-center gap-1.5 text-ink">
              <ChevronRight className="size-3.5" aria-hidden />
              {product.name}
            </li>
          </ol>
        </nav>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <ProductVisual product={product} className="aspect-square border border-black/10" />

        <div>
          {category && <span className="tag-bar">{category.name}</span>}
          <h1 className="display mt-4 text-4xl sm:text-5xl">{product.name}</h1>
          <p className="mt-5 text-lg leading-relaxed text-neutral-600">{product.summary}</p>

          <ul className="mt-6 space-y-2.5">
            {product.highlights.map((h) => (
              <li key={h} className="flex gap-3 text-sm">
                <CircleCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                {h}
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <PricingNote />
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href={`/contact?product=${product.slug}`} className="btn">
              <MessageSquare className="size-4" aria-hidden />
              Inquire about this item
            </Link>
            <a href={site.phoneHref} className="btn btn-dark">
              <Phone className="size-4" aria-hidden />
              Call sales
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-[2fr_3fr] lg:gap-16">
        <div>
          <h2 className="display text-3xl">Overview</h2>
          <p className="mt-4 leading-relaxed text-neutral-700">{product.description}</p>
        </div>
        <div>
          <h2 className="display text-3xl">Specifications</h2>
          <dl className="mt-4 border border-black/10">
            {product.specs.map((spec, i) => (
              <div key={spec.label} className={`grid grid-cols-[minmax(8rem,2fr)_3fr] gap-4 px-5 py-3 text-sm ${i % 2 ? "bg-white" : "bg-mist"}`}>
                <dt className="font-bold">{spec.label}</dt>
                <dd className="text-neutral-700">{spec.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-neutral-500">Specifications may vary by model or supplier. Confirm details with our sales team.</p>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-mist py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="display text-3xl">
              More in <span className="text-brand">{category?.name}</span>
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} categoryName={category?.name} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand />
    </>
  );
}
