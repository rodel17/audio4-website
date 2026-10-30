// Server-side data access for the public site. Every call goes to the FastAPI backend, which caches
// responses in Redis and clears them when the admin saves, so edits show up on the next page load.
import { cache } from "react";
import type { Category, ContentMap, ProductDetail, ProductPage, PublicContentKey, Service } from "./types";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

async function apiGet<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${path} failed with status ${res.status}`);
  return res.json() as Promise<T>;
}

// cache() de-duplicates calls within one page render (layout, page and components share results).
export const getContent = cache(async <K extends PublicContentKey>(key: K): Promise<ContentMap[K]> => {
  const content = await apiGet<ContentMap[K]>(`/api/content/${key}`);
  if (!content) throw new Error(`Missing content: ${key}`);
  return content;
});

export const getCategories = cache(async (): Promise<Category[]> => (await apiGet<Category[]>("/api/categories")) ?? []);

export const getServices = cache(async (): Promise<Service[]> => (await apiGet<Service[]>("/api/services")) ?? []);

export async function getProductPage(
  filters: { category?: string; q?: string; page?: number; pageSize?: number; featured?: boolean } = {},
): Promise<ProductPage> {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.q) params.set("q", filters.q);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  if (filters.featured) params.set("featured", "true");
  return (await apiGet<ProductPage>(`/api/products?${params}`))!;
}

export const getProduct = cache(
  async (slug: string): Promise<ProductDetail | null> => apiGet<ProductDetail>(`/api/products/${encodeURIComponent(slug)}`),
);
