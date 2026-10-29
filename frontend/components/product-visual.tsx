import Image from "next/image";
import type { Product } from "@/lib/types";
import { CategoryIcon } from "./icons";

// Shows the product photo, or a branded placeholder until real photos are added.
export function ProductVisual({ product, className = "" }: { product: Product; className?: string }) {
  if (product.image) {
    return (
      <div className={`relative overflow-hidden bg-white ${className}`}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain p-6"
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-ink ${className}`} role="img" aria-label={product.name}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgb(255_255_255/0.14),transparent_65%)]" />
      <div className="absolute inset-y-0 -right-8 w-1/4 -skew-x-12 bg-brand" />
      <div className="absolute inset-y-0 right-[24%] w-2 -skew-x-12 bg-steel" />
      <div className="absolute inset-0 grid place-items-center">
        <CategoryIcon slug={product.category} className="size-1/3 text-white" strokeWidth={1.1} />
      </div>
    </div>
  );
}
