import { ChevronRight, CircleCheck, MessageSquare, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { CtaBand, PricingNote } from "@/components/sections";
import { getContent, getProduct } from "@/lib/catalog";
import { telHref } from "@/lib/format";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return {};
  return {
    title: product.seoTitle ? { absolute: product.seoTitle } : product.name,
    description: product.summary,
    openGraph: product.images[0] ? { images: [product.images[0]] } : undefined,
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  const [text, cardText, site] = await Promise.all([getContent("product-detail"), getContent("products"), getContent("site")]);

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
            <li className="flex items-center gap-1.5">
              <ChevronRight className="size-3.5" aria-hidden />
              <Link href={`/products?category=${product.categorySlug}`} className="hover:text-brand">
                {product.categoryName}
              </Link>
            </li>
            <li aria-current="page" className="flex items-center gap-1.5 text-ink">
              <ChevronRight className="size-3.5" aria-hidden />
              {product.name}
            </li>
          </ol>
        </nav>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <ProductGallery product={product} />

        <div>
          <span className="tag-bar">{product.categoryName}</span>
          <h1 className="display mt-4 text-4xl sm:text-5xl">{product.name}</h1>
          <p className="mt-5 text-lg leading-relaxed text-neutral-600">{product.summary}</p>

          {product.highlights.length > 0 && (
            <ul className="mt-6 space-y-2.5">
              {product.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-sm">
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                  {h}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8">
            <PricingNote title={text.pricingTitle} text={text.pricingText} />
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href={`/contact?product=${product.slug}`} className="btn">
              <MessageSquare className="size-4" aria-hidden />
              {text.inquireLabel}
            </Link>
            <a href={telHref(site.phone)} className="btn btn-dark">
              <Phone className="size-4" aria-hidden />
              {text.callLabel}
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-[2fr_3fr] lg:gap-16">
        <div>
          <h2 className="display text-3xl">{text.overviewTitle}</h2>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-neutral-700">{product.description}</p>
        </div>
        {product.specs.length > 0 && (
          <div>
            <h2 className="display text-3xl">{text.specsTitle}</h2>
            <dl className="mt-4 border border-black/10">
              {product.specs.map((spec, i) => (
                <div key={`${spec.label}-${i}`} className={`grid grid-cols-[minmax(8rem,2fr)_3fr] gap-4 px-5 py-3 text-sm ${i % 2 ? "bg-white" : "bg-mist"}`}>
                  <dt className="font-bold">{spec.label}</dt>
                  <dd className="text-neutral-700">{spec.value}</dd>
                </div>
              ))}
            </dl>
            {text.specsNote && <p className="mt-3 text-xs text-neutral-500">{text.specsNote}</p>}
          </div>
        )}
      </section>

      {product.related.length > 0 && (
        <section className="bg-mist py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="display text-3xl">
              {text.relatedTitle} <span className="text-brand">{product.categoryName}</span>
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {product.related.map((p) => (
                <ProductCard key={p.slug} product={p} quoteLabel={cardText.cardQuoteLabel} inquireLabel={cardText.cardInquireLabel} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand />
    </>
  );
}
