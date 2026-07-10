export interface BlogPostData {
  title: string;
  description: string;
  publishedAt: Date;
  updatedAt?: Date;
  tags: string[];
  cover?: string;
  featured: boolean;
  draft: boolean;
}

export interface BlogPost {
  id: string;
  data: BlogPostData;
}

export interface TagSummary {
  label: string;
  slug: string;
  count: number;
}

export function sortAndFilterPosts<T extends BlogPost>(posts: T[]): T[] {
  return posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export function tagToSlug(tag: string): string {
  return tag.trim().toLocaleLowerCase('zh-CN').replace(/\s+/g, '-');
}

export function getAllTags<T extends BlogPost>(posts: T[]): TagSummary[] {
  const tags = new Map<string, TagSummary>();

  for (const post of posts) {
    for (const rawTag of post.data.tags) {
      const label = rawTag.trim();
      const slug = tagToSlug(label);
      const existing = tags.get(slug);
      tags.set(slug, existing ? { ...existing, count: existing.count + 1 } : { label, slug, count: 1 });
    }
  }

  return [...tags.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'zh-CN'));
}

export function groupPostsByYear<T extends BlogPost>(posts: T[]): Map<number, T[]> {
  const groups = new Map<number, T[]>();

  for (const post of [...posts].sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  )) {
    const year = post.data.publishedAt.getFullYear();
    groups.set(year, [...(groups.get(year) ?? []), post]);
  }

  return groups;
}

export function getAdjacentPosts<T extends BlogPost>(posts: T[], id: string) {
  const index = posts.findIndex((post) => post.id === id);

  return {
    previous: index > 0 ? posts[index - 1] : undefined,
    next: index >= 0 && index < posts.length - 1 ? posts[index + 1] : undefined,
  };
}
