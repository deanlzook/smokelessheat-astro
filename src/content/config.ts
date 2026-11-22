// Content collections (Astro Content Layer).
// Astro 4.x keeps this file at src/content/config.ts and needs
// `experimental.contentLayer` in astro.config.mjs; on Astro 5+ the same
// definition can move to src/content.config.ts with the flag removed.
import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { CATEGORY_SLUGS } from '../lib/categories';

const link = z.object({
  title: z.string(),
  href: z.string(),
});

const products = defineCollection({
  // Every Markdown file in src/data/products is one product.
  // The entry id comes from the `slug` frontmatter field (or the file name).
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/data/products' }),
  schema: z.object({
    // Identity & routing
    title: z.string(), // product name (breadcrumb, <title>, search)
    slug: z.string().regex(/^[a-z0-9][a-z0-9.-]*$/).optional(), // URL segment; defaults to file name
    category: z.enum(CATEGORY_SLUGS),
    order: z.number().default(100), // sort position on the category page (lower first)
    status: z.enum(['available', 'legacy', 'discontinued']).default('available'),
    featured: z.boolean().default(false),

    // Display
    brand: z.string().optional(), // manufacturer, e.g. Värmebaronen
    series: z.string().optional(), // small orange label above the product name
    heading: z.string().optional(), // h1 override when it differs from title
    shortDescription: z.string(), // tagline under the h1 / fallback card summary
    seoTitle: z.string().optional(), // defaults to "<title> | Smokeless Heat"
    seoDescription: z.string().optional(),

    // Commerce
    price: z.union([z.string(), z.number()]).optional(), // "$1,799.00", 1799 or "Call for pricing"
    compareAtPrice: z.union([z.string(), z.number()]).optional(), // shown struck through
    sku: z.string().optional(),
    categoriesLabel: z.string().optional(), // "Categories:" text in the meta row
    stockNote: z.string().optional(), // orange note under the order button
    stockLabel: z.string().optional(), // stock text in the meta row
    cta: z
      .object({ label: z.string(), href: z.string() })
      .default({ label: 'Call to Order: 717-389-0083', href: 'tel:7173890083' }),

    // Category-page card overrides (all optional)
    listing: z
      .object({
        title: z.string().optional(),
        eyebrow: z.string().optional(),
        image: z.string().optional(),
        imageAlt: z.string().optional(),
        summary: z.string().optional(),
        showPrice: z.boolean().default(false),
        badge: z.string().optional(),
      })
      .default({}),

    // Media & documents
    // images[0] is the main product photo; any further images are shown
    // (with optional caption) after the description.
    images: z
      .array(
        z.union([
          z.string(),
          z.object({ src: z.string(), alt: z.string().optional(), caption: z.string().optional() }),
        ]),
      )
      .min(1)
      .transform((imgs) => imgs.map((img) => (typeof img === 'string' ? { src: img } : img))),
    videos: z
      .array(
        z.object({
          src: z.string().url(), // embed URL, e.g. https://www.youtube.com/embed/<id>
          title: z.string().optional(),
          caption: z.string().optional(),
          layout: z.enum(['single', 'grid']).optional(),
        }),
      )
      .default([]),
    videosTitle: z.string().optional(), // set to render videos in their own section
    manuals: z.array(link).default([]), // manuals, brochures, PDFs
    specs: z
      .array(
        z.object({
          label: z.string(),
          value: z.union([z.string(), z.number()]),
          group: z.string().optional(),
        }),
      )
      .default([]),
    related: z.array(reference('products')).default([]),
    footnote: z.string().optional(), // small grey note at the bottom of the page
  }),
});

export const collections = { products };
