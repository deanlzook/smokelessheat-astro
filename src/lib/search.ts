/**
 * Client-safe search helpers used by the search page and header.
 * No Astro imports — also runnable from Node for tests.
 */

export type SearchType = 'Blog' | 'Product' | 'Page';

export interface SearchItem {
  /** Display title */
  title: string;
  /** Site-relative URL, e.g. /blog/bonded-seal-adapters */
  href: string;
  type: SearchType;
  /** Short description / excerpt for fallback snippets */
  description: string;
  /** Full searchable body text (HTML already stripped) */
  text: string;
}

export interface SearchHit {
  item: SearchItem;
  score: number;
  /** All query words matched (vs only some) */
  allWords: boolean;
  snippet: string;
}

export function tokenize(query: string): string[] {
  const matches = query.toLowerCase().match(/[a-z0-9]+(?:\.[0-9]+)*/g);
  return matches ?? [];
}

/** Simple singular/plural variants so "adapters" matches "adapter" and vice versa. */
export function variants(word: string): string[] {
  const w = word.toLowerCase();
  const out = new Set<string>([w]);
  if (w.length < 3 || /^\d/.test(w)) return [...out];

  const add = (x: string) => {
    if (x.length >= 2) out.add(x);
  };

  if (w.endsWith('ies') && w.length > 4) add(w.slice(0, -3) + 'y');
  else if (/(?:shes|ches|sses|xes|zes)$/.test(w) && w.length > 4) add(w.slice(0, -2));
  else if (w.endsWith('es') && w.length > 3) {
    add(w.slice(0, -2));
    add(w.slice(0, -1));
  } else if (w.endsWith('s') && !w.endsWith('ss')) add(w.slice(0, -1));

  if (w.endsWith('y') && w.length > 2 && !/[aeiou]y$/.test(w)) add(w.slice(0, -1) + 'ies');
  else if (/(?:s|sh|ch|x|z)$/.test(w)) add(w + 'es');
  else if (!w.endsWith('s')) add(w + 's');

  return [...out];
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wordRegex(words: string[]): RegExp {
  const alts = [...new Set(words.flatMap(variants))]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp);
  return new RegExp(`(^|[^a-z0-9])(${alts.join('|')})(?![a-z0-9])`, 'gi');
}

function containsWord(haystack: string, word: string): boolean {
  const alts = variants(word).map(escapeRegExp).join('|');
  return new RegExp(`(^|[^a-z0-9])(${alts})(?![a-z0-9])`, 'i').test(haystack);
}

function firstMatchIndex(text: string, words: string[]): number {
  if (!text || words.length === 0) return -1;
  const re = wordRegex(words);
  const m = re.exec(text);
  if (!m) return -1;
  return m.index + m[1].length;
}

export function makeSnippet(text: string, words: string[], maxLen = 220): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  const idx = firstMatchIndex(cleaned, words);
  let start = 0;
  if (idx > 0) {
    start = Math.max(0, idx - Math.floor(maxLen * 0.3));
    if (start > 0) {
      const sp = cleaned.lastIndexOf(' ', start);
      if (sp > start - 25) start = sp + 1;
    }
  }
  let snippet = cleaned.slice(start, start + maxLen).trim();
  if (start > 0) snippet = '…' + snippet;
  if (start + maxLen < cleaned.length) snippet += '…';
  return snippet;
}

/** Escape a string and wrap matched words in <mark>. */
export function highlight(text: string, words: string[]): string {
  const escaped = escapeHtml(text);
  if (!words.length) return escaped;
  return escaped.replace(wordRegex(words), (_full, pre: string, word: string) =>
    `${pre}<mark class="bg-ember/20 text-darkwood rounded-sm px-0.5">${word}</mark>`,
  );
}

/**
 * Rank items for a query.
 * All-word matches outrank partial matches; title hits outrank body hits.
 */
export function search(items: SearchItem[], query: string): SearchHit[] {
  const words = tokenize(query);
  if (words.length === 0) return [];

  const hits: SearchHit[] = [];

  for (const item of items) {
    const title = item.title;
    const description = item.description || '';
    const body = item.text || '';
    let titleHits = 0;
    let descHits = 0;
    let bodyHits = 0;

    for (const w of words) {
      if (containsWord(title, w)) titleHits++;
      else if (containsWord(description, w)) descHits++;
      else if (containsWord(body, w)) bodyHits++;
    }

    const matched = titleHits + descHits + bodyHits;
    if (matched === 0) continue;

    const allWords = matched === words.length;
    let score = 0;
    if (allWords) score += 1000;
    score += titleHits * 100;
    score += descHits * 40;
    score += bodyHits * 10;
    score += matched; // prefer covering more of a longer query

    // Phrase bonus: the raw (punctuation-stripped) query appears as a run of words.
    const phrase = words.join(' ');
    if (phrase.length > 2) {
      const titleNorm = title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      const descNorm = description.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      if (titleNorm.includes(phrase)) score += 200;
      else if (descNorm.includes(phrase)) score += 50;
    }

    const snippetSource = description && (titleHits + descHits === words.length)
      ? description
      : body || description;
    const snippet = makeSnippet(snippetSource, words);

    hits.push({ item, score, allWords, snippet });
  }

  hits.sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title));
  return hits;
}
