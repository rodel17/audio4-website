import { ArrowRight, CircleCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ServiceIcon } from "@/components/icons";
import { CtaBand, PageHero, SectionHeading } from "@/components/sections";
import { getServices } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Services",
  description: "Sound system and CCTV installation, repair, maintenance, site surveys and structured cabling.",
};

const process = [
  { title: "Consultation", text: "Tell us what you need — by phone, email or our inquiry form." },
  { title: "Site survey", text: "We visit your location to assess the space and requirements." },
  { title: "Quotation", text: "You receive an itemized proposal we can adjust together." },
  { title: "Installation", text: "Our technicians install, configure and test everything." },
  { title: "Support", text: "Hand-over, training and after-sales service when you need it." },
];

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <PageHero
        eyebrow="Services"
        title="We supply. We install."
        description="Design, installation, repair and maintenance for sound, surveillance and electronic systems."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          {services.map((s) => (
            <article key={s.slug} id={s.slug} className="flex scroll-mt-28 flex-col border border-black/10 p-7 sm:p-8">
              <div className="flex items-start gap-5">
                <span className="grid size-14 shrink-0 place-items-center bg-ink text-white">
                  <ServiceIcon slug={s.slug} className="size-7" strokeWidth={1.5} />
                </span>
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-wide">{s.name}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{s.summary}</p>
                </div>
              </div>
              <ul className="mt-6 grid flex-1 gap-2 sm:grid-cols-2">
                {s.includes.map((item) => (
                  <li key={item} className="flex gap-2 text-sm">
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={`/contact?service=${s.slug}`}
                className="mt-6 inline-flex items-center gap-1.5 self-start text-sm font-bold uppercase tracking-wider text-brand hover:text-brand-dark"
              >
                Request this service
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-mist py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="How we work"
            title={
              <>
                From inquiry to <span className="text-brand">installation</span>
              </>
            }
          />
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {process.map((step, i) => (
              <li key={step.title} className="border-t-4 border-brand bg-white p-6">
                <span className="display text-4xl text-steel">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 font-bold uppercase tracking-wide">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
