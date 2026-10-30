"use client";

import { ExternalLink, FileText, Folder, Inbox, LayoutGrid, LogOut, Menu, Package, Settings, Wrench, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/admin-api";
import { Loading } from "./ui";

type User = { id: number; email: string; name: string };

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; exact?: boolean; badge?: boolean };

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutGrid, exact: true },
      { href: "/admin/inquiries", label: "Inquiries", icon: Inbox, badge: true },
    ],
  },
  {
    title: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: Folder },
    ],
  },
  {
    title: "Website content",
    items: [
      { href: "/admin/content", label: "Page content", icon: FileText },
      { href: "/admin/services", label: "Services", icon: Wrench },
      { href: "/admin/settings", label: "Site settings", icon: Settings },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [newInquiries, setNewInquiries] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    api<User>("/auth/me").then(setUser).catch(() => {});
  }, []);

  // Refresh the "new inquiries" badge on navigation.
  useEffect(() => {
    api<{ counts: { new: number } }>("/admin/inquiries?status=new")
      .then((d) => setNewInquiries(d.counts.new))
      .catch(() => {});
  }, [pathname]);

  async function signOut() {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
  }

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas">
        <Loading label="Checking your session…" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-wrap bg-canvas text-sm text-ink">
      <aside className="flex w-full flex-col bg-ink text-white/75 lg:w-62 lg:shrink-0">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <Link href="/admin" aria-label="Audio4Design admin — Dashboard" className="inline-flex flex-col items-end">
            <span className="display text-2xl tracking-tight">
              <span className="text-[#e5323d]">Audio</span>
              <span className="mx-px text-[1.35em] text-white">4</span>
              <span className="text-[#e5323d]">Design</span>
            </span>
            <span className="tag-bar -mt-px px-3! py-0.5! text-[8px]!">Admin</span>
          </Link>
          <button
            type="button"
            className="grid size-10 place-items-center text-white lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="admin-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        <div id="admin-nav" className={`${menuOpen ? "flex" : "hidden"} flex-1 flex-col lg:flex`}>
          <nav aria-label="Admin" className="flex flex-1 flex-col gap-5 px-3 py-4">
            {groups.map((group) => (
              <div key={group.title}>
                <p className="mb-1.5 ml-3 text-[11px] font-bold tracking-[0.14em] text-white/50 uppercase">{group.title}</p>
                {group.items.map((item) => {
                  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-10 items-center gap-3 rounded-r-md border-l-3 px-3 font-semibold transition ${
                        active ? "border-brand bg-white/8 text-white" : "border-transparent hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <item.icon className="size-4.5" strokeWidth={1.8} aria-hidden />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && newInquiries > 0 && (
                        <span className="min-w-5 rounded-full bg-brand px-1.5 py-0.5 text-center text-[11px] font-bold text-white">
                          {newInquiries}
                          <span className="sr-only"> new</span>
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="flex flex-col gap-1 border-t border-white/10 p-3">
            <a href="/" target="_blank" rel="noreferrer" className="flex min-h-10 items-center gap-3 px-3 font-semibold hover:text-white">
              <ExternalLink className="size-4.5" strokeWidth={1.8} aria-hidden />
              View live site
            </a>
            <div className="flex items-center gap-3 px-3 py-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{user.name}</p>
                <p className="truncate text-xs text-white/60">{user.email}</p>
              </div>
              <button type="button" onClick={signOut} aria-label="Sign out" className="grid size-9 place-items-center text-white/70 hover:text-white">
                <LogOut className="size-4.5" strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 basis-[560px] px-4 py-7 sm:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-6">{children}</div>
      </main>
    </div>
  );
}
