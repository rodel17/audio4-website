import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const boxClass = "grid size-11 place-items-center text-sm font-bold transition";

export function Pagination({
  page,
  pageCount,
  hrefFor,
}: {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
}) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} aria-label="Previous page" className={`${boxClass} border border-black/15 hover:border-brand hover:text-brand`}>
          <ChevronLeft className="size-4" aria-hidden />
        </Link>
      ) : (
        <span aria-hidden className={`${boxClass} border border-black/10 text-neutral-300`}>
          <ChevronLeft className="size-4" />
        </span>
      )}

      {pages.map((p) =>
        p === page ? (
          <span key={p} aria-current="page" className={`${boxClass} bg-ink text-white`}>
            {p}
          </span>
        ) : (
          <Link key={p} href={hrefFor(p)} aria-label={`Page ${p}`} className={`${boxClass} border border-black/15 hover:border-brand hover:text-brand`}>
            {p}
          </Link>
        ),
      )}

      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} aria-label="Next page" className={`${boxClass} border border-black/15 hover:border-brand hover:text-brand`}>
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : (
        <span aria-hidden className={`${boxClass} border border-black/10 text-neutral-300`}>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
