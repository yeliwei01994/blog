import { describe, expect, it } from 'vitest';
import { withBase } from '../src/lib/urls';

describe('base path URLs', () => {
  it('prefixes project Pages routes exactly once', () => {
    expect(withBase('/posts/', '/blog/')).toBe('/blog/posts/');
    expect(withBase('/blog/posts/', '/blog/')).toBe('/blog/posts/');
  });

  it('keeps root deployment paths clean', () => {
    expect(withBase('/images/cover.svg', '/')).toBe('/images/cover.svg');
  });
});
