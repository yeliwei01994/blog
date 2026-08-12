import { describe, expect, it } from 'vitest';
import { getAdjacentEntries, sortAndFilterEntries } from '../src/features/diary/diary-utils';

const entry = (id: string, date: string, draft = false) => ({
  id,
  data: {
    title: id,
    description: `${id} description`,
    publishedAt: new Date(date),
    draft,
  },
});

describe('diary helpers', () => {
  it('removes drafts and sorts newest entries first', () => {
    const result = sortAndFilterEntries([
      entry('old', '2025-01-01'),
      entry('draft', '2027-01-01', true),
      entry('new', '2026-01-01'),
    ] as never);
    expect(result.map((item) => item.id)).toEqual(['new', 'old']);
  });

  it('finds adjacent diary entries', () => {
    const entries = sortAndFilterEntries([
      entry('new', '2026-02-01'),
      entry('old', '2025-01-01'),
    ] as never);
    expect(getAdjacentEntries(entries, 'new').next?.id).toBe('old');
    expect(getAdjacentEntries(entries, 'new').previous).toBeUndefined();
  });
});
