import type { CollectionEntry } from 'astro:content';

export function relatedNews(
  current: CollectionEntry<'news'>,
  all: CollectionEntry<'news'>[],
  limit = 4,
): CollectionEntry<'news'>[] {
  const { category, tags, slug } = current.data;
  const tagSet = new Set(tags ?? []);
  return all
    .filter((p) => p.slug !== slug)
    .map((p) => {
      let score = 0;
      if (p.data.category === category) score += 3;
      for (const t of p.data.tags ?? []) {
        if (tagSet.has(t)) score += 2;
      }
      return { entry: p, score };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        new Date(b.entry.data.date).getTime() - new Date(a.entry.data.date).getTime(),
    )
    .slice(0, limit)
    .map((x) => x.entry);
}
