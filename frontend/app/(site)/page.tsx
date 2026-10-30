import { ArrowRight, Handshake, MessageSquare, PackageSearch } from "lucide-react";
import Link from "next/link";
import { NamedIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { CtaBand, SectionHeading } from "@/components/sections";
import { getCategories, getContent, getProductPage, getServices } from "@/lib/catalog";
import { linkTargetHref } from "@/lib/format";
import type { HomeSectionKey } from "@/lib/types";

const stepIcons = [PackageSearch, MessageSquare, Handshake];

export default async function Home() {
  const [home, productsText, categories, services, featured] = await Promise.all([
    getContent("home"),
    getContent("products"),
    getCategories(),
    getServices(),
    getContent("home").then((h) => getProductPage({ featured: true, pageSize: h.featured.count })),
  ]);
  const { hero, howToBuy, whyUs } = home;
  const homeServices = services.filter((s) => s.showOnHome);

  // Each section is rendered in the order chosen in the admin, unless it's hidden.
  const sections: Record<HomeSectionKey, React.ReactNode> = {
    hero: (
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-y-0 -right-24 w-[45%] -skew-x-12 bg-brand max-lg:hidden" />
        <div className="absolute inset-y-0 right-[41%] w-4 -skew-x-12 bg-steel max-lg:hidden" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgb(255_255_255/0.08),transparent_55%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:py-28">
          <div>
            {hero.eyebrow && <span className="tag-bar tag-bar-brand">{hero.eyebrow}</span>}
            <h1 className="display mt-6 text-6xl sm:text-7xl lg:text-8xl">
              {hero.line1}
              <br />
              {hero.line2}
              <br />
              <span className="text-brand">{hero.line3}</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/75">{hero.tagline}</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href={linkTargetHref(hero.primary.target)} className="btn">
                {hero.primary.label}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href={linkTargetHref(hero.secondary.target)} className="btn btn-outline">
                {hero.secondary.label}
              </Link>
            </div>
          </div>

          {hero.showCategoryTiles && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/products?category=${c.slug}`}
                    className="flex aspect-square flex-col items-center justify-center gap-3 border border-white/10 bg-black/40 p-4 text-center backdrop-blur transition hover:border-white/40 hover:bg-black/60"
                  >
                    <NamedIcon name={c.icon} className="size-9 text-white" strokeWidth={1.4} />
                    <span className="text-xs font-bold uppercase tracking-wider">{c.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    ),

    howToBuy: (
      <section className="border-b border-black/10 bg-mist">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_3fr] lg:items-center">
          <div>
            <h2 className="display text-3xl">{howToBuy.title}</h2>
            <p className="mt-2 text-sm text-neutral-600">{howToBuy.subtitle}</p>
          </div>
          <ol className="grid gap-6 sm:grid-cols-3">
            {howToBuy.steps.map((step, i) => {
              const StepIcon = stepIcons[i];
              return (
                <li key={i} className="flex gap-4">
                  <span className="display text-5xl text-brand">{i + 1}</span>
                  <div>
                    <p className="flex items-center gap-2 font-bold uppercase tracking-wider">
                      {StepIcon && <StepIcon className="size-4 text-steel" aria-hidden />}
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">{step.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    ),

    categories: (
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading {...home.categories} />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/products?category=${c.slug}`}
                className="group flex h-full gap-5 border border-black/10 p-6 transition hover:border-brand hover:shadow-lg"
              >
                <span className="grid size-14 shrink-0 place-items-center bg-ink text-white transition group-hover:bg-brand">
                  <NamedIcon name={c.icon} className="size-7" strokeWidth={1.5} />
                </span>
                <span>
                  <span className="block font-bold uppercase tracking-wide group-hover:text-brand">{c.name}</span>
                  <span className="mt-1 block text-sm text-neutral-600">{c.description}</span>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-steel">
                    {c.productCount} items
                    <ArrowRight className="size-3.5 transition group-hover:translate-x-1" aria-hidden />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    ),

    featured:
      featured.items.length > 0 ? (
        <section className="bg-mist py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading {...home.featured} />
              <Link href="/products" className="btn btn-dark">
                {home.featured.buttonLabel}
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.items.map((p) => (
                <ProductCard key={p.slug} product={p} quoteLabel={productsText.cardQuoteLabel} inquireLabel={productsText.cardInquireLabel} />
              ))}
            </div>
          </div>
        </section>
      ) : null,

    services:
      homeServices.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading {...home.services} />
            <Link href="/services" className="btn btn-dark">
              {home.services.buttonLabel}
            </Link>
          </div>
          <ul className="mt-10 grid gap-px overflow-hidden border border-black/10 bg-black/10 sm:grid-cols-2 lg:grid-cols-3">
            {homeServices.map((s) => (
              <li key={s.slug} className="bg-white p-7">
                <NamedIcon name={s.icon} className="size-8 text-brand" strokeWidth={1.5} />
                <h3 className="mt-4 font-bold uppercase tracking-wide">{s.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{s.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null,

    whyUs: (
      <section className="bg-ink py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading {...whyUs} description={undefined} />
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {whyUs.reasons.map((r, i) => (
              <li key={i} className="border-t-2 border-brand pt-5">
                <NamedIcon name={r.icon} className="size-7 text-brand" strokeWidth={1.5} />
                <h3 className="mt-4 font-bold uppercase tracking-wide">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{r.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    ),

    cta: <CtaBand />,
  };

  return (
    <>
      {home.sections
        .filter((s) => s.visible)
        .map((s) => (
          <div key={s.key}>{sections[s.key]}</div>
        ))}
    </>
  );
}
