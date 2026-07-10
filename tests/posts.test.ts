import { describe, expect, it } from 'vitest';
import {
  getAdjacentPosts,
  getAllTags,
  groupPostsByYear,
  sortAndFilterPosts,
} from '../src/lib/posts';

const post = (id: string, date: string, draft = false, tags = ['Astro']) => ({
  id,
  data: {
    title: id,
    description: `${id} description`,
    publishedAt: new Date(date),
    tags,
    draft,
    featured: false,
  },
});

describe('post helpers', () => {
  it('removes drafts and sorts newest first', () => {
    const result = sortAndFilterPosts([
      post('old', '2025-01-01'),
      post('draft', '2027-01-01', true),
      post('new', '2026-01-01'),
    ] as never);

    expect(result.map((item) => item.id)).toEqual(['new', 'old']);
  });

  it('groups posts by descending year', () => {
    const groups = groupPostsByYear([
      post('a', '2025-01-01'),
      post('b', '2026-02-01'),
      post('c', '2026-01-01'),
    ] as never);

    expect([...groups.keys()]).toEqual([2026, 2025]);
    expect(groups.get(2026)?.map((item) => item.id)).toEqual(['b', 'c']);
  });

  it('counts normalized tags and finds adjacent entries', () => {
    const posts = sortAndFilterPosts([
      post('new', '2026-02-01', false, ['Astro', 'Design']),
      post('old', '2025-01-01', false, ['astro']),
    ] as never);

    expect(getAllTags(posts)).toEqual([
      { label: 'Astro', slug: 'astro', count: 2 },
      { label: 'Design', slug: 'design', count: 1 },
    ]);
    expect(getAdjacentPosts(posts, 'new').next?.id).toBe('old');
    expect(getAdjacentPosts(posts, 'new').previous).toBeUndefined();
  });
});
