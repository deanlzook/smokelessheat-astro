import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { CATEGORIES, getCategory } from '../lib/categories';
import { productUrl } from '../lib/products';
import type { SearchItem } from '../lib/search';

const blogSources = import.meta.glob('./blog/*.astro', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const pageSources = import.meta.glob('./*.astro', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const TITLE_SUFFIXES = [' | Smokeless Heat Blog', ' | Smokeless Heat'];

function cleanTitle(title: string): string {
  let t = title.trim();
  for (const suffix of TITLE_SUFFIXES) {
    if (t.endsWith(suffix)) t = t.slice(0, -suffix.length).trim();
  }
  return t;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&lsquo;|&rsquo;/gi, "'")
    .replace(/&mdash;|&ndash;/gi, '—')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&[a-z]+;/gi, ' ');
}

/** Strip Astro/HTML markup down to visible text. */
export function stripToText(source: string): string {
  return decodeEntities(
    source
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<iframe[\s\S]*?<\/iframe>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      // Astro expressions / JS in the template
      .replace(/\{[\s\S]*?\}/g, ' ')
      .replace(/<\/?(p|div|h[1-6]|li|br|tr|td|th|blockquote|section|article|figcaption|header|footer)[^>]*>/gi, '\n')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

function parseAstroPage(source: string): { title: string; description: string; body: string } {
  const fm = source.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  const template = fm ? source.slice(fm[0].length) : source;
  const titleMatch = source.match(/\btitle="([^"]*)"/);
  const descMatch = source.match(/\bdescription="([^"]*)"/);
  const h1Match = template.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const title =
    cleanTitle(titleMatch?.[1] ?? '') ||
    cleanTitle(stripToText(h1Match?.[1] ?? ''));
  return {
    title,
    description: descMatch?.[1]?.trim() ?? '',
    body: stripToText(template),
  };
}

function hrefFromGlob(globKey: string): string {
  const rel = globKey.replace(/^\.\//, '').replace(/\.astro$/, '');
  if (rel === 'index') return '/';
  if (rel.endsWith('/index')) return '/' + rel.slice(0, -'/index'.length);
  return '/' + rel;
}

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const SKIP_PAGES = new Set(['/search']);

async function buildSearchIndex(): Promise<SearchItem[]> {
  const items: SearchItem[] = [];

  for (const [key, source] of Object.entries(blogSources)) {
    const href = hrefFromGlob(key);
    if (href === '/blog') continue; // listed with the other main pages
    const parsed = parseAstroPage(source);
    if (!parsed.title) continue;
    items.push({
      title: parsed.title,
      href,
      type: 'Blog',
      description: parsed.description,
      text: [parsed.description, parsed.body].filter(Boolean).join('\n'),
    });
  }

  for (const [key, source] of Object.entries(pageSources)) {
    const href = hrefFromGlob(key);
    if (SKIP_PAGES.has(href)) continue;
    const parsed = parseAstroPage(source);
    const title = href === '/' ? 'Smokeless Heat' : parsed.title;
    if (!title) continue;
    items.push({
      title,
      href,
      type: 'Page',
      description: parsed.description,
      text: [parsed.description, parsed.body].filter(Boolean).join('\n'),
    });
  }

  items.push({
    title: 'Blog',
    href: '/blog',
    type: 'Page',
    description: 'Articles and guides about wood gasification boilers, Vedolux, thermal storage, and clean wood heating.',
    text: 'blog posts articles insights',
  });

  for (const cat of CATEGORIES) {
    items.push({
      title: cat.title,
      href: `/products/${cat.slug}`,
      type: 'Page',
      description: cat.description,
      text: [cat.description, cat.slug.replace(/-/g, ' ')].join('\n'),
    });
  }

  const products = await getCollection('products');
  for (const p of products) {
    const category = getCategory(p.data.category);
    const parts = [
      p.data.title,
      p.data.heading,
      p.data.shortDescription,
      p.data.brand,
      p.data.series,
      p.data.seoTitle,
      p.data.seoDescription,
      p.data.listing?.title,
      p.data.listing?.summary,
      p.data.listing?.eyebrow,
      p.data.listing?.badge,
      p.data.sku,
      p.data.stockNote,
      p.data.stockLabel,
      p.data.footnote,
      p.data.categoriesLabel,
      category?.title,
      p.data.category.replace(/-/g, ' '),
      ...(p.data.manuals ?? []).map((m) => m.title),
      ...(p.data.specs ?? []).map((s) => `${s.label} ${s.value}`),
      p.body ? stripMarkdown(p.body) : '',
    ].filter((v): v is string => Boolean(v));

    items.push({
      title: p.data.title,
      href: productUrl(p),
      type: 'Product',
      description: p.data.shortDescription,
      text: parts.join('\n'),
    });
  }

  return items;
}

export const GET: APIRoute = async () => {
  const items = await buildSearchIndex();
  return new Response(JSON.stringify(items), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
