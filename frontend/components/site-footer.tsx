import { Clock, Globe, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { getCategories, getServices } from "@/lib/catalog";
import { telHref } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";
import { Wordmark } from "./wordmark";

export async function SiteFooter({ site }: { site: SiteSettings }) {
  const [categories, services] = await Promise.all([getCategories(), getServices()]);
  const copyright = site.footerCopyright.replace("{year}", String(new Date().getFullYear()));

  return (
    <footer className="bg-ink text-sm text-white/70">
      <div className="h-1.5 bg-brand" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Wordmark />
          <p className="mt-5 max-w-xs leading-relaxed">{site.footerAbout}</p>
          {(site.facebookUrl || site.messengerUrl) && (
            <div className="mt-5 flex gap-3">
              {site.facebookUrl && (
                <a href={site.facebookUrl} aria-label="Facebook" className="grid size-10 place-items-center border border-white/15 hover:border-white/50 hover:text-white">
                  <Globe className="size-4" aria-hidden />
                </a>
              )}
              {site.messengerUrl && (
                <a href={site.messengerUrl} aria-label="Messenger" className="grid size-10 place-items-center border border-white/15 hover:border-white/50 hover:text-white">
                  <MessageCircle className="size-4" aria-hidden />
                </a>
              )}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Products</h2>
          <ul className="mt-4 space-y-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/products?category=${c.slug}`} className="hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Services</h2>
          <ul className="mt-4 space-y-2">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services#${s.slug}`} className="hover:text-white">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Contact Sales</h2>
          <ul className="mt-4 space-y-3">
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              <a href={telHref(site.phone)} className="hover:text-white">
                {site.phone}
              </a>
            </li>
            {site.viber && (
              <li className="flex gap-3">
                <MessageCircle className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                <span>Viber / WhatsApp: {site.viber}</span>
              </li>
            )}
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              <a href={`mailto:${site.email}`} className="break-all hover:text-white">
                {site.email}
              </a>
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              {site.mapUrl ? (
                <a href={site.mapUrl} className="hover:text-white">
                  {site.address}
                </a>
              ) : (
                <span>{site.address}</span>
              )}
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              <span>{site.hours}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-white/50 sm:flex-row sm:justify-between sm:px-6">
          <p>{copyright}</p>
          <p>{site.footerPricingNote}</p>
        </div>
      </div>
    </footer>
  );
}
