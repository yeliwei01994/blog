import { getCollection, type CollectionEntry } from 'astro:content';
import { sortAndFilterEntries } from './diary-utils';

export type ContentDiaryEntry = CollectionEntry<'diary'>;

export async function getPublishedDiaryEntries(): Promise<ContentDiaryEntry[]> {
  return sortAndFilterEntries(await getCollection('diary'));
}
