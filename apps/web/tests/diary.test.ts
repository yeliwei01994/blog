import { describe, expect, it } from 'vitest';
import { getAdjacentEntries, sortAndFilterEntries } from '../src/features/diary/diary-utils';
import type { DiaryArticle } from '../src/features/diary/diary-types';

const entry = (id: string, date: string, draft = false) => ({
  id,
  title: id,
  description: `${id} description`,
  publishedAt: date,
  draft,
  html: '',
  headings: [],
});

describe('diary helpers', () => {
  it('removes drafts and sorts newest entries first', () => {
    const result = sortAndFilterEntries([
      entry('old', '2025-01-01'),
      entry('draft', '2027-01-01', true),
      entry('new', '2026-01-01'),
    ]);
    expect(result.map((item) => item.id)).toEqual(['new', 'old']);
  });

  it('finds adjacent diary entries', () => {
    const entries = sortAndFilterEntries([
      entry('new', '2026-02-01'),
      entry('old', '2025-01-01'),
    ]);
    expect(getAdjacentEntries(entries, 'new').next?.id).toBe('old');
    expect(getAdjacentEntries(entries, 'new').previous).toBeUndefined();
  });

  it('sorts generated article data with ISO publication dates', () => {
    const articles: DiaryArticle[] = [
      { id: 'old', title: 'Old', description: '', publishedAt: '2025-01-01', draft: false, html: '', headings: [] },
      { id: 'new', title: 'New', description: '', publishedAt: '2026-01-01', draft: false, html: '', headings: [] },
    ];

    expect(sortAndFilterEntries(articles).map((article) => article.id)).toEqual(['new', 'old']);
  });
});
