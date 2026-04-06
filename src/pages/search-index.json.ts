import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

export const GET: APIRoute = async () => {
  const news = await getCollection('news');
  const payload = news.map((e) => ({
    slug: e.slug,
    title: e.data.title,
    subtitle: e.data.subtitle ?? '',
    excerpt: e.data.excerpt,
    category: e.data.category,
    tags: e.data.tags,
    date: e.data.date,
    author: e.data.author,
  }));
  return new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
