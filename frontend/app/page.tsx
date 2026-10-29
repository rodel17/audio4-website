import { ArrowRight, Handshake, Headset, MessageSquare, PackageSearch, ShieldCheck, Wrench } from "lucide-react";
import Link from "next/link";
import { CategoryIcon, ServiceIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { CtaBand, SectionHeading } from "@/components/sections";
import { getCategories, getFeaturedProducts, getProductCounts, getServices } from "@/lib/catalog";
import { site } from "@/lib/site";

const buySteps = [
  { icon: PackageSearch, title: "Browse", text: "Explore our catalog and check the specs of the items you need." },
  { icon: MessageSquare, title: "Inquire", text: "Send an inquiry or call our sales team about the items or service." },
  { icon: Handshake, title: "Get your quote", text: "We prepare a quotation and work out the best deal for your project." },
];

const reasons = [
  { icon: ShieldCheck, title: "Quality equipment", text: "Professional-grade audio, surveillance and electronics we stand behind." },
  { icon: Wrench, title: "Supply + installation", text: "One team from equipment selection to installation and tuning." },
  { icon: Handshake, title: "Project-based pricing", text: "Quotes tailored to your quantity, setup and budget." },
  { icon: Headset, title: "After-sales support", text: "Repairs, maintenance and technical help after the sale." },
];

export default async function Home() {
  const [categories, featured, counts, services] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getProductCounts(),
    getServices(),
  ]);
  const categoryNames = Object.fromEntries(categories.map((c) => [c.slug, c.name]));

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-y-0 -right-24 w-[45%] -skew-x-12 bg-brand max-lg:hidden" />
        <div className="absolute inset-y-0 right-[41%] w-4 -skew-x-12 bg-steel max-lg:hidden" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgb(255_255_255/0.08),transparent_55%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:py-28">
          <div>
            <span className="tag-bar tag-bar-brand">Audio · CCTV · Electronics</span>
            <h1 className="display mt-6 text-6xl sm:text-7xl lg:text-8xl">
              Sound.
              <br />
              Security.
              <br />
              <span className="text-brand">Technology.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/75">{site.tagline}</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/products" className="btn">
                Browse products
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/contact" className="btn btn-outline">
                Talk to sales
              </Link>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/products?category=${c.slug}`}
                  className="flex aspect-square flex-col items-center justify-center gap-3 border border-white/10 bg-black/40 p-4 text-center backdrop-blur transition hover:border-white/40 hover:bg-black/60"
                >
                  <CategoryIcon slug={c.slug} className="size-9 text-white" strokeWidth={1.4} />
                  <span className="text-xs font-bold uppercase tracking-wider">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How to buy */}
      <section className="border-b border-black/10 bg-mist">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_3fr] lg:items-center">
          <div>
            <h2 className="display text-3xl">How to buy</h2>
            <p className="mt-2 text-sm text-neutral-600">No cart, no checkout — just a quote built for you.</p>
          </div>
          <ol className="grid gap-6 sm:grid-cols-3">
            {buySteps.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="display text-5xl text-brand">{i + 1}</span>
                <div>
                  <p className="flex items-center gap-2 font-bold uppercase tracking-wider">
                    <step.icon className="size-4 text-steel" aria-hidden />
                    {step.title}
                  </p>
                  <p className="mt-1 text-sm text-neutral-600">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Shop by category"
          title={
            <>
              What we <span className="text-brand">carry</span>
            </>
          }
          description="From sound materials to complete surveillance systems — browse by category and check the full specs."
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/products?category=${c.slug}`}
                className="group flex h-full gap-5 border border-black/10 p-6 transition hover:border-brand hover:shadow-lg"
              >
                <span className="grid size-14 shrink-0 place-items-center bg-ink text-white transition group-hover:bg-brand">
                  <CategoryIcon slug={c.slug} className="size-7" strokeWidth={1.5} />
                </span>
                <span>
                  <span className="block font-bold uppercase tracking-wide group-hover:text-brand">{c.name}</span>
                  <span className="mt-1 block text-sm text-neutral-600">{c.description}</span>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-steel">
                    {counts[c.slug] ?? 0} items
                    <ArrowRight className="size-3.5 transition group-hover:translate-x-1" aria-hidden />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Featured products */}
      <section className="bg-mist py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Featured"
              title={
                <>
                  Popular <span className="text-brand">picks</span>
                </>
              }
            />
            <Link href="/products" className="btn btn-dark">
              View all products
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.slice(0, 8).map((p) => (
              <ProductCard key={p.slug} product={p} categoryName={categoryNames[p.category]} />
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Services"
            title={
              <>
                We supply. <span className="text-brand">We install.</span>
              </>
            }
            description="Our technicians design, install and maintain sound and security systems for homes, businesses, churches, schools and events."
          />
          <Link href="/services" className="btn btn-dark">
            All services
          </Link>
        </div>
        <ul className="mt-10 grid gap-px overflow-hidden border border-black/10 bg-black/10 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <li key={s.slug} className="bg-white p-7">
              <ServiceIcon slug={s.slug} className="size-8 text-brand" strokeWidth={1.5} />
              <h3 className="mt-4 font-bold uppercase tracking-wide">{s.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{s.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Why us */}
      <section className="bg-ink py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Why Audio4Design"
            title={
              <>
                Built on <span className="text-brand">service</span>
              </>
            }
          />
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((r) => (
              <li key={r.title} className="border-t-2 border-brand pt-5">
                <r.icon className="size-7 text-brand" strokeWidth={1.5} aria-hidden />
                <h3 className="mt-4 font-bold uppercase tracking-wide">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{r.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
