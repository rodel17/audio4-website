import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { ProductVisual } from "@/components/product-visual";
import { PageHero } from "@/components/sections";
import { getContent, getProduct, getServices } from "@/lib/catalog";
import { telHref } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const text = await getContent("contact");
  return { title: text.title, description: text.description };
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ContactPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const productSlug = typeof params.product === "string" ? params.product : undefined;
  const serviceSlug = typeof params.service === "string" ? params.service : undefined;
  const [text, site, product, services] = await Promise.all([
    getContent("contact"),
    getContent("site"),
    productSlug ? getProduct(productSlug) : null,
    getServices(),
  ]);
  const service = services.find((s) => s.slug === serviceSlug && s.offerInForm);

  const contacts = [
    { icon: Phone, label: "Call sales", value: site.phone, href: telHref(site.phone) },
    { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    { icon: MapPin, label: "Visit us", value: site.address, href: site.mapUrl || undefined },
    { icon: Clock, label: "Business hours", value: site.hours },
  ];

  return (
    <>
      <PageHero eyebrow={text.eyebrow} title={text.title} description={text.description} />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {product && (
            <div className="flex items-center gap-4 border border-black/10 bg-mist p-4">
              <ProductVisual product={product} className="size-20 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-steel">You&apos;re inquiring about</p>
                <p className="mt-1 font-bold">{product.name}</p>
                <Link href={`/products/${product.slug}`} className="mt-1 inline-block text-xs font-semibold text-brand hover:underline">
                  View product details
                </Link>
              </div>
            </div>
          )}
          <ContactForm
            content={text}
            defaultSubject={product?.name ?? service?.name ?? ""}
            productSlug={product?.slug}
            serviceSlug={service?.slug}
            phone={site.phone}
            email={site.email}
          />
        </div>

        <aside className="space-y-6">
          <div className="bg-ink p-6 text-white">
            <h2 className="display text-2xl">{text.sideTitle}</h2>
            <ul className="mt-5 space-y-5">
              {contacts.map((c) => (
                <li key={c.label} className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center bg-brand">
                    <c.icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 text-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-white/60">{c.label}</p>
                    {c.href ? (
                      <a href={c.href} className="mt-0.5 block break-words font-semibold hover:text-brand">
                        {c.value}
                      </a>
                    ) : (
                      <p className="mt-0.5 font-semibold">{c.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {text.nextSteps.length > 0 && (
            <div className="border border-black/10 p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider">{text.nextStepsTitle}</h2>
              <ol className="mt-4 space-y-4">
                {text.nextSteps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-neutral-600">
                    <span className="display text-2xl text-brand">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
