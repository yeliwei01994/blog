import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('route inventory', () => {
  for (const route of [
    'index.astro',
    'diary/index.astro',
    'diary/[...id].astro',
    'about.astro',
    '404.astro',
  ]) {
    it(`contains ${route}`, () => {
      expect(fs.existsSync(`src/pages/${route}`)).toBe(true);
    });
  }

  for (const removedRoute of [
    'posts/index.astro',
    'archive/index.astro',
    'tags/index.astro',
    'search-index.json.ts',
  ]) {
    it(`removes ${removedRoute}`, () => {
      expect(fs.existsSync(`src/pages/${removedRoute}`)).toBe(false);
    });
  }
});
