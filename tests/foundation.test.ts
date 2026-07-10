import { describe, expect, it } from 'vitest';
import { SITE } from '../src/config/site';

describe('site configuration', () => {
  it('defines a usable editorial identity', () => {
    expect(SITE.title.length).toBeGreaterThan(0);
    expect(SITE.description.length).toBeGreaterThan(20);
    expect(SITE.nav.map((item) => item.href)).toEqual(['/', '/diary/', '/about/']);
  });
});
