import { getCollection, type CollectionEntry } from 'astro:content';

export type Product = CollectionEntry<'products'>;

/** URL slug for a product (frontmatter `slug`, else the entry id). */
export const productSlug = (p: Product) => p.data.slug ?? p.id;

/** Canonical URL: /products/<category>/<slug> */
export const productUrl = (p: Product) => `/products/${p.data.category}/${productSlug(p)}`;

/** Format a price field: strings are shown as written, numbers as USD. */
export function formatPrice(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }
  return value;
}

/** All products, sorted by `order` then title. Optionally filtered by category. */
export async function getProducts(category?: string): Promise<Product[]> {
  const all = await getCollection('products', (p) => !category || p.data.category === category);
  return all.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}
