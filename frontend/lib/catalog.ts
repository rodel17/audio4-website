// Data access for the catalog. Pages only talk to these functions, so switching
// from the local sample data to the FastAPI backend (via API_URL) only touches this file.
import { categories } from "./data/categories";
import { products } from "./data/products";
import { services } from "./data/services";
import type { Category, Product, Service } from "./types";

export async function getCategories(): Promise<Category[]> {
  return categories;
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  return categories.find((c) => c.slug === slug);
}

export async function getProductCounts(): Promise<Record<string, number>> {
  return products.reduce<Record<string, number>>((counts, p) => {
    counts[p.category] = (counts[p.category] ?? 0) + 1;
    return counts;
  }, {});
}

export async function getProducts(filters: { category?: string; q?: string } = {}): Promise<Product[]> {
  const query = filters.q?.trim().toLowerCase();
  return products.filter((p) => {
    if (filters.category && p.category !== filters.category) return false;
    if (!query) return true;
    const haystack = [p.name, p.summary, p.description, ...p.highlights, ...p.specs.map((s) => s.value)]
      .join(" ")
      .toLowerCase();
    return query.split(/\s+/).every((word) => haystack.includes(word));
  });
}

export type ProductPage = {
  items: Product[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
};

export async function getProductPage(
  filters: { category?: string; q?: string; page?: number; pageSize?: number } = {},
): Promise<ProductPage> {
  const pageSize = filters.pageSize ?? 9;
  const matches = await getProducts(filters);
  const pageCount = Math.max(1, Math.ceil(matches.length / pageSize));
  // Out-of-range pages (e.g. after a filter shrinks the results) land on the nearest valid page.
  const page = Math.min(Math.max(1, Math.floor(filters.page ?? 1)), pageCount);
  return {
    items: matches.slice((page - 1) * pageSize, page * pageSize),
    total: matches.length,
    page,
    pageCount,
    pageSize,
  };
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return products.filter((p) => p.featured);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return products.find((p) => p.slug === slug);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  return products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, limit);
}

export async function getServices(): Promise<Service[]> {
  return services;
}

export async function getService(slug: string): Promise<Service | undefined> {
  return services.find((s) => s.slug === slug);
}
