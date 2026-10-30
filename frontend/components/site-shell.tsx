import { getContent } from "@/lib/catalog";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/** Header and footer around every public page. */
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const site = await getContent("site");
  return (
    <>
      <SiteHeader site={site} />
      <main className="flex-1">{children}</main>
      <SiteFooter site={site} />
    </>
  );
}
