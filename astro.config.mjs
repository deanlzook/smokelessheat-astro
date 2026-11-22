import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  site: 'https://smokelessheat.com',
  markdown: {
    // Keep product copy exactly as written (no curly-quote / dash rewriting).
    smartypants: false,
  },
  experimental: {
    // Astro Content Layer (glob loader) for src/content/config.ts.
    // Stable (and this flag removed) in Astro 5.
    contentLayer: true,
  },
});
