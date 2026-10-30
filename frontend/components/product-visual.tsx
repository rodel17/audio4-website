import type { Product } from "@/lib/types";
import { NamedIcon } from "./icons";

// Shows the product's main photo, or a branded placeholder until a photo is uploaded.
export function ProductVisual({
  product,
  image = product.images[0],
  className = "",
}: {
  product: Pick<Product, "name" | "images" | "categoryIcon">;
  image?: string;
  className?: string;
}) {
  if (image) {
    return (
      <div className={`relative overflow-hidden bg-white ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- photos are uploaded through the admin */}
        <img src={image} alt={product.name} className="absolute inset-0 size-full object-contain p-4" loading="lazy" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-ink ${className}`} role="img" aria-label={product.name}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgb(255_255_255/0.14),transparent_65%)]" />
      <div className="absolute inset-y-0 -right-8 w-1/4 -skew-x-12 bg-brand" />
      <div className="absolute inset-y-0 right-[24%] w-2 -skew-x-12 bg-steel" />
      <div className="absolute inset-0 grid place-items-center">
        <NamedIcon name={product.categoryIcon} className="size-1/3 text-white" strokeWidth={1.1} />
      </div>
    </div>
  );
}
