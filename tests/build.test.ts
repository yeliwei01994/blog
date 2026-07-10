import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('production build', () => {
  for (const file of [
    'dist/index.html',
    'dist/posts/index.html',
    'dist/archive/index.html',
    'dist/tags/index.html',
    'dist/about/index.html',
    'dist/404.html',
    'dist/search-index.json',
    'dist/posts/astro-content-workflow/index.html',
  ]) {
    it(`emits ${file}`, () => expect(fs.existsSync(file)).toBe(true));
  }
});
