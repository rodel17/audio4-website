import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductVisual } from "./product-visual";

export function ProductCard({
  product,
  quoteLabel,
  inquireLabel,
}: {
  product: Product;
  quoteLabel: string;
  inquireLabel: string;
}) {
  return (
    <article className="group relative flex flex-col border border-black/10 bg-white transition duration-200 hover:-translate-y-1 hover:border-black/20 hover:shadow-xl">
      <ProductVisual product={product} className="aspect-[4/3]" />
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-brand">{product.categoryName}</p>
        <h3 className="mt-1.5 text-base font-bold leading-snug">
          {/* Stretched link: the whole card opens the product page. */}
          <Link href={`/products/${product.slug}`} className="after:absolute after:inset-0 group-hover:text-brand">
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">{product.summary}</p>
        <div className="mt-5 flex items-center justify-between gap-2 border-t border-black/10 pt-4 text-xs font-bold uppercase tracking-wider">
          <span className="inline-flex items-center gap-1.5 text-steel">
            <Lock className="size-3.5" aria-hidden />
            {quoteLabel}
          </span>
          <Link
            href={`/contact?product=${product.slug}`}
            className="relative z-10 inline-flex items-center gap-1 text-brand hover:text-brand-dark"
          >
            {inquireLabel}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
