import { Lock, Phone } from "lucide-react";
import Link from "next/link";
import { site } from "@/lib/site";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="tag-bar">{eyebrow}</span>
      <h2 className="display mt-4 text-4xl sm:text-5xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-relaxed text-neutral-600">{description}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="absolute inset-y-0 -right-16 w-1/3 -skew-x-12 bg-brand max-sm:hidden" />
      <div className="absolute inset-y-0 right-[30%] w-3 -skew-x-12 bg-steel max-sm:hidden" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <span className="tag-bar tag-bar-brand">{eyebrow}</span>
        <h1 className="display mt-4 text-5xl sm:text-6xl">{title}</h1>
        {description && <p className="mt-4 max-w-xl text-white/75">{description}</p>}
      </div>
    </section>
  );
}

export function PricingNote() {
  return (
    <div className="flex gap-4 border-l-4 border-brand bg-mist p-5">
      <Lock className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
      <div className="text-sm leading-relaxed">
        <p className="font-bold uppercase tracking-wider">Pricing upon request</p>
        <p className="mt-1 text-neutral-600">
          We don&apos;t publish prices online. Our sales team will prepare a quotation based on quantity,
          configuration and installation needs — and we&apos;re open to discussing the best deal for your project.
        </p>
      </div>
    </div>
  );
}

export function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-brand text-white">
      <div className="absolute inset-y-0 -left-10 w-1/5 -skew-x-12 bg-black/15" />
      <div className="absolute inset-y-0 right-[12%] w-4 -skew-x-12 bg-black/20" />
      <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="display text-4xl sm:text-5xl">Found what you need?</h2>
          <p className="mt-3 max-w-xl text-white/85">
            Talk to our sales team for pricing, availability and package deals for your project.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/contact" className="btn btn-dark">
            Contact Sales
          </Link>
          <a href={site.phoneHref} className="btn btn-outline">
            <Phone className="size-4" aria-hidden />
            {site.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
