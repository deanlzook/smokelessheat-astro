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
- `src/components/` – Header, Footer
- `src/layouts/` – main Layout
- Tailwind with custom theme (cream, wood, charcoal, ember)

## Next Steps

- Add product pages for Vedolux boilers and storage tanks
- Integrate real images/photos
- Set up Cloudflare Worker connection and custom domain
- Expand content from current site and brochures
