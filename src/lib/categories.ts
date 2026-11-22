// Product categories. To add a category, add it here; the schema enum,
// the /products overview and the category routes all read from this list.
export const CATEGORIES = [
  {
    slug: 'wood-boilers',
    title: 'Wood Boilers',
    description: 'Vedolux natural draft and lambda-controlled wood gasification boilers.',
    cta: 'View Wood Boilers',
    cardImage: 'contain',
    showCardEyebrow: true,
  },
  {
    slug: 'thermal-storage',
    title: 'Thermal Storage',
    description: 'Insulated accumulator tanks for efficient batch burning and constant heat.',
    cta: 'View Storage',
    cardImage: 'contain',
    showCardEyebrow: true,
  },
  {
    slug: 'pellet-boilers',
    title: 'Pellet Boilers',
    description: 'Pellmax pellet boilers for efficient automated heating.',
    cta: 'View Pellet Boilers',
    cardImage: 'contain',
    showCardEyebrow: true,
  },
  {
    slug: 'heating-accessories',
    title: 'Heating Accessories',
    description: 'Controls, loading units, piping components, and other system accessories.',
    cta: 'View Accessories',
    cardImage: 'cover',
    showCardEyebrow: false,
  },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as unknown as [CategorySlug, ...CategorySlug[]];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
