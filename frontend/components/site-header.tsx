"use client";

import { Clock, Mail, Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { telHref } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteHeader({ site }: { site: SiteSettings }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const showTopBar = site.topBarShowHours || site.topBarShowPhone || site.topBarShowEmail;

  return (
    <>
      {showTopBar && (
        <div className="bg-ink text-xs text-white/75">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              {site.topBarShowHours && (
                <>
                  <Clock className="size-3.5 text-brand" aria-hidden />
                  {site.hours}
                </>
              )}
            </span>
            <div className="flex min-w-0 items-center gap-5">
              {site.topBarShowPhone && (
                <a href={telHref(site.phone)} className="inline-flex items-center gap-1.5 hover:text-white">
                  <Phone className="size-3.5 text-brand" aria-hidden />
                  {site.phone}
                </a>
              )}
              {site.topBarShowEmail && (
                <a href={`mailto:${site.email}`} className="inline-flex min-w-0 items-center gap-1.5 truncate hover:text-white">
                  <Mail className="size-3.5 shrink-0 text-brand" aria-hidden />
                  {site.email}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
          <Link href="/" aria-label={`${site.companyName} — Home`} className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- logo URL is set in the admin */}
            <img src={site.logoUrl} alt={site.companyName} className="h-10 w-auto sm:h-12" />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
            {site.nav.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                    active ? "text-brand" : "text-ink hover:text-brand"
                  }`}
                >
                  {link.label}
                  {active && <span className="absolute inset-x-0 -bottom-0.5 h-0.5 -skew-x-12 bg-brand" />}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/contact" className="btn hidden lg:inline-flex">
              {site.headerButtonLabel}
            </Link>
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center text-ink md:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        {open && (
          <nav id="mobile-nav" aria-label="Mobile" className="border-t border-black/10 bg-white md:hidden">
            <ul className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
              {site.nav.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`block border-b border-black/5 py-3 text-sm font-bold uppercase tracking-wider ${
                      isActive(pathname, link.href) ? "text-brand" : "text-ink"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="py-4">
                <Link href="/contact" onClick={() => setOpen(false)} className="btn w-full">
                  {site.headerButtonLabel}
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>
    </>
  );
}
