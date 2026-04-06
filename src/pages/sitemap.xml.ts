import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { CATEGORIES } from '../data/categories';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL('https://techpulse.media')).origin;

  const staticPaths = [
    '/',
    '/about/',
    '/archive/',
    '/authors/',
    '/contacts/',
    '/editorial/',
    '/materials/',
    '/privacy/',
    '/search/',
    '/terms/',
  ];

  const news = await getCollection('news');
  const authors = await getCollection('authors');

  const locs: string[] = [
    ...staticPaths.map((p) => new URL(p, base).href),
    ...CATEGORIES.map((c) => new URL(`/category/${c.slug}/`, base).href),
    ...news.map((n) => new URL(`/news/${n.slug}/`, base).href),
    ...authors.map((a) => new URL(`/authors/${a.slug}/`, base).href),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locs.map((loc) => `  <url><loc>${loc}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
