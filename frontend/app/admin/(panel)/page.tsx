"use client";

import { Circle, CircleCheck } from "lucide-react";
import Link from "next/link";
import { InquiryStatusPill, Loading, Notice, PageHeader, btn } from "@/components/admin/ui";
import { useApi } from "@/lib/admin-api";
import { timeAgo } from "@/lib/format";
import type { Inquiry } from "@/lib/types";

type Dashboard = {
  stats: {
    newInquiries: number;
    openInquiries: number;
    publishedProducts: number;
    featuredProducts: number;
    categories: number;
    services: number;
  };
  recentInquiries: Inquiry[];
  checklist: { label: string; note: string; href: string; done: boolean }[];
};

export default function DashboardPage() {
  const { data, error } = useApi<Dashboard>("/admin/dashboard");

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="New inquiries and the state of your website content."
        actions={
          <>
            <a href="/" target="_blank" rel="noreferrer" className={btn.secondary}>
              View live site
            </a>
            <Link href="/admin/products/new" className={btn.primary}>
              + Add product
            </Link>
          </>
        }
      />
      {error && <Notice tone="error">{error}</Notice>}
      {!data ? (
        !error && <Loading />
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            {[
              { label: "New inquiries", value: data.stats.newInquiries, note: "Waiting for a reply", href: "/admin/inquiries", accent: "border-t-brand" },
              { label: "Open inquiries", value: data.stats.openInquiries, note: "Contacted or quoted", href: "/admin/inquiries", accent: "border-t-steel" },
              {
                label: "Published products",
                value: data.stats.publishedProducts,
                note: `${data.stats.featuredProducts} featured on the homepage`,
                href: "/admin/products",
                accent: "border-t-ink",
              },
              {
                label: "Categories · Services",
                value: `${data.stats.categories} · ${data.stats.services}`,
                note: "Shown on the public site",
                href: "/admin/categories",
                accent: "border-t-ink",
              },
            ].map((s) => (
              <Link key={s.label} href={s.href} className={`rounded-lg border border-t-3 border-line bg-white p-5 transition hover:shadow-md ${s.accent}`}>
                <p className="text-[13px] font-semibold text-muted">{s.label}</p>
                <p className="mt-2 text-3xl leading-none font-extrabold">{s.value}</p>
                <p className="mt-2 text-[13px] text-muted">{s.note}</p>
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-start gap-6">
            <section className="min-w-0 flex-[2_1_520px] rounded-lg border border-line bg-white">
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <h2 className="text-base font-bold">Recent inquiries</h2>
                <Link href="/admin/inquiries" className="text-[13px] font-bold text-brand">
                  View all →
                </Link>
              </div>
              {data.recentInquiries.length === 0 ? (
                <p className="px-5 py-10 text-center text-muted">No inquiries yet. They&apos;ll appear here when visitors use the Contact Sales form.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] border-collapse text-left">
                    <thead>
                      <tr className="text-xs tracking-wider text-muted uppercase">
                        <th className="px-5 py-3 font-bold">From</th>
                        <th className="px-5 py-3 font-bold">Interested in</th>
                        <th className="px-5 py-3 font-bold">Received</th>
                        <th className="px-5 py-3 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentInquiries.map((q) => (
                        <tr key={q.id} className="border-t border-[#eef0f2]">
                          <td className="px-5 py-3.5">
                            <Link href={`/admin/inquiries?id=${q.id}`} className="font-bold hover:text-brand">
                              {q.name}
                            </Link>
                            {q.company && <span className="block text-[13px] text-muted">{q.company}</span>}
                          </td>
                          <td className="px-5 py-3.5">{q.subject}</td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-muted">{timeAgo(q.createdAt)}</td>
                          <td className="px-5 py-3.5">
                            <InquiryStatusPill status={q.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-6">
              <section className="rounded-lg border border-line bg-white p-5">
                <h2 className="text-base font-bold">Setup checklist</h2>
                <p className="mt-1 text-[13px] text-muted">Content still using placeholders on the live site.</p>
                <ul className="mt-4 flex flex-col gap-1">
                  {data.checklist.map((c) => (
                    <li key={c.label}>
                      <Link href={c.href} className={`flex items-start gap-3 rounded-md p-2.5 ${c.done ? "" : "bg-[#fff7f7]"}`}>
                        {c.done ? (
                          <CircleCheck className="size-5 shrink-0 text-[#2f7d4f]" aria-label="Done" />
                        ) : (
                          <Circle className="size-5 shrink-0 text-brand" aria-label="To do" />
                        )}
                        <span>
                          <span className={`block font-semibold ${c.done ? "line-through" : ""}`}>{c.label}</span>
                          <span className="block text-xs text-muted">{c.note}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-lg border border-line bg-white p-5">
                <h2 className="text-base font-bold">Quick edits</h2>
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  {[
                    ["Homepage text", "/admin/content/home"],
                    ["Contact details", "/admin/settings#contact"],
                    ["Featured products", "/admin/products?featured=1"],
                    ["Services", "/admin/services"],
                  ].map(([label, href]) => (
                    <Link key={href} href={href} className="rounded-md border border-line p-3.5 font-semibold hover:border-ink">
                      {label}
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </>
  );
}
