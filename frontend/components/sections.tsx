import { Lock, Phone } from "lucide-react";
import Link from "next/link";
import { getContent } from "@/lib/catalog";
import { telHref } from "@/lib/format";

/** Renders `text` with the first occurrence of `highlight` in the brand color. */
export function Highlighted({ text, highlight }: { text: string; highlight?: string }) {
  const at = highlight ? text.indexOf(highlight) : -1;
  if (!highlight || at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span className="text-brand">{highlight}</span>
      {text.slice(at + highlight.length)}
    </>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  description?: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <span className="tag-bar">{eyebrow}</span>}
      <h2 className="display mt-4 text-4xl sm:text-5xl">
        <Highlighted text={title} highlight={highlight} />
      </h2>
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
        {eyebrow && <span className="tag-bar tag-bar-brand">{eyebrow}</span>}
        <h1 className="display mt-4 text-5xl sm:text-6xl">{title}</h1>
        {description && <p className="mt-4 max-w-xl text-white/75">{description}</p>}
      </div>
    </section>
  );
}

export function PricingNote({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex gap-4 border-l-4 border-brand bg-mist p-5">
      <Lock className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
      <div className="text-sm leading-relaxed">
        <p className="font-bold uppercase tracking-wider">{title}</p>
        <p className="mt-1 text-neutral-600">{text}</p>
      </div>
    </div>
  );
}

/** The "Contact Sales" banner, edited under Page content › Home. */
export async function CtaBand() {
  const [home, site] = await Promise.all([getContent("home"), getContent("site")]);
  const { cta } = home;

  return (
    <section className="relative overflow-hidden bg-brand text-white">
      <div className="absolute inset-y-0 -left-10 w-1/5 -skew-x-12 bg-black/15" />
      <div className="absolute inset-y-0 right-[12%] w-4 -skew-x-12 bg-black/20" />
      <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="display text-4xl sm:text-5xl">{cta.title}</h2>
          {cta.text && <p className="mt-3 max-w-xl text-white/85">{cta.text}</p>}
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/contact" className="btn btn-dark">
            {cta.buttonLabel}
          </Link>
          {cta.showPhone && (
            <a href={telHref(site.phone)} className="btn btn-outline">
              <Phone className="size-4" aria-hidden />
              {site.phone}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
