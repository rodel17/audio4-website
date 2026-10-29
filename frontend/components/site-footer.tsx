import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { getCategories, getServices } from "@/lib/catalog";
import { site } from "@/lib/site";
import { Wordmark } from "./wordmark";

export async function SiteFooter() {
  const [categories, services] = await Promise.all([getCategories(), getServices()]);

  return (
    <footer className="bg-ink text-sm text-white/70">
      <div className="h-1.5 bg-brand" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Wordmark />
          <p className="mt-5 max-w-xs leading-relaxed">{site.tagline}</p>
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
              <a href={site.phoneHref} className="hover:text-white">
                {site.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              <a href={`mailto:${site.email}`} className="hover:text-white">
                {site.email}
              </a>
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              <span>{site.address}</span>
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
          <p>
            © {new Date().getFullYear()} {site.name} All rights reserved.
          </p>
          <p>Prices are not published online. Contact our sales team for a quotation.</p>
        </div>
      </div>
    </footer>
  );
}
