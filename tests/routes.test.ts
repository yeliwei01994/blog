import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('route inventory', () => {
  for (const route of [
    'index.astro',
    'posts/index.astro',
    'archive/index.astro',
    'tags/index.astro',
    'tags/[tag].astro',
    'about.astro',
    '404.astro',
  ]) {
    it(`contains ${route}`, () => {
      expect(fs.existsSync(`src/pages/${route}`)).toBe(true);
    });
  }
});
