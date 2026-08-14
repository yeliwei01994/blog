import type { DiaryArticle } from './diary-types';

export type DiaryEntry = Pick<DiaryArticle, 'id' | 'title' | 'description' | 'publishedAt' | 'draft'>;

export function sortAndFilterEntries<T extends DiaryEntry>(entries: T[]): T[] {
  return entries
    .filter((entry) => !entry.draft)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getAdjacentEntries<T extends DiaryEntry>(entries: T[], id: string) {
  const index = entries.findIndex((entry) => entry.id === id);
  return {
    previous: index > 0 ? entries[index - 1] : undefined,
    next: index >= 0 && index < entries.length - 1 ? entries[index + 1] : undefined,
  };
}
