import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const diary = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/diary' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(20),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { diary };
