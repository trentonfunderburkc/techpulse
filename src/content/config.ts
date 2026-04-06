import { defineCollection, z } from 'astro:content';

export const collections = {
  news: defineCollection({
    type: 'content',
    schema: z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      author: z.string(),
      author_slug: z.string(),
      date: z.string(),
      updated_at: z.string().optional(),
      category: z.string(),
      tags: z.array(z.string()).default([]),
      source_name: z.string(),
      source_url: z.string().url(),
      source_published_at: z.string().optional(),
      excerpt: z.string(),
      image: z.string(),
      image_alt: z.string().optional(),
      featured: z.boolean().default(false),
      popular: z.boolean().default(false),
      verified: z.boolean().default(true),
    }),
  }),
  authors: defineCollection({
    type: 'content',
    schema: z.object({
      name: z.string(),
      role: z.string(),
      bio: z.string(),
      topics: z.array(z.string()),
      email: z.string().email().optional(),
    }),
  }),
};
