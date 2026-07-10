// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://yeliwei01994.github.io',
  output: 'static',
  integrations: [mdx()],
  markdown: {
    shikiConfig: { theme: 'github-dark' },
  },
});
