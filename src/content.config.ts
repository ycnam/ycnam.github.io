import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/data/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

const works = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/data/works' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(['Motion picture', 'Information design', 'Graphic design', 'D+programing']),
    order: z.number(),
    year: z.string().optional(),
    credits: z.string().optional(),
    vimeoIds: z.array(z.string()).default([]),
    hasP5Sketch: z.boolean().default(false),
    galleryImages: z.array(z.string()).default([]),
  }),
});

export const collections = { blog, works };
