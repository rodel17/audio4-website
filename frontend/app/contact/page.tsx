import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { ProductVisual } from "@/components/product-visual";
import { PageHero } from "@/components/sections";
import { getProduct, getService } from "@/lib/catalog";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Sales",
  description: "Request a quotation for products or services from Audio 4 Design N Technology Corp.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const nextSteps = [
  "Our sales team reviews your inquiry.",
  "We contact you to confirm details and requirements.",
  "You receive a quotation — and we can discuss the best deal.",
];

export default async function ContactPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const productSlug = typeof params.product === "string" ? params.product : undefined;
  const serviceSlug = typeof params.service === "string" ? params.service : undefined;
  const [product, service] = await Promise.all([
    productSlug ? getProduct(productSlug) : undefined,
    serviceSlug ? getService(serviceSlug) : undefined,
  ]);

  const defaultSubject = product?.name ?? service?.name ?? "";

  const contacts = [
    { icon: Phone, label: "Call sales", value: site.phone, href: site.phoneHref },
    { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    { icon: MapPin, label: "Visit us", value: site.address },
    { icon: Clock, label: "Business hours", value: site.hours },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact sales"
        title="Request a quote"
        description="Tell us what you need and our sales team will get back to you with pricing and availability."
      />

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
          <ContactForm defaultSubject={defaultSubject} />
        </div>

        <aside className="space-y-6">
          <div className="bg-ink p-6 text-white">
            <h2 className="display text-2xl">Prefer to talk?</h2>
            <ul className="mt-5 space-y-5">
              {contacts.map((c) => (
                <li key={c.label} className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center bg-brand">
                    <c.icon className="size-5" aria-hidden />
                  </span>
                  <div className="text-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-white/60">{c.label}</p>
                    {c.href ? (
                      <a href={c.href} className="mt-0.5 block font-semibold hover:text-brand">
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

          <div className="border border-black/10 p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider">What happens next</h2>
            <ol className="mt-4 space-y-4">
              {nextSteps.map((step, i) => (
                <li key={step} className="flex gap-3 text-sm text-neutral-600">
                  <span className="display text-2xl text-brand">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </>
  );
}
