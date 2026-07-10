import { getCollection, type CollectionEntry } from 'astro:content';
import { sortAndFilterPosts } from './posts';

export type ContentPost = CollectionEntry<'blog'>;

export async function getPublishedPosts(): Promise<ContentPost[]> {
  return sortAndFilterPosts(await getCollection('blog'));
}
