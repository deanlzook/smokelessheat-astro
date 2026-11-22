# smokelessheat-astro

Modern Astro rebuild of the Smokeless Heat website.

High-efficiency wood gasification boilers (Varmebaronen Vedolux), thermal storage tanks, and clean heating solutions. Deployed to Cloudflare Workers.

## Getting Started

```bash
npm install
npm run dev
```

Site will be available at `http://localhost:4321`.

## Deployment

Connect this repository to a Cloudflare Worker for automatic deployments on push to `main`.

For Astro on Cloudflare Workers, consider adding the `@astrojs/cloudflare` adapter when ready for server features. Static output works well with Workers or Pages.

## Structure

- `src/pages/` – site pages (index, about, boilers, etc.)
- `src/pages/products/[category].astro` – category listing pages (`/products/<category>`)
- `src/pages/products/[category]/[slug].astro` – product pages (`/products/<category>/<slug>`)
- `src/data/products/` – the product catalog, one Markdown file per product
- `src/content/config.ts` – `products` content collection schema (Zod)
- `src/lib/categories.ts` – product categories (title, blurb, card style)
- `src/components/` – Header, Footer, `products/ProductCard`
- `src/layouts/` – main Layout, `ProductLayout` (shared product page design)
- Tailwind with custom theme (cream, wood, charcoal, ember)

## Adding a product

Products are an [Astro content collection](https://docs.astro.build/en/guides/content-collections/) (Content Layer `glob()` loader; enabled with `experimental.contentLayer` on Astro 4). Each Markdown file in `src/data/products/` becomes a page and appears automatically on its category page and in the `/products` overview.

1. Create `src/data/products/<slug>.md`. The file name is the URL slug unless you set `slug:` in the frontmatter.
2. Add the frontmatter. `title`, `category`, `shortDescription` and `images` (at least one) are required. `category` must be one of `wood-boilers`, `thermal-storage`, `pellet-boilers` or `heating-accessories`.
3. Write the long description below the frontmatter in Markdown. Raw HTML is allowed where you need a special layout.
4. Run `npm run build` (or `npm run dev`). The page is served at `/products/<category>/<slug>`. If a field is missing or invalid, the build fails and names the field.

```md
---
title: Vedolux Lambda 350
category: wood-boilers
shortDescription: Wood Gasification Boiler with Lambda control
order: 1                    # position on the category page (lower = first)
status: available           # available | legacy | discontinued
series: Vedolux Lambda      # small orange label above the name
brand: Värmebaronen
price: "$12,376.00"         # string as shown, or a number (formatted as USD)
sku: "6263"
seoDescription: Lambda-controlled wood gasification boiler.
images:
  - src: /images/products/Vedolux-Lambda-350-1.jpg   # first image = main photo
    alt: Vedolux Lambda 350
videos:
  - src: https://www.youtube.com/embed/1qG62ewjmdw
    title: Vedolux video
manuals:
  - title: Vedolux 350 Manual (PDF)
    href: /images/VEDOLUX_350_2012-10-09_Smokeless-1.pdf
specs:
  - { label: Output, value: "35 kW / 120 kBTU" }
related: [vedolux-lambda-450]   # slugs of other products
listing:
  summary: Wood gasification boiler with lambda control. ~35 kW / 120 kBTU.
footnote: Contact Smokeless Heat for availability.
---

### Wood Gasification Boiler with Lambda control

Description in **Markdown**...
```

Optional fields you can use as needed:

- `heading` overrides the h1 when it differs from `title`.
- `seoTitle` overrides the browser title.
- `featured` marks a product as featured.
- `compareAtPrice` shows a struck-through original price.
- `stockNote` adds an orange note under the button.
- `categoriesLabel` and `stockLabel` add entries to the SKU row.
- `cta: { label, href }` replaces the "Call to Order" button.
- `videosTitle` puts the videos in their own section.
- `listing.title`, `.eyebrow`, `.image`, `.imageAlt`, `.showPrice` and `.badge` adjust the category-page card.
- `images[1..]` (with an optional `caption`) are shown under the description.

See `src/content/config.ts` for the full schema.

To add a new category, add it to `src/lib/categories.ts`. The schema enum, the routes and the `/products` overview all read from that list.

## Next Steps

- Integrate real images/photos
- Set up Cloudflare Worker connection and custom domain
- Expand content from current site and brochures
