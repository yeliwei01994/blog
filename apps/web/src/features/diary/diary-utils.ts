export interface DiaryEntryData {
  title: string;
  description: string;
  publishedAt: Date;
  updatedAt?: Date;
  cover?: string;
  draft: boolean;
}

export interface DiaryEntry {
  id: string;
  data: DiaryEntryData;
}

export function sortAndFilterEntries<T extends DiaryEntry>(entries: T[]): T[] {
  return entries
    .filter((entry) => !entry.data.draft)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export function getAdjacentEntries<T extends DiaryEntry>(entries: T[], id: string) {
  const index = entries.findIndex((entry) => entry.id === id);
  return {
    previous: index > 0 ? entries[index - 1] : undefined,
    next: index >= 0 && index < entries.length - 1 ? entries[index + 1] : undefined,
  };
}
