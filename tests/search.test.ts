import { describe, expect, it } from 'vitest';
import { filterSearchEntries, normalizeSearchText } from '../src/scripts/search';

const entries = [
  { title: 'Astro 内容工作流', description: '类型安全的静态博客', href: '/posts/astro/', tags: ['TypeScript'] },
  { title: '设计约束', description: '少即是多', href: '/posts/design/', tags: ['Design'] },
];

describe('search helpers', () => {
  it('normalizes case and surrounding whitespace', () => {
    expect(normalizeSearchText('  Astro 内容  ')).toBe('astro 内容');
  });

  it('matches title, description, and tag text', () => {
    expect(filterSearchEntries(entries, 'typescript').map((entry) => entry.href)).toEqual(['/posts/astro/']);
    expect(filterSearchEntries(entries, '少即是多').map((entry) => entry.href)).toEqual(['/posts/design/']);
  });
});
