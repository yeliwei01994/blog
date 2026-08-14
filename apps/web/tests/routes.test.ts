import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('React route inventory', () => {
  for (const route of ['HomePage.tsx', 'DiaryIndexPage.tsx', 'DiaryArticlePage.tsx', 'AboutPage.tsx', 'GuestbookPage.tsx', 'NotFoundPage.tsx']) {
    it(`contains ${route}`, () => expect(fs.existsSync(`src/app/pages/${route}`)).toBe(true));
  }

  it('removes Astro page sources', () => {
    expect(fs.existsSync('src/pages/index.astro')).toBe(false);
    expect(fs.existsSync('astro.config.mjs')).toBe(false);
  });
});
