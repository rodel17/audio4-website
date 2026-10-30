"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { ProductVisual } from "./product-visual";

export function ProductGallery({ product }: { product: Pick<Product, "name" | "images" | "categoryIcon"> }) {
  const [index, setIndex] = useState(0);
  const images = product.images;

  return (
    <div className="flex flex-col gap-3">
      <ProductVisual product={product} image={images[index]} className="aspect-square border border-black/10" />
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3" role="group" aria-label="Product photos">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={i === index}
              className={`relative aspect-square overflow-hidden border bg-white ${
                i === index ? "border-2 border-brand" : "border-black/10 hover:border-black/30"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- photos are uploaded through the admin */}
              <img src={src} alt="" className="absolute inset-0 size-full object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
