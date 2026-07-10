import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('production build', () => {
  for (const file of [
    'dist/index.html',
    'dist/diary/index.html',
    'dist/about/index.html',
    'dist/404.html',
  ]) {
    it(`emits ${file}`, () => expect(fs.existsSync(file)).toBe(true));
  }
});
