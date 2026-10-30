"use client";

import { use } from "react";
import { ProductForm } from "@/components/admin/product-form";
import { Loading, Notice } from "@/components/admin/ui";
import { useApi } from "@/lib/admin-api";
import type { Product } from "@/lib/types";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error } = useApi<Product>(`/admin/products/${id}`);

  if (error) return <Notice tone="error">{error}</Notice>;
  if (!data) return <Loading />;
  return <ProductForm key={data.id} product={data} />;
}
